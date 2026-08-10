export type InterviewType =
  | 'technical'
  | 'behavioral'
  | 'hr'
  | 'communication'
  | 'managerial'
  | 'cultural_fit'
  | 'screening';

export type ConfigStatus = 'active' | 'inactive';

export interface OptionItem {
  value: string;
  label: string;
  prompt_text?: string;
  text?: string;
}

export interface CriterionOption {
  criterion_key: string;
  label: string;
  description: string;
}

export interface TypedCriterion extends CriterionOption {
  weight_percent: number;
}

export interface PersonaConfig {
  display_name: string;
  tone: string;
  pace: string;
  strictness_level: string;
  follow_up_style: string;
  max_reply_words: number;
  opening_disclosure: string;
  closing_message: string;
  language_policy: string;
}

export interface Persona {
  id: string;
  tenant_id: string;
  name: string;
  display_name: string;
  config: PersonaConfig;
  is_default: boolean;
  status: ConfigStatus;
  created_at?: string;
  updated_at?: string;
}

export interface PersonaCreate {
  tenant_id: string;
  name: string;
  display_name: string;
  is_default?: boolean;
  status?: ConfigStatus;
  config: PersonaConfig;
}

export interface PersonaUpdate {
  name?: string;
  display_name?: string;
  is_default?: boolean;
  config?: PersonaConfig;
}

export interface RubricConfig {
  interview_type: InterviewType | null;
  name: string;
  passing_score: number;
  strong_hire_score: number;
  human_review_min: number;
  human_review_max: number;
  criteria: TypedCriterion[];
}

export interface Rubric {
  id: string;
  tenant_id: string;
  name: string;
  display_name: string | null;
  config: RubricConfig;
  is_default: boolean;
  status: ConfigStatus;
  created_at?: string;
  updated_at?: string;
}

export interface RubricCreate {
  tenant_id: string;
  name: string;
  is_default?: boolean;
  status?: ConfigStatus;
  config: RubricConfig;
}

export interface RubricUpdate {
  name?: string;
  is_default?: boolean;
  config?: RubricConfig;
}

export interface ConfigOptions {
  persona: {
    tone: OptionItem[];
    pace: OptionItem[];
    strictness_level: OptionItem[];
    follow_up_style: OptionItem[];
    opening_disclosure: OptionItem[];
    closing_message: OptionItem[];
    language_policy: OptionItem[];
  };
  scoring_rubric: {
    criteria: CriterionOption[];
  };
  interview_type_criteria: Partial<Record<InterviewType, TypedCriterion[]>>;
  system_personas: {
    id: string;
    name: string;
    display_name: string;
    description: string;
  }[];
  defaults: {
    persona: Partial<PersonaConfig>;
    scoring_rubrics_by_type: Partial<Record<InterviewType, RubricConfig>>;
  };
}

export const INTERVIEW_TYPES: { value: InterviewType; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'hr', label: 'HR' },
  { value: 'communication', label: 'Communication' },
  { value: 'managerial', label: 'Managerial' },
  { value: 'cultural_fit', label: 'Cultural Fit' },
  { value: 'screening', label: 'Screening' },
];

export const getTypeLabel = (t: InterviewType | null): string =>
  t ? INTERVIEW_TYPES.find((x) => x.value === t)?.label ?? t : 'Custom';
