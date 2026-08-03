export type MeetingPlatform = 'teams' | 'zoom' | 'google_meet';

export type InterviewType =
  | 'technical'
  | 'hr'
  | 'behavioral'
  | 'communication'
  | 'managerial'
  | 'cultural_fit'
  | 'screening';

export type InterviewLevel = 'junior' | 'mid' | 'senior' | 'expert';

export interface Candidate {
  id: string;
  name: string;
  phone: string;
  email?: string;
  current_company?: string;
  current_role?: string;
  total_experience_years?: number;
  relevant_experience_years?: number;
  current_location?: string;
  current_ctc_lpa?: number;
  expected_ctc_lpa?: number;
  notice_period_days?: number;
}

export interface JobDescription {
  id: string;
  title: string;
  client_name: string;
  location: string;
  is_remote: boolean;
  min_experience_years: number;
  max_experience_years: number;
  min_ctc_lpa: number;
  max_ctc_lpa: number;
  max_notice_period_days: number;
  must_have_skills: string[];
  good_to_have_skills: string[];
  responsibilities: string;
}

export interface MeetingLaunchRequest {
  tenant_id: string;
  platform: MeetingPlatform;
  meeting_url: string;
  bot_display_name?: string;

  candidate: Candidate;
  jd: JobDescription;

  interview_type: InterviewType;
  interview_level: InterviewLevel;
  duration_minutes: number;
  platform_interview_id: string;
  platform_jd_id: string;
  platform_candidate_id: string;
  interview_script?: string;
  result_webhook_url?: string | null;

  behavior_config_id: string | null;
  persona_id: string | null;
  scoring_rubric_id: string | null;
}

export interface MeetingLaunchResponse {
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

export interface LifecycleEvent {
  timestamp: string;
  event: string;
}

export interface InterviewState {
  interview_token: string;
  bot_session_id: string;
  platform: string;
  status: string;
  meeting_url: string;
  lifecycle: LifecycleEvent[];
  error?: string | null;
}

export const PLATFORM_OPTIONS: { value: MeetingPlatform; label: string }[] = [
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
];

export const INTERVIEW_TYPE_OPTIONS: { value: InterviewType; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'hr', label: 'HR' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'communication', label: 'Communication' },
  { value: 'managerial', label: 'Managerial' },
  { value: 'cultural_fit', label: 'Cultural Fit' },
  { value: 'screening', label: 'Screening' },
];

export const LEVEL_OPTIONS: { value: InterviewLevel; label: string }[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'expert', label: 'Expert' },
];

export const getPlatformLabel = (p: string): string =>
  PLATFORM_OPTIONS.find((x) => x.value === p)?.label ?? p;

export const getTypeLabel = (t: string): string =>
  INTERVIEW_TYPE_OPTIONS.find((x) => x.value === t)?.label ?? t;

export const getLevelLabel = (l: string): string =>
  LEVEL_OPTIONS.find((x) => x.value === l)?.label ?? l;
