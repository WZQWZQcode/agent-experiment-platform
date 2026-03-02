/**
 * 进度条组件
 */
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      {label && (
        <div className="text-sm text-agent-text mb-2">
          {label}: {current}/{total}
        </div>
      )}
      <div className="w-full bg-agent-border rounded-full h-2">
        <div
          className="bg-agent-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
