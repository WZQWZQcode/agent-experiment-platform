"""
数据库模型和连接管理
使用SQLAlchemy ORM + SQLite
"""
from sqlalchemy import create_engine, Column, String, Integer, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

# 数据库连接
DATABASE_URL = "sqlite:///./experiment.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Participant(Base):
    """参与者表"""
    __tablename__ = "participants"

    participant_id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    condition_json = Column(Text)  # JSON字符串：实验条件
    demographics_json = Column(Text)  # JSON字符串：人口统计信息
    completed = Column(Integer, default=0)  # 是否完成实验


class TrialWide(Base):
    """任务试次表（宽表）"""
    __tablename__ = "trials_wide"

    id = Column(Integer, primary_key=True, autoincrement=True)
    participant_id = Column(String, index=True)
    round_index = Column(Integer)  # 第几轮（1-8）
    task_id = Column(String)
    task_type = Column(String)  # multiple_choice, text_generation, information_extraction
    correct = Column(Integer)  # 是否正确（选择题/填空题）
    score = Column(Float)  # 得分（文本生成题）
    start_ts = Column(DateTime)
    end_ts = Column(DateTime)
    duration_ms = Column(Integer)
    first_input_latency_ms = Column(Integer)  # 首次输入延迟
    page_focus_time_ms = Column(Integer)  # 页面聚焦时间
    shuffle_used = Column(Integer, default=0)  # 是否使用了洗牌
    bundle_id = Column(String)  # 任务包ID
    position_in_bundle = Column(Integer)  # 在包内的位置
    submitted_text_length = Column(Integer)  # 提交文本长度
    rubric_hits_json = Column(Text)  # 命中的关键词（JSON）

    # 实验条件（冗余存储，便于分析）
    bundle_mode = Column(Integer)
    shuffle_enabled = Column(Integer)
    radar_enabled = Column(Integer)
    metric_enabled = Column(Integer)
    draw_mode = Column(Integer)


class EventLog(Base):
    """事件日志表（长表）"""
    __tablename__ = "eventlog"

    id = Column(Integer, primary_key=True, autoincrement=True)
    participant_id = Column(String, index=True)
    ts = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String, index=True)  # PAGE_FOCUS, TASK_VIEW, FIRST_INPUT等
    payload_json = Column(Text)  # 事件详细信息（JSON）


class Survey(Base):
    """微问卷表"""
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, autoincrement=True)
    participant_id = Column(String, index=True)
    round_index = Column(Integer)
    survey_data_json = Column(Text)  # 问卷答案（JSON）
    submitted_at = Column(DateTime, default=datetime.utcnow)


# 创建所有表
def init_db():
    Base.metadata.create_all(bind=engine)


# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
