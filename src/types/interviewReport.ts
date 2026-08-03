export type Recommendation =
  | 'strong_hire'
  | 'hire'
  | 'lean_hire'
  | 'hold'
  | 'lean_no'
  | 'no_hire';

export type LevelAssessment = 'above_level' | 'meets_level' | 'below_level';

export type SessionStatus = 'completed' | 'completed_without_score' | 'in_progress';

export interface InterviewSession {
  interview_session_id: string;
  interview_token: string;
  platform_interview_id: string;
  platform_jd_id: string;
  platform_candidate_id: string;
  tenant_id: string;
  status: SessionStatus;
  media_provider: string;
  started_at: string;
  completed_at: string;
  created_at: string;
}

export interface ReportCandidate {
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

export interface ReportJD {
  id: string;
  title: string;
  client_name: string;
  location: string;
  is_remote: boolean;
  min_experience_years: number;
  max_experience_years: number;
  min_ctc_lpa: number;
  max_ctc_lpa: number;
  must_have_skills: string[];
  good_to_have_skills: string[];
  responsibilities: string;
}

export interface ReportConfig {
  interview_type: string;
  interview_level: string;
  planned_duration_minutes: number;
  candidate: ReportCandidate;
  jd: ReportJD;
  persona_name: string;
  persona_display_name: string;
  script_source: string;
}

export interface AnswerScores {
  correctness: number;
  depth: number;
  practical_experience: number;
  problem_solving: number;
  communication: number;
  average: number;
  level_assessment: LevelAssessment;
}

export interface Answer {
  sequence: number;
  skill_area: string;
  question_type: string;
  question_asked: string;
  raw_answer: string;
  answer_summary: string;
  word_count: number;
  scores: AnswerScores;
  evidence: string[];
  missing_points: string[];
  red_flag: boolean;
  created_at: string;
}

export interface TranscriptTurn {
  turn_index: number;
  speaker: 'interviewer' | 'candidate';
  text: string;
}

export interface Transcript {
  raw_text: string;
  turns: TranscriptTurn[];
}

export interface MediaInfo {
  duration_seconds: number;
  storage_uri: string | null;
}

export interface TimelineEvent {
  event_type: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Evaluation {
  technical_score: number;
  recommendation: Recommendation;
  level_assessment: LevelAssessment;
  summary: string;
  rationale: string;
  strengths: string[];
  gaps: string[];
  red_flags: string[];
  evidence: string[];
  skill_scores: Record<string, number>;
  suggested_next_round: string;
  dimension_scores: {
    correctness: number;
    depth: number;
    practical_experience: number;
    problem_solving: number;
    communication: number;
  };
  webhook_status: string;
  evaluated_at: string;
}

export interface InterviewReport {
  session: InterviewSession;
  config: ReportConfig;
  evaluation: Evaluation;
  answers: Answer[];
  transcript: Transcript;
  media: MediaInfo;
  events: TimelineEvent[];
}
