/**
 * 管理面板
 */
import React, { useState, useEffect } from 'react';
import { api } from '../api';

interface AdminProps {
  onClose: () => void;
}

export const Admin: React.FC<AdminProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  const handleLogin = () => {
    if (password === 'admin') {
      setAuthenticated(true);
    } else {
      alert('密码错误');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [participantsData, statsData] = await Promise.all([
        api.getParticipants(),
        api.getStats()
      ]);
      setParticipants(participantsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  const handleClearDatabase = async () => {
    if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      return;
    }
    if (!confirm('再次确认：真的要删除所有数据吗？')) {
      return;
    }

    try {
      await api.clearDatabase();
      alert('数据库已清空');
      loadData();
    } catch (error) {
      console.error('Failed to clear database:', error);
      alert('清空失败');
    }
  };

  const handleExport = (format: 'wide' | 'eventlog' | 'json') => {
    const urls = {
      wide: '/api/export/wide.csv',
      eventlog: '/api/export/eventlog.csv',
      json: '/api/export/all.json'
    };
    window.open(urls[format], '_blank');
  };

  if (!authenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-agent-panel border border-agent-border rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-agent-text mb-4">管理面板</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="输入密码"
            className="w-full bg-agent-bg border border-agent-border rounded px-3 py-2 text-agent-text mb-4"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleLogin}
              className="flex-1 py-2 bg-agent-accent text-white rounded hover:bg-blue-600 transition-colors"
            >
              登录
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-agent-panel border border-agent-border rounded-lg p-8 max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-agent-text">管理面板</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">加载中...</div>
        ) : (
          <>
            {/* 统计信息 */}
            {stats && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-agent-bg border border-agent-border rounded-lg p-4">
                  <div className="text-sm text-gray-400">总参与者</div>
                  <div className="text-2xl font-bold text-agent-text">{stats.total_participants}</div>
                </div>
                <div className="bg-agent-bg border border-agent-border rounded-lg p-4">
                  <div className="text-sm text-gray-400">已完成</div>
                  <div className="text-2xl font-bold text-green-500">{stats.completed_participants}</div>
                </div>
                <div className="bg-agent-bg border border-agent-border rounded-lg p-4">
                  <div className="text-sm text-gray-400">总试次</div>
                  <div className="text-2xl font-bold text-agent-text">{stats.total_trials}</div>
                </div>
                <div className="bg-agent-bg border border-agent-border rounded-lg p-4">
                  <div className="text-sm text-gray-400">总事件</div>
                  <div className="text-2xl font-bold text-agent-text">{stats.total_events}</div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => handleExport('wide')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                导出 Wide CSV
              </button>
              <button
                onClick={() => handleExport('eventlog')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                导出 EventLog CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                导出 JSON
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                刷新
              </button>
              <button
                onClick={handleClearDatabase}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors ml-auto"
              >
                清空数据库
              </button>
            </div>

            {/* 参与者列表 */}
            <div className="bg-agent-bg border border-agent-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-agent-text mb-4">参与者列表</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-agent-border">
                      <th className="text-left py-2 px-2 text-gray-400">ID</th>
                      <th className="text-left py-2 px-2 text-gray-400">创建时间</th>
                      <th className="text-left py-2 px-2 text-gray-400">Bundle</th>
                      <th className="text-left py-2 px-2 text-gray-400">Shuffle</th>
                      <th className="text-left py-2 px-2 text-gray-400">Radar</th>
                      <th className="text-left py-2 px-2 text-gray-400">Metric</th>
                      <th className="text-left py-2 px-2 text-gray-400">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p) => (
                      <tr key={p.participant_id} className="border-b border-agent-border">
                        <td className="py-2 px-2 text-agent-text font-mono text-xs">
                          {p.participant_id.slice(0, 8)}
                        </td>
                        <td className="py-2 px-2 text-gray-400">
                          {new Date(p.created_at).toLocaleString()}
                        </td>
                        <td className="py-2 px-2">
                          {p.conditions.bundle_mode ? '✓' : '×'}
                        </td>
                        <td className="py-2 px-2">
                          {p.conditions.shuffle_enabled ? '✓' : '×'}
                        </td>
                        <td className="py-2 px-2">
                          {p.conditions.radar_enabled ? '✓' : '×'}
                        </td>
                        <td className="py-2 px-2">
                          {p.conditions.metric_enabled ? '✓' : '×'}
                        </td>
                        <td className="py-2 px-2">
                          {p.completed ? (
                            <span className="text-green-500">已完成</span>
                          ) : (
                            <span className="text-yellow-500">进行中</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
