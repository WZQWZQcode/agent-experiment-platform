/**
 * 任务卡片组件
 */
import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  onClick: () => void;
  completed?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isActive, onClick, completed }) => {
  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Choice';
      case 'text_generation':
        return 'Text';
      case 'information_extraction':
        return 'Extract';
      default:
        return 'Task';
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'bg-blue-900';
      case 'text_generation':
        return 'bg-green-900';
      case 'information_extraction':
        return 'bg-purple-900';
      default:
        return 'bg-gray-900';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-3 rounded-lg border cursor-pointer transition-all
        ${isActive ? 'border-agent-accent bg-agent-panel' : 'border-agent-border bg-agent-bg'}
        ${completed ? 'opacity-50' : ''}
        hover:border-agent-accent
      `}
    >
      <div className="flex items-center justify-between">
        <div className={`text-xs px-2 py-1 rounded ${getTaskTypeColor(task.task_type)}`}>
          {getTaskTypeLabel(task.task_type)}
        </div>
        {completed && (
          <div className="text-xs text-green-500">✓ Completed</div>
        )}
      </div>
      <div className="mt-2 text-sm text-agent-text line-clamp-2">
        {task.question || task.prompt || 'Task'}
      </div>
    </div>
  );
};
