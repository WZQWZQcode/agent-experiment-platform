/**
 * 雷达图/系统状态面板
 */
import React from 'react';
import { Condition } from '../types';

interface RadarPanelProps {
  condition: Condition;
  currentRound: number;
  totalRounds: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export const RadarPanel: React.FC<RadarPanelProps> = ({
  condition,
  currentRound,
  totalRounds,
  onOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [openTime, setOpenTime] = React.useState<number>(0);

  const handleToggle = () => {
    if (!isOpen) {
      setOpenTime(Date.now());
      onOpen?.();
    } else {
      const duration = Date.now() - openTime;
      onClose?.();
    }
    setIsOpen(!isOpen);
  };

  if (!condition.radar_enabled) {
    return null;
  }

  return (
    <div className="bg-agent-panel border border-agent-border rounded-lg p-4">
      <button
        onClick={handleToggle}
        className="w-full text-left font-medium text-agent-text hover:text-agent-accent transition-colors"
      >
        {isOpen ? '▼' : '▶'} System Status
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <div className="text-gray-400">Current Mode</div>
            <div className="text-agent-text">
              {condition.bundle_mode ? 'Bundling' : 'Step-by-step'}
              {condition.shuffle_enabled ? ' / Shuffle enabled' : ''}
            </div>
          </div>

          <div>
            <div className="text-gray-400">Progress</div>
            <div className="text-agent-text">
              Round {currentRound} / {totalRounds}
            </div>
          </div>

          <div>
            <div className="text-gray-400">Task Pool Distribution</div>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 bg-blue-900 h-8 rounded flex items-center justify-center text-xs">
                Choice
              </div>
              <div className="flex-1 bg-green-900 h-8 rounded flex items-center justify-center text-xs">
                Text
              </div>
              <div className="flex-1 bg-purple-900 h-8 rounded flex items-center justify-center text-xs">
                Extract
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            Agent is preparing next step...
          </div>
        </div>
      )}
    </div>
  );
};
