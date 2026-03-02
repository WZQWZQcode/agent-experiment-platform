/**
 * 微问卷页面（每轮后）
 */
import React, { useState } from 'react';
import { api } from '../api';
import { SurveyData } from '../types';

interface SurveyProps {
  participantId: string;
  roundIndex: number;
  onComplete: () => void;
}

export const Survey: React.FC<SurveyProps> = ({ participantId, roundIndex, onComplete }) => {
  const [answers, setAnswers] = useState<SurveyData>({
    stress: 4,
    fatigue: 4,
    control: 4,
    difficulty: 4
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.logEvent(participantId, 'SURVEY_SUBMIT', { round_index: roundIndex, answers });
      await api.submitSurvey(participantId, roundIndex, answers);
      onComplete();
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert('提交失败，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-agent-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-agent-panel border border-agent-border rounded-lg p-8">
        <h2 className="text-2xl font-bold text-agent-text mb-2">
          Round {roundIndex} 完成
        </h2>
        <p className="text-gray-400 mb-6">
          请回答以下几个简短问题（约30秒）
        </p>

        <div className="space-y-6">
          {/* 压力感 */}
          <div>
            <label className="block text-agent-text mb-3">
              1. 这一轮任务让我感到压力：
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">完全不同意</span>
              <input
                type="range"
                min="1"
                max="7"
                value={answers.stress}
                onChange={(e) => setAnswers({ ...answers, stress: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-400">完全同意</span>
              <span className="text-agent-accent font-medium w-8 text-center">{answers.stress}</span>
            </div>
          </div>

          {/* 疲劳感 */}
          <div>
            <label className="block text-agent-text mb-3">
              2. 这一轮任务让我感到疲劳：
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">完全不同意</span>
              <input
                type="range"
                min="1"
                max="7"
                value={answers.fatigue}
                onChange={(e) => setAnswers({ ...answers, fatigue: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-400">完全同意</span>
              <span className="text-agent-accent font-medium w-8 text-center">{answers.fatigue}</span>
            </div>
          </div>

          {/* 控制感 */}
          <div>
            <label className="block text-agent-text mb-3">
              3. 我对任务的顺序和节奏有足够的控制：
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">完全不同意</span>
              <input
                type="range"
                min="1"
                max="7"
                value={answers.control}
                onChange={(e) => setAnswers({ ...answers, control: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-400">完全同意</span>
              <span className="text-agent-accent font-medium w-8 text-center">{answers.control}</span>
            </div>
          </div>

          {/* 难度感 */}
          <div>
            <label className="block text-agent-text mb-3">
              4. 这一轮任务的难度适中：
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">完全不同意</span>
              <input
                type="range"
                min="1"
                max="7"
                value={answers.difficulty}
                onChange={(e) => setAnswers({ ...answers, difficulty: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm text-gray-400">完全同意</span>
              <span className="text-agent-accent font-medium w-8 text-center">{answers.difficulty}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-8 py-3 bg-agent-accent text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {loading ? '提交中...' : '继续'}
        </button>
      </div>
    </div>
  );
};
