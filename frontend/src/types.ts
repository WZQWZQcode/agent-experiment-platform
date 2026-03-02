/**
 * TypeScript类型定义
 */

export interface Participant {
  participant_id: string;
  demographics?: {
    age_range?: string;
    gender?: string;
    major?: string;
    skill_level?: number;
  };
}

export interface Condition {
  bundle_mode: number;
  shuffle_enabled: number;
  radar_enabled: number;
  metric_enabled: number;
  draw_mode: number;
}

export interface Task {
  task_id: string;
  task_type: 'multiple_choice' | 'text_generation' | 'information_extraction';
  round_index: number;
  question?: string;
  options?: string[];
  correct_index?: number;
  prompt?: string;
  keywords?: string[];
  min_length?: number;
  max_length?: number;
  material?: string;
  fields?: Array<{ name: string; answer: string }>;
  difficulty?: string;
}

export interface Bundle {
  bundle_id: string;
  tasks: Task[];
  round_index: number;
}

export interface TaskResponse {
  selected_index?: number;
  text?: string;
  fields?: Record<string, string>;
}

export interface SurveyData {
  stress: number;
  fatigue: number;
  control: number;
  difficulty: number;
}

export interface EventPayload {
  [key: string]: any;
}
