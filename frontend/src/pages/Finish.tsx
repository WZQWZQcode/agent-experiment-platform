/**
 * 完成页面
 */
import React from 'react';

interface FinishProps {
  participantId: string;
}

export const Finish: React.FC<FinishProps> = ({ participantId }) => {
  return (
    <div className="min-h-screen bg-agent-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-agent-panel border border-agent-border rounded-lg p-8 text-center">
        <div className="text-6xl mb-6">✓</div>
        <h1 className="text-3xl font-bold text-agent-text mb-4">
          实验完成
        </h1>
        <p className="text-gray-400 mb-6">
          感谢您的参与！您的数据已成功记录。
        </p>

        <div className="bg-agent-bg border border-agent-border rounded-lg p-6 mb-6">
          <div className="text-sm text-gray-400 mb-2">完成码</div>
          <div className="text-2xl font-mono text-agent-accent">
            {participantId.slice(0, 8).toUpperCase()}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            请保存此完成码以便后续查询
          </div>
        </div>

        <div className="text-sm text-gray-400">
          您可以关闭此页面
        </div>
      </div>
    </div>
  );
};
