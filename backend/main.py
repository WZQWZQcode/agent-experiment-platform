"""
FastAPI主应用
提供实验平台的所有API端点
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import uuid
import random
import io
import csv
import os

from database import (
    init_db, get_db, Participant, TrialWide, EventLog, Survey
)
from tasks_generator import TasksGenerator

# 初始化FastAPI应用
app = FastAPI(title="Agentic Workflow Experiment Platform")

# CORS配置 - 生产环境支持
# 从环境变量读取允许的源，默认允许所有（适合演示）
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
if allowed_origins == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化数据库
init_db()

# 初始化任务生成器
tasks_gen = TasksGenerator()

# 存储每个参与者的任务池（内存缓存）
participant_tasks = {}


# ============ Pydantic模型 ============

class ParticipantCreate(BaseModel):
    demographics: Optional[Dict[str, Any]] = None


class ConditionAssignment(BaseModel):
    participant_id: str


class EventCreate(BaseModel):
    participant_id: str
    event_type: str
    payload: Dict[str, Any]


class ResponseCreate(BaseModel):
    participant_id: str
    round_index: int
    task_id: str
    task_type: str
    response: Dict[str, Any]
    start_ts: str
    end_ts: str
    first_input_latency_ms: int
    page_focus_time_ms: int
    shuffle_used: int
    bundle_id: Optional[str] = None
    position_in_bundle: Optional[int] = None


class SurveyCreate(BaseModel):
    participant_id: str
    round_index: int
    survey_data: Dict[str, Any]


# ============ API端点 ============

@app.get("/")
def read_root():
    return {"message": "Agentic Workflow Experiment Platform API"}


@app.post("/participants")
def create_participant(data: ParticipantCreate, db: Session = Depends(get_db)):
    """创建新参与者"""
    participant_id = str(uuid.uuid4())

    # 随机分配实验条件（2x2设计：bundle x shuffle）
    # 其他条件默认关闭，可根据需要开启
    conditions = {
        'bundle_mode': random.choice([0, 1]),
        'shuffle_enabled': random.choice([0, 1]),
        'radar_enabled': 0,  # 默认关闭
        'metric_enabled': 0,  # 默认关闭
        'draw_mode': 0  # 默认关闭
    }

    participant = Participant(
        participant_id=participant_id,
        condition_json=json.dumps(conditions),
        demographics_json=json.dumps(data.demographics or {}),
        completed=0
    )

    db.add(participant)
    db.commit()

    return {
        "participant_id": participant_id,
        "conditions": conditions
    }


@app.post("/assign_condition")
def assign_condition(data: ConditionAssignment, db: Session = Depends(get_db)):
    """获取参与者的实验条件"""
    participant = db.query(Participant).filter(
        Participant.participant_id == data.participant_id
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    conditions = json.loads(participant.condition_json)

    # 生成任务池
    if data.participant_id not in participant_tasks:
        tasks = tasks_gen.generate_task_pool(data.participant_id, total_rounds=8)
        participant_tasks[data.participant_id] = {
            'tasks': tasks,
            'current_index': 0,
            'completed_rounds': 0
        }

    return {
        "participant_id": data.participant_id,
        "conditions": conditions
    }


@app.get("/tasks/next")
def get_next_task(participant_id: str, db: Session = Depends(get_db)):
    """获取下一个任务或任务包"""
    if participant_id not in participant_tasks:
        raise HTTPException(status_code=404, detail="Task pool not initialized")

    participant = db.query(Participant).filter(
        Participant.participant_id == participant_id
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    conditions = json.loads(participant.condition_json)
    task_data = participant_tasks[participant_id]
    tasks = task_data['tasks']
    current_index = task_data['current_index']

    # 检查是否完成所有任务
    if current_index >= len(tasks):
        return {
            "completed": True,
            "message": "All tasks completed"
        }

    # Bundle模式：返回3个任务
    if conditions['bundle_mode'] == 1:
        bundle_tasks = tasks[current_index:current_index + 3]
        bundle_id = f"bundle_{current_index // 3}"

        return {
            "completed": False,
            "bundle_mode": True,
            "bundle_id": bundle_id,
            "tasks": bundle_tasks,
            "round_index": (current_index // 3) + 1
        }
    else:
        # 单步模式：返回1个任务
        task = tasks[current_index]
        return {
            "completed": False,
            "bundle_mode": False,
            "task": task,
            "round_index": (current_index // 3) + 1
        }


@app.post("/tasks/advance")
def advance_task(participant_id: str, count: int = 1):
    """推进任务索引（完成任务后调用）"""
    if participant_id not in participant_tasks:
        raise HTTPException(status_code=404, detail="Task pool not initialized")

    participant_tasks[participant_id]['current_index'] += count

    return {"success": True}


@app.post("/events")
def create_event(data: EventCreate, db: Session = Depends(get_db)):
    """记录事件日志"""
    event = EventLog(
        participant_id=data.participant_id,
        ts=datetime.utcnow(),
        event_type=data.event_type,
        payload_json=json.dumps(data.payload)
    )

    db.add(event)
    db.commit()

    return {"success": True}


@app.post("/responses")
def create_response(data: ResponseCreate, db: Session = Depends(get_db)):
    """记录任务响应"""
    # 获取任务信息
    if data.participant_id not in participant_tasks:
        raise HTTPException(status_code=404, detail="Task pool not initialized")

    tasks = participant_tasks[data.participant_id]['tasks']
    task = next((t for t in tasks if t['task_id'] == data.task_id), None)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # 评估响应
    evaluation = tasks_gen.evaluate_response(task, data.response)

    # 获取参与者条件
    participant = db.query(Participant).filter(
        Participant.participant_id == data.participant_id
    ).first()
    conditions = json.loads(participant.condition_json)

    # 计算时长
    start = datetime.fromisoformat(data.start_ts.replace('Z', '+00:00'))
    end = datetime.fromisoformat(data.end_ts.replace('Z', '+00:00'))
    duration_ms = int((end - start).total_seconds() * 1000)

    # 保存到数据库
    trial = TrialWide(
        participant_id=data.participant_id,
        round_index=data.round_index,
        task_id=data.task_id,
        task_type=data.task_type,
        correct=evaluation['correct'],
        score=evaluation['score'],
        start_ts=start,
        end_ts=end,
        duration_ms=duration_ms,
        first_input_latency_ms=data.first_input_latency_ms,
        page_focus_time_ms=data.page_focus_time_ms,
        shuffle_used=data.shuffle_used,
        bundle_id=data.bundle_id,
        position_in_bundle=data.position_in_bundle,
        submitted_text_length=len(str(data.response)),
        rubric_hits_json=json.dumps(evaluation['rubric_hits']),
        bundle_mode=conditions['bundle_mode'],
        shuffle_enabled=conditions['shuffle_enabled'],
        radar_enabled=conditions['radar_enabled'],
        metric_enabled=conditions['metric_enabled'],
        draw_mode=conditions['draw_mode']
    )

    db.add(trial)
    db.commit()

    return {
        "success": True,
        "evaluation": evaluation
    }


@app.post("/survey")
def create_survey(data: SurveyCreate, db: Session = Depends(get_db)):
    """记录微问卷"""
    survey = Survey(
        participant_id=data.participant_id,
        round_index=data.round_index,
        survey_data_json=json.dumps(data.survey_data)
    )

    db.add(survey)
    db.commit()

    return {"success": True}


@app.post("/complete")
def complete_experiment(participant_id: str, db: Session = Depends(get_db)):
    """标记实验完成"""
    participant = db.query(Participant).filter(
        Participant.participant_id == participant_id
    ).first()

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    participant.completed = 1
    db.commit()

    return {"success": True}


# ============ 管理面板API ============

@app.get("/admin/participants")
def get_participants(db: Session = Depends(get_db)):
    """获取所有参与者"""
    participants = db.query(Participant).all()

    result = []
    for p in participants:
        result.append({
            'participant_id': p.participant_id,
            'created_at': p.created_at.isoformat(),
            'conditions': json.loads(p.condition_json),
            'demographics': json.loads(p.demographics_json),
            'completed': p.completed
        })

    return result


@app.get("/admin/stats")
def get_stats(db: Session = Depends(get_db)):
    """获取统计信息"""
    total_participants = db.query(Participant).count()
    completed_participants = db.query(Participant).filter(Participant.completed == 1).count()
    total_trials = db.query(TrialWide).count()
    total_events = db.query(EventLog).count()

    return {
        'total_participants': total_participants,
        'completed_participants': completed_participants,
        'total_trials': total_trials,
        'total_events': total_events
    }


@app.delete("/admin/clear")
def clear_database(db: Session = Depends(get_db)):
    """清空数据库（危险操作）"""
    db.query(EventLog).delete()
    db.query(TrialWide).delete()
    db.query(Survey).delete()
    db.query(Participant).delete()
    db.commit()

    # 清空内存缓存
    participant_tasks.clear()

    return {"success": True, "message": "Database cleared"}


# ============ 数据导出API ============

@app.get("/export/wide.csv")
def export_wide_csv(db: Session = Depends(get_db)):
    """导出宽表CSV"""
    trials = db.query(TrialWide).all()

    # 创建CSV
    output = io.StringIO()
    writer = csv.writer(output)

    # 写入表头
    writer.writerow([
        'participant_id', 'round_index', 'task_id', 'task_type',
        'correct', 'score', 'start_ts', 'end_ts', 'duration_ms',
        'first_input_latency_ms', 'page_focus_time_ms', 'shuffle_used',
        'bundle_id', 'position_in_bundle', 'submitted_text_length',
        'rubric_hits', 'bundle_mode', 'shuffle_enabled', 'radar_enabled',
        'metric_enabled', 'draw_mode'
    ])

    # 写入数据
    for trial in trials:
        writer.writerow([
            trial.participant_id, trial.round_index, trial.task_id, trial.task_type,
            trial.correct, trial.score, trial.start_ts, trial.end_ts, trial.duration_ms,
            trial.first_input_latency_ms, trial.page_focus_time_ms, trial.shuffle_used,
            trial.bundle_id, trial.position_in_bundle, trial.submitted_text_length,
            trial.rubric_hits_json, trial.bundle_mode, trial.shuffle_enabled,
            trial.radar_enabled, trial.metric_enabled, trial.draw_mode
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=wide.csv"}
    )


@app.get("/export/eventlog.csv")
def export_eventlog_csv(db: Session = Depends(get_db)):
    """导出事件日志CSV"""
    events = db.query(EventLog).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(['participant_id', 'ts', 'event_type', 'payload'])

    for event in events:
        writer.writerow([
            event.participant_id, event.ts, event.event_type, event.payload_json
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=eventlog.csv"}
    )


@app.get("/export/all.json")
def export_all_json(db: Session = Depends(get_db)):
    """导出所有数据JSON"""
    participants = db.query(Participant).all()
    trials = db.query(TrialWide).all()
    events = db.query(EventLog).all()
    surveys = db.query(Survey).all()

    data = {
        'participants': [
            {
                'participant_id': p.participant_id,
                'created_at': p.created_at.isoformat(),
                'conditions': json.loads(p.condition_json),
                'demographics': json.loads(p.demographics_json),
                'completed': p.completed
            }
            for p in participants
        ],
        'trials': [
            {
                'participant_id': t.participant_id,
                'round_index': t.round_index,
                'task_id': t.task_id,
                'task_type': t.task_type,
                'correct': t.correct,
                'score': t.score,
                'start_ts': t.start_ts.isoformat(),
                'end_ts': t.end_ts.isoformat(),
                'duration_ms': t.duration_ms,
                'first_input_latency_ms': t.first_input_latency_ms,
                'page_focus_time_ms': t.page_focus_time_ms,
                'shuffle_used': t.shuffle_used,
                'bundle_id': t.bundle_id,
                'position_in_bundle': t.position_in_bundle,
                'submitted_text_length': t.submitted_text_length,
                'rubric_hits': json.loads(t.rubric_hits_json),
                'bundle_mode': t.bundle_mode,
                'shuffle_enabled': t.shuffle_enabled,
                'radar_enabled': t.radar_enabled,
                'metric_enabled': t.metric_enabled,
                'draw_mode': t.draw_mode
            }
            for t in trials
        ],
        'events': [
            {
                'participant_id': e.participant_id,
                'ts': e.ts.isoformat(),
                'event_type': e.event_type,
                'payload': json.loads(e.payload_json)
            }
            for e in events
        ],
        'surveys': [
            {
                'participant_id': s.participant_id,
                'round_index': s.round_index,
                'survey_data': json.loads(s.survey_data_json),
                'submitted_at': s.submitted_at.isoformat()
            }
            for s in surveys
        ]
    }

    return data


if __name__ == "__main__":
    import uvicorn
    # 支持环境变量PORT（云平台部署需要）
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
