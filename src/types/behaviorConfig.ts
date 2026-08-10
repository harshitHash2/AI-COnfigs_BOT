export type InterviewType =
  | 'technical'
  | 'behavioral'
  | 'hr'
  | 'communication'
  | 'managerial'
  | 'cultural_fit'
  | 'screening';

export type BehaviorConfigStatus = 'active' | 'inactive';

export interface BehaviorConfigBody {
  interviewer_role_label: string;
  primary_objective: string;
  question_flow: string;
  opening_question_hint: string;
  show_level_guidance: boolean;
  additional_instructions: string;
  default_rubric_id: string | null;
}

export interface BehaviorConfigResponse {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  interview_type: InterviewType | null;
  is_system_default: boolean;
  is_tenant_default: boolean;
  config: BehaviorConfigBody;
  status: BehaviorConfigStatus;
  created_at: string;
  updated_at: string;
}

export interface BehaviorConfigCreate {
  tenant_id: string;
  name: string;
  description?: string;
  interview_type: InterviewType | null;
  is_tenant_default?: boolean;
  config: BehaviorConfigBody;
}

export interface BehaviorConfigUpdate {
  name?: string;
  description?: string;
  is_tenant_default?: boolean;
  config?: Partial<BehaviorConfigBody>;
}

export interface LaunchInterviewRequest {
  tenant_id: string;
  platform_interview_id: string;
  platform_jd_id: string;
  platform_candidate_id: string;
  interview_type: InterviewType | null;
  interview_level: string;
  duration_minutes: number;
  meeting_url: string;
  platform: string;
  behavior_config_id: string | null;
  jd: Record<string, unknown>;
  candidate: Record<string, unknown>;
  candidate_profile?: Record<string, unknown>;
  interview_script?: string;
  metadata?: Record<string, unknown>;
}

export interface LaunchInterviewResponse {
  interview_token: string;
  interview_session_id: string;
  bot_session_id: string;
  media_ws_url: string;
  meeting_url: string;
  platform: string;
  status: string;
  state_url: string;
  candidate_wait_timeout_secs: number;
  start_after_candidate_join_secs: number;
}

export interface ApiError {
  detail: string;
}

export interface TypeBadgeStyle {
  bg: string;
  text: string;
  label: string;
}

export const TYPE_BADGE_STYLES: Record<string, TypeBadgeStyle> = {
  technical: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Technical' },
  behavioral: { bg: '#F0FDF4', text: '#15803D', label: 'Behavioral' },
  hr: { bg: '#FFF7ED', text: '#C2410C', label: 'HR' },
  communication: { bg: '#FDF4FF', text: '#9333EA', label: 'Communication' },
  managerial: { bg: '#FFFBEB', text: '#B45309', label: 'Managerial' },
  cultural_fit: { bg: '#FFF1F2', text: '#BE123C', label: 'Cultural Fit' },
  screening: { bg: '#F0F9FF', text: '#0369A1', label: 'Screening' },
  custom: { bg: '#F9FAFB', text: '#6B7280', label: 'Custom' },
};

export const INTERVIEW_TYPE_OPTIONS: { value: InterviewType | null; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'hr', label: 'HR' },
  { value: 'communication', label: 'Communication' },
  { value: 'managerial', label: 'Managerial' },
  { value: 'cultural_fit', label: 'Cultural Fit' },
  { value: 'screening', label: 'Screening' },
  { value: null, label: 'Custom (no type)' },
];

export const getTypeBadge = (type: InterviewType | null): TypeBadgeStyle =>
  type ? TYPE_BADGE_STYLES[type] : TYPE_BADGE_STYLES.custom;
