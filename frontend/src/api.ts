/**
 * API调用封装
 */

// 环境变量配置：生产环境使用环境变量，开发环境使用本地代理
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  // 创建参与者
  createParticipant: async (demographics?: any) => {
    const response = await fetch(`${API_BASE}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demographics })
    });
    return response.json();
  },

  // 获取实验条件
  assignCondition: async (participant_id: string) => {
    const response = await fetch(`${API_BASE}/assign_condition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id })
    });
    return response.json();
  },

  // 获取下一个任务
  getNextTask: async (participant_id: string) => {
    const response = await fetch(`${API_BASE}/tasks/next?participant_id=${participant_id}`);
    return response.json();
  },

  // 推进任务
  advanceTask: async (participant_id: string, count: number = 1) => {
    const response = await fetch(`${API_BASE}/tasks/advance?participant_id=${participant_id}&count=${count}`, {
      method: 'POST'
    });
    return response.json();
  },

  // 记录事件
  logEvent: async (participant_id: string, event_type: string, payload: any) => {
    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id, event_type, payload })
    });
    return response.json();
  },

  // 提交任务响应
  submitResponse: async (data: any) => {
    const response = await fetch(`${API_BASE}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // 提交问卷
  submitSurvey: async (participant_id: string, round_index: number, survey_data: any) => {
    const response = await fetch(`${API_BASE}/survey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id, round_index, survey_data })
    });
    return response.json();
  },

  // 完成实验
  completeExperiment: async (participant_id: string) => {
    const response = await fetch(`${API_BASE}/complete?participant_id=${participant_id}`, {
      method: 'POST'
    });
    return response.json();
  },

  // 管理面板：获取参与者列表
  getParticipants: async () => {
    const response = await fetch(`${API_BASE}/admin/participants`);
    return response.json();
  },

  // 管理面板：获取统计信息
  getStats: async () => {
    const response = await fetch(`${API_BASE}/admin/stats`);
    return response.json();
  },

  // 管理面板：清空数据库
  clearDatabase: async () => {
    const response = await fetch(`${API_BASE}/admin/clear`, {
      method: 'DELETE'
    });
    return response.json();
  }
};
