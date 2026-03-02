/**
 * 欢迎/知情同意页面
 */
import React, { useState } from 'react';
import { api } from '../api';

interface WelcomeProps {
  onStart: (participantId: string) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const [agreed, setAgreed] = useState(false);
  const [demographics, setDemographics] = useState({
    age_range: '',
    gender: '',
    major: '',
    skill_level: 4
  });
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!agreed) {
      alert('请先同意参与实验');
      return;
    }

    setLoading(true);
    try {
      const result = await api.createParticipant(demographics);
      onStart(result.participant_id);
    } catch (error) {
      console.error('Failed to create participant:', error);
      alert('创建参与者失败，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-agent-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-agent-panel border border-agent-border rounded-lg p-8">
        <h1 className="text-3xl font-bold text-agent-text mb-6">
          Agentic Workflow 节奏治理实验
        </h1>

        <div className="space-y-4 text-agent-text mb-6">
          <p>
            欢迎参与本次实验。本实验旨在研究不同任务组织方式对工作节奏和效率的影响。
          </p>
          <p>
            实验将包含8轮知识型微任务，每轮约2-3分钟。任务类型包括选择题、短文本生成和信息抽取。
          </p>
          <p>
            您的所有数据将被严格保密，仅用于学术研究。
          </p>
        </div>

        <div className="bg-agent-bg border border-agent-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-agent-text mb-4">基本信息（可选）</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">年龄段</label>
              <select
                value={demographics.age_range}
                onChange={(e) => setDemographics({ ...demographics, age_range: e.target.value })}
                className="w-full bg-agent-panel border border-agent-border rounded px-3 py-2 text-agent-text"
              >
                <option value="">请选择</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45+">45+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">性别</label>
              <select
                value={demographics.gender}
                onChange={(e) => setDemographics({ ...demographics, gender: e.target.value })}
                className="w-full bg-agent-panel border border-agent-border rounded px-3 py-2 text-agent-text"
              >
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">专业背景</label>
              <input
                type="text"
                value={demographics.major}
                onChange={(e) => setDemographics({ ...demographics, major: e.target.value })}
                placeholder="例如：计算机科学"
                className="w-full bg-agent-panel border border-agent-border rounded px-3 py-2 text-agent-text"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                自评技术能力 (1-7): {demographics.skill_level}
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={demographics.skill_level}
                onChange={(e) => setDemographics({ ...demographics, skill_level: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>初学者</span>
                <span>专家</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start mb-6">
          <input
            type="checkbox"
            id="consent"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 mr-3"
          />
          <label htmlFor="consent" className="text-sm text-agent-text">
            我已阅读并理解实验说明，自愿参与本次实验，同意研究团队使用我的匿名数据进行学术研究。
          </label>
        </div>

        <button
          onClick={handleStart}
          disabled={!agreed || loading}
          className={`
            w-full py-3 rounded-lg font-medium transition-colors
            ${agreed && !loading
              ? 'bg-agent-accent text-white hover:bg-blue-600'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {loading ? '正在初始化...' : '开始实验'}
        </button>
      </div>
    </div>
  );
};
