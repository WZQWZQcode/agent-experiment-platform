/**
 * 任务主界面
 * 这是实验的核心界面，处理所有任务交互
 */
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Task, Bundle, Condition, TaskResponse } from '../types';
import { TaskCard } from '../components/TaskCard';
import { RadarPanel } from '../components/RadarPanel';
import { ProgressBar } from '../components/ProgressBar';

interface TaskArenaProps {
  participantId: string;
  condition: Condition;
  onRoundComplete: (roundIndex: number) => void;
  onAllComplete: () => void;
}

export const TaskArena: React.FC<TaskArenaProps> = ({
  participantId,
  condition,
  onRoundComplete,
  onAllComplete
}) => {
  // 状态管理
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [bundleTasks, setBundleTasks] = useState<Task[]>([]);
  const [bundleId, setBundleId] = useState<string>('');
  const [currentRound, setCurrentRound] = useState(1);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [response, setResponse] = useState<TaskResponse>({});
  const [loading, setLoading] = useState(false);
  const [taskStartTime, setTaskStartTime] = useState<Date>(new Date());
  const [firstInputTime, setFirstInputTime] = useState<Date | null>(null);
  const [pageFocusTime, setPageFocusTime] = useState(0);
  const [shuffleUsed, setShuffleUsed] = useState(0);

  // Refs
  const pageFocusStartRef = useRef<number>(Date.now());
  const isPageFocusedRef = useRef<boolean>(true);

  // 加载下一个任务/任务包
  const loadNextTask = async () => {
    setLoading(true);
    try {
      const result = await api.getNextTask(participantId);

      if (result.completed) {
        onAllComplete();
        return;
      }

      setCurrentRound(result.round_index);

      if (result.bundle_mode) {
        // Bundle模式
        setBundleTasks(result.tasks);
        setBundleId(result.bundle_id);
        setCurrentTask(result.tasks[0]);
        setActiveTaskIndex(0);
        await api.logEvent(participantId, 'BUNDLE_VIEW', {
          bundle_id: result.bundle_id,
          tasks: result.tasks.map((t: Task) => t.task_id)
        });
      } else {
        // 单步模式
        setCurrentTask(result.task);
        setBundleTasks([]);
        await api.logEvent(participantId, 'TASK_VIEW', {
          task_id: result.task.task_id
        });
      }

      setTaskStartTime(new Date());
      setFirstInputTime(null);
      setShuffleUsed(0);
      setResponse({});
    } catch (error) {
      console.error('Failed to load task:', error);
    }
    setLoading(false);
  };

  // 初始加载
  useEffect(() => {
    loadNextTask();

    // 页面焦点监听
    const handleFocus = () => {
      isPageFocusedRef.current = true;
      pageFocusStartRef.current = Date.now();
      api.logEvent(participantId, 'PAGE_FOCUS', {});
    };

    const handleBlur = () => {
      if (isPageFocusedRef.current) {
        const duration = Date.now() - pageFocusStartRef.current;
        setPageFocusTime(prev => prev + duration);
        api.logEvent(participantId, 'PAGE_BLUR', { duration_ms: duration });
      }
      isPageFocusedRef.current = false;
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [participantId]);

  // 处理首次输入
  const handleFirstInput = () => {
    if (!firstInputTime) {
      setFirstInputTime(new Date());
      api.logEvent(participantId, 'FIRST_INPUT', {
        task_id: currentTask?.task_id,
        latency_ms: Date.now() - taskStartTime.getTime()
      });
    }
  };

  // 切换Bundle内的任务
  const handleTaskSwitch = (index: number) => {
    if (index === activeTaskIndex) return;

    setActiveTaskIndex(index);
    setCurrentTask(bundleTasks[index]);
    setTaskStartTime(new Date());
    setFirstInputTime(null);
    setResponse({});

    api.logEvent(participantId, 'BUNDLE_SWITCH', {
      from_task: bundleTasks[activeTaskIndex].task_id,
      to_task: bundleTasks[index].task_id
    });
  };

  // 提交任务
  const handleSubmit = async () => {
    if (!currentTask) return;

    // 验证响应
    if (currentTask.task_type === 'multiple_choice' && response.selected_index === undefined) {
      alert('请选择一个答案');
      return;
    }
    if (currentTask.task_type === 'text_generation' && (!response.text || response.text.length < 50)) {
      alert('请至少输入50字');
      return;
    }
    if (currentTask.task_type === 'information_extraction') {
      const fields = currentTask.fields || [];
      const filledCount = Object.keys(response.fields || {}).filter(k => response.fields![k]).length;
      if (filledCount < fields.length) {
        alert('请填写所有字段');
        return;
      }
    }

    setLoading(true);

    try {
      const endTime = new Date();
      const firstInputLatency = firstInputTime
        ? firstInputTime.getTime() - taskStartTime.getTime()
        : 0;

      // 提交响应
      await api.submitResponse({
        participant_id: participantId,
        round_index: currentRound,
        task_id: currentTask.task_id,
        task_type: currentTask.task_type,
        response: response,
        start_ts: taskStartTime.toISOString(),
        end_ts: endTime.toISOString(),
        first_input_latency_ms: firstInputLatency,
        page_focus_time_ms: pageFocusTime,
        shuffle_used: shuffleUsed,
        bundle_id: bundleId || undefined,
        position_in_bundle: bundleTasks.length > 0 ? activeTaskIndex : undefined
      });

      await api.logEvent(participantId, 'SUBMIT', {
        task_id: currentTask.task_id,
        duration_ms: endTime.getTime() - taskStartTime.getTime()
      });

      // 标记任务完成
      setCompletedTaskIds(prev => new Set([...prev, currentTask.task_id]));

      // 检查是否完成当前包/轮
      if (condition.bundle_mode) {
        const newCompleted = new Set([...completedTaskIds, currentTask.task_id]);
        const allBundleCompleted = bundleTasks.every(t => newCompleted.has(t.task_id));

        if (allBundleCompleted) {
          // 完成整个包
          await api.advanceTask(participantId, 3);
          setCompletedTaskIds(new Set());
          onRoundComplete(currentRound);
        } else {
          // 继续包内其他任务
          const nextIndex = bundleTasks.findIndex(t => !newCompleted.has(t.task_id));
          if (nextIndex !== -1) {
            handleTaskSwitch(nextIndex);
          }
        }
      } else {
        // 单步模式：直接进入下一个
        await api.advanceTask(participantId, 1);
        if (currentRound % 1 === 0) {
          // 每轮后显示问卷
          onRoundComplete(currentRound);
        } else {
          loadNextTask();
        }
      }
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('提交失败，请重试');
    }

    setLoading(false);
  };

  // 洗牌功能
  const handleShuffle = async () => {
    if (!condition.shuffle_enabled || !currentTask) return;

    setShuffleUsed(1);
    await api.logEvent(participantId, 'SHUFFLE_CLICK', {
      task_id: currentTask.task_id
    });

    // 简单实现：重新加载任务（实际应该从池中换一个不同类型的）
    alert('洗牌功能：将当前任务放回池底并抽取新任务');
    loadNextTask();
  };

  if (loading && !currentTask) {
    return (
      <div className="min-h-screen bg-agent-bg flex items-center justify-center">
        <div className="text-agent-text">加载中...</div>
      </div>
    );
  }

  if (!currentTask) {
    return null;
  }

  return (
    <div className="min-h-screen bg-agent-bg p-4">
      <div className="max-w-7xl mx-auto">
        {/* 顶部进度条 */}
        <div className="bg-agent-panel border border-agent-border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-agent-text font-medium">
              Round {currentRound} / 8
            </div>
            {condition.metric_enabled === 1 && (
              <div className="text-sm text-gray-400">
                ⏱ {Math.floor((Date.now() - taskStartTime.getTime()) / 1000)}s
              </div>
            )}
          </div>
          <ProgressBar current={currentRound} total={8} />
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* 左侧：任务列表（Bundle模式） */}
          {condition.bundle_mode === 1 && bundleTasks.length > 0 && (
            <div className="col-span-3 space-y-2">
              <div className="text-sm text-gray-400 mb-2">任务包</div>
              {bundleTasks.map((task, index) => (
                <TaskCard
                  key={task.task_id}
                  task={task}
                  isActive={index === activeTaskIndex}
                  onClick={() => handleTaskSwitch(index)}
                  completed={completedTaskIds.has(task.task_id)}
                />
              ))}
            </div>
          )}

          {/* 中间：任务交互区 */}
          <div className={condition.bundle_mode === 1 ? 'col-span-6' : 'col-span-9'}>
            <div className="bg-agent-panel border border-agent-border rounded-lg p-6">
              {/* 任务内容 */}
              <TaskContent
                task={currentTask}
                response={response}
                onResponseChange={setResponse}
                onFirstInput={handleFirstInput}
              />

              {/* 操作按钮 */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-agent-accent text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  {loading ? '提交中...' : '提交'}
                </button>
                {condition.shuffle_enabled === 1 && (
                  <button
                    onClick={handleShuffle}
                    disabled={loading || shuffleUsed > 0}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
                  >
                    🔀 换一题
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：雷达图/状态面板 */}
          <div className="col-span-3">
            <RadarPanel
              condition={condition}
              currentRound={currentRound}
              totalRounds={8}
              onOpen={() => api.logEvent(participantId, 'RADAR_OPEN', {})}
              onClose={() => api.logEvent(participantId, 'RADAR_CLOSE', {})}
            />

            {condition.metric_enabled === 1 && (
              <div className="mt-4 bg-agent-panel border border-agent-border rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">速度提示</div>
                <div className="text-agent-text">
                  你的进度处于中等水平
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 任务内容组件
interface TaskContentProps {
  task: Task;
  response: TaskResponse;
  onResponseChange: (response: TaskResponse) => void;
  onFirstInput: () => void;
}

const TaskContent: React.FC<TaskContentProps> = ({
  task,
  response,
  onResponseChange,
  onFirstInput
}) => {
  if (task.task_type === 'multiple_choice') {
    return (
      <div>
        <h3 className="text-xl text-agent-text mb-4">{task.question}</h3>
        <div className="space-y-2">
          {task.options?.map((option, index) => (
            <label
              key={index}
              className={`
                block p-4 border rounded-lg cursor-pointer transition-colors
                ${response.selected_index === index
                  ? 'border-agent-accent bg-agent-bg'
                  : 'border-agent-border hover:border-gray-500'
                }
              `}
            >
              <input
                type="radio"
                name="choice"
                checked={response.selected_index === index}
                onChange={() => {
                  onFirstInput();
                  onResponseChange({ selected_index: index });
                }}
                className="mr-3"
              />
              <span className="text-agent-text">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (task.task_type === 'text_generation') {
    return (
      <div>
        <h3 className="text-xl text-agent-text mb-4">短文本生成</h3>
        <p className="text-gray-400 mb-4">{task.prompt}</p>
        <textarea
          value={response.text || ''}
          onChange={(e) => {
            onFirstInput();
            onResponseChange({ text: e.target.value });
          }}
          placeholder="请输入你的回答（100-200字）"
          className="w-full h-48 bg-agent-bg border border-agent-border rounded-lg p-4 text-agent-text resize-none"
        />
        <div className="text-sm text-gray-400 mt-2">
          当前字数: {response.text?.length || 0}
        </div>
      </div>
    );
  }

  if (task.task_type === 'information_extraction') {
    return (
      <div>
        <h3 className="text-xl text-agent-text mb-4">信息抽取</h3>
        <div className="bg-agent-bg border border-agent-border rounded-lg p-4 mb-4">
          <p className="text-gray-300 whitespace-pre-wrap">{task.material}</p>
        </div>
        <div className="space-y-3">
          {task.fields?.map((field, index) => (
            <div key={index}>
              <label className="block text-sm text-gray-400 mb-2">
                {field.name}
              </label>
              <input
                type="text"
                value={response.fields?.[field.name] || ''}
                onChange={(e) => {
                  onFirstInput();
                  onResponseChange({
                    fields: {
                      ...response.fields,
                      [field.name]: e.target.value
                    }
                  });
                }}
                className="w-full bg-agent-bg border border-agent-border rounded px-3 py-2 text-agent-text"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
