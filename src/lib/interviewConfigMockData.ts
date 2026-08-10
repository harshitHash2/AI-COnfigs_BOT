import type {
  ConfigOptions,
  Persona,
  Rubric,
  InterviewType,
  TypedCriterion,
  CriterionOption,
} from '@/types/interviewConfig';

const ALL_CRITERIA: CriterionOption[] = [
  { criterion_key: 'correctness', label: 'Correctness', description: 'Technical accuracy of answers.' },
  { criterion_key: 'depth', label: 'Depth', description: 'Ability to explain tradeoffs and underlying concepts.' },
  { criterion_key: 'practical_experience', label: 'Practical Experience', description: 'Evidence of hands-on production or project work.' },
  { criterion_key: 'problem_solving', label: 'Problem Solving', description: 'Debugging, reasoning, and approach quality.' },
  { criterion_key: 'communication', label: 'Communication', description: 'Clarity and structure of explanation.' },
  { criterion_key: 'ownership', label: 'Ownership', description: 'Accountability, decision-making, and delivery maturity.' },
  { criterion_key: 'collaboration', label: 'Collaboration', description: 'Working with peers and cross-functional teams.' },
  { criterion_key: 'system_design', label: 'System Design', description: 'Architecture, scaling, reliability, and component design.' },
  { criterion_key: 'debugging_ability', label: 'Debugging Ability', description: 'Ability to diagnose failures and reason through issues.' },
  { criterion_key: 'tradeoff_reasoning', label: 'Tradeoff Reasoning', description: 'Ability to compare alternatives and risks.' },
  { criterion_key: 'learning_agility', label: 'Learning Agility', description: 'Ability to learn, adapt, and reason with new information.' },
  { criterion_key: 'leadership', label: 'Leadership', description: 'Guiding people and creating direction.' },
  { criterion_key: 'values_alignment', label: 'Values Alignment', description: 'Alignment with company values and expected behaviors.' },
  { criterion_key: 'must_have_match', label: 'Must-Have Match', description: 'Match against required role criteria.' },
  { criterion_key: 'security_awareness', label: 'Security Awareness', description: 'Basic security, data protection, auth, and threat awareness.' },
];

const crit = (key: string, w: number): TypedCriterion => {
  const c = ALL_CRITERIA.find((x) => x.criterion_key === key)!;
  return { ...c, weight_percent: w };
};

const TYPE_CRITERIA: Record<InterviewType, TypedCriterion[]> = {
  technical: [
    crit('correctness', 30), crit('depth', 20), crit('practical_experience', 20),
    crit('problem_solving', 15), crit('communication', 15),
  ],
  behavioral: [
    crit('ownership', 25), crit('collaboration', 20), crit('communication', 20),
    crit('learning_agility', 15), crit('values_alignment', 20),
  ],
  hr: [
    crit('must_have_match', 30), crit('communication', 25), crit('values_alignment', 20),
    crit('ownership', 25),
  ],
  communication: [
    crit('communication', 40), crit('collaboration', 20), crit('learning_agility', 20),
    crit('problem_solving', 20),
  ],
  managerial: [
    crit('leadership', 25), crit('ownership', 20), crit('collaboration', 20),
    crit('system_design', 15), crit('communication', 20),
  ],
  cultural_fit: [
    crit('values_alignment', 30), crit('collaboration', 25), crit('communication', 25),
    crit('learning_agility', 20),
  ],
  screening: [
    crit('must_have_match', 40), crit('communication', 20), crit('practical_experience', 20),
    crit('ownership', 20),
  ],
};

export const CONFIG_OPTIONS: ConfigOptions = {
  persona: {
    tone: [
      { value: 'calm_respectful', label: 'Calm and respectful', prompt_text: 'calm, respectful, and technically rigorous' },
      { value: 'friendly_conversational', label: 'Friendly conversational', prompt_text: 'friendly, conversational, and encouraging' },
      { value: 'professional_formal', label: 'Professional formal', prompt_text: 'professional, formal, and concise' },
      { value: 'warm_encouraging', label: 'Warm encouraging', prompt_text: 'warm, encouraging, and patient' },
      { value: 'technical_rigorous', label: 'Technically rigorous', prompt_text: 'technically rigorous, precise, and evidence-focused' },
      { value: 'neutral_objective', label: 'Neutral objective', prompt_text: 'neutral, objective, and structured' },
    ],
    pace: [
      { value: 'extra_slow', label: 'Extra slow', prompt_text: 'extra slow and very clear' },
      { value: 'slow_measured', label: 'Slow and measured', prompt_text: 'slow and measured' },
      { value: 'normal', label: 'Normal', prompt_text: 'normal and clear' },
      { value: 'brisk_clear', label: 'Brisk but clear', prompt_text: 'brisk but clear' },
    ],
    strictness_level: [
      { value: 'easy', label: 'Easy' },
      { value: 'balanced', label: 'Balanced' },
      { value: 'strict', label: 'Strict' },
      { value: 'very_strict', label: 'Very strict' },
      { value: 'senior_bar', label: 'Senior bar' },
    ],
    follow_up_style: [
      { value: 'adaptive', label: 'Adaptive' },
      { value: 'one_follow_up_only', label: 'One follow-up only' },
      { value: 'deep_probe', label: 'Deep probe' },
      { value: 'structured', label: 'Structured' },
      { value: 'resume_verification_heavy', label: 'Resume verification heavy' },
      { value: 'practical_experience_heavy', label: 'Practical experience heavy' },
      { value: 'debugging_heavy', label: 'Debugging heavy' },
      { value: 'system_design_heavy', label: 'System design heavy' },
      { value: 'minimal_follow_up', label: 'Minimal follow-up' },
    ],
    opening_disclosure: [
      { value: 'standard_ai_disclosure', label: 'Standard AI disclosure', text: 'This is an AI-led technical interview and the discussion may be transcribed for evaluation.' },
      { value: 'short_ai_disclosure', label: 'Short AI disclosure', text: 'This is an AI-led technical interview.' },
      { value: 'recording_and_transcription_disclosure', label: 'Recording and transcription', text: 'This is an AI-led technical interview. The discussion may be recorded and transcribed for evaluation.' },
      { value: 'no_disclosure', label: 'No disclosure', text: '' },
    ],
    closing_message: [
      { value: 'standard_thank_you', label: 'Standard thank you', text: 'Thank you for your time. The team will review the discussion and get back to you.' },
      { value: 'short_thank_you', label: 'Short thank you', text: 'Thank you for your time. The team will get back to you.' },
      { value: 'formal_review_message', label: 'Formal review message', text: 'Thank you for completing the interview. The hiring team will review the evaluation and share next steps.' },
    ],
    language_policy: [
      { value: 'clear_indian_english', label: 'Clear Indian English' },
      { value: 'english_only', label: 'English only' },
      { value: 'hindi_english_mixed', label: 'Hindi-English mixed' },
      { value: 'candidate_preferred_language', label: 'Candidate preferred' },
      { value: 'simple_global_english', label: 'Simple global English' },
    ],
  },
  scoring_rubric: { criteria: ALL_CRITERIA },
  interview_type_criteria: TYPE_CRITERIA,
  system_personas: [
    { id: 'sys_persona_balanced', name: 'Balanced Interviewer (Default)', display_name: 'Priya AI Interviewer', description: 'Calm and balanced — adapts to candidate pace with respectful, evidence-focused probing.' },
    { id: 'sys_persona_professional', name: 'Professional Formal', display_name: 'Alex AI Interviewer', description: 'Professional and structured — concise, formal exchanges with strict evaluation.' },
    { id: 'sys_persona_friendly', name: 'Warm and Friendly', display_name: 'Sam AI Interviewer', description: 'Warm and encouraging — puts candidates at ease with a conversational, easy style.' },
  ],
  defaults: {
    persona: {
      display_name: 'Priya AI Interviewer',
      tone: 'calm_respectful',
      pace: 'slow_measured',
      strictness_level: 'balanced',
      follow_up_style: 'adaptive',
      max_reply_words: 40,
      opening_disclosure: 'standard_ai_disclosure',
      closing_message: 'standard_thank_you',
      language_policy: 'clear_indian_english',
    },
    scoring_rubrics_by_type: {
      technical: {
        interview_type: 'technical',
        name: 'Default Technical Rubric',
        passing_score: 70,
        strong_hire_score: 85,
        human_review_min: 55,
        human_review_max: 69,
        criteria: TYPE_CRITERIA.technical,
      },
      behavioral: {
        interview_type: 'behavioral',
        name: 'Default Behavioral Rubric',
        passing_score: 65,
        strong_hire_score: 80,
        human_review_min: 50,
        human_review_max: 64,
        criteria: TYPE_CRITERIA.behavioral,
      },
      hr: {
        interview_type: 'hr',
        name: 'Default HR Rubric',
        passing_score: 60,
        strong_hire_score: 75,
        human_review_min: 45,
        human_review_max: 59,
        criteria: TYPE_CRITERIA.hr,
      },
      communication: {
        interview_type: 'communication',
        name: 'Default Communication Rubric',
        passing_score: 65,
        strong_hire_score: 80,
        human_review_min: 50,
        human_review_max: 64,
        criteria: TYPE_CRITERIA.communication,
      },
      managerial: {
        interview_type: 'managerial',
        name: 'Default Managerial Rubric',
        passing_score: 70,
        strong_hire_score: 85,
        human_review_min: 55,
        human_review_max: 69,
        criteria: TYPE_CRITERIA.managerial,
      },
      cultural_fit: {
        interview_type: 'cultural_fit',
        name: 'Default Cultural Fit Rubric',
        passing_score: 65,
        strong_hire_score: 80,
        human_review_min: 50,
        human_review_max: 64,
        criteria: TYPE_CRITERIA.cultural_fit,
      },
      screening: {
        interview_type: 'screening',
        name: 'Default Screening Rubric',
        passing_score: 60,
        strong_hire_score: 75,
        human_review_min: 45,
        human_review_max: 59,
        criteria: TYPE_CRITERIA.screening,
      },
    },
  },
};

export const SYSTEM_PERSONAS: Persona[] = [
  {
    id: 'sys_persona_balanced',
    tenant_id: 'system',
    name: 'Balanced Interviewer (Default)',
    display_name: 'Priya AI Interviewer',
    config: {
      display_name: 'Priya AI Interviewer',
      tone: 'calm_respectful',
      pace: 'slow_measured',
      strictness_level: 'balanced',
      follow_up_style: 'adaptive',
      max_reply_words: 40,
      opening_disclosure: 'standard_ai_disclosure',
      closing_message: 'standard_thank_you',
      language_policy: 'clear_indian_english',
    },
    is_default: true,
    status: 'active',
  },
  {
    id: 'sys_persona_professional',
    tenant_id: 'system',
    name: 'Professional Formal',
    display_name: 'Alex AI Interviewer',
    config: {
      display_name: 'Alex AI Interviewer',
      tone: 'professional_formal',
      pace: 'normal',
      strictness_level: 'strict',
      follow_up_style: 'structured',
      max_reply_words: 35,
      opening_disclosure: 'standard_ai_disclosure',
      closing_message: 'formal_review_message',
      language_policy: 'english_only',
    },
    is_default: false,
    status: 'active',
  },
  {
    id: 'sys_persona_friendly',
    tenant_id: 'system',
    name: 'Warm and Friendly',
    display_name: 'Sam AI Interviewer',
    config: {
      display_name: 'Sam AI Interviewer',
      tone: 'warm_encouraging',
      pace: 'slow_measured',
      strictness_level: 'easy',
      follow_up_style: 'adaptive',
      max_reply_words: 50,
      opening_disclosure: 'short_ai_disclosure',
      closing_message: 'short_thank_you',
      language_policy: 'clear_indian_english',
    },
    is_default: false,
    status: 'active',
  },
];

const ts = (offsetDays: number) => {
  const d = new Date('2026-07-31T09:00:00');
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString();
};

export const INITIAL_TENANT_PERSONAS: Persona[] = [
  {
    id: 'aip_tenant_001',
    tenant_id: 'tenant_abc',
    name: 'My Custom Priya',
    display_name: 'Priya AI Interviewer',
    config: {
      display_name: 'Priya AI Interviewer',
      tone: 'warm_encouraging',
      pace: 'slow_measured',
      strictness_level: 'strict',
      follow_up_style: 'deep_probe',
      max_reply_words: 45,
      opening_disclosure: 'standard_ai_disclosure',
      closing_message: 'formal_review_message',
      language_policy: 'clear_indian_english',
    },
    is_default: true,
    status: 'active',
    created_at: ts(3),
    updated_at: ts(1),
  },
  {
    id: 'aip_tenant_002',
    tenant_id: 'tenant_abc',
    name: 'Rapid Screener',
    display_name: 'Scout AI',
    config: {
      display_name: 'Scout AI',
      tone: 'neutral_objective',
      pace: 'brisk_clear',
      strictness_level: 'balanced',
      follow_up_style: 'minimal_follow_up',
      max_reply_words: 25,
      opening_disclosure: 'short_ai_disclosure',
      closing_message: 'short_thank_you',
      language_policy: 'simple_global_english',
    },
    is_default: false,
    status: 'active',
    created_at: ts(5),
    updated_at: ts(5),
  },
];

export const INITIAL_TENANT_RUBRICS: Rubric[] = [
  {
    id: 'aisr_tenant_001',
    tenant_id: 'tenant_abc',
    name: 'Default Technical Rubric',
    display_name: null,
    config: {
      interview_type: 'technical',
      name: 'Default Technical Rubric',
      passing_score: 70,
      strong_hire_score: 85,
      human_review_min: 55,
      human_review_max: 69,
      criteria: TYPE_CRITERIA.technical,
    },
    is_default: true,
    status: 'active',
    created_at: ts(4),
    updated_at: ts(2),
  },
  {
    id: 'aisr_tenant_002',
    tenant_id: 'tenant_abc',
    name: 'Senior Engineer Rubric',
    display_name: null,
    config: {
      interview_type: 'technical',
      name: 'Senior Engineer Rubric',
      passing_score: 75,
      strong_hire_score: 90,
      human_review_min: 60,
      human_review_max: 74,
      criteria: [
        crit('correctness', 25), crit('system_design', 25), crit('depth', 20),
        crit('problem_solving', 20), crit('communication', 10),
      ],
    },
    is_default: false,
    status: 'active',
    created_at: ts(2),
    updated_at: ts(2),
  },
  {
    id: 'aisr_tenant_003',
    tenant_id: 'tenant_abc',
    name: 'Behavioral Standard',
    display_name: null,
    config: {
      interview_type: 'behavioral',
      name: 'Behavioral Standard',
      passing_score: 65,
      strong_hire_score: 80,
      human_review_min: 50,
      human_review_max: 64,
      criteria: TYPE_CRITERIA.behavioral,
    },
    is_default: true,
    status: 'active',
    created_at: ts(6),
    updated_at: ts(6),
  },
];

export const ALL_CRITERIA_LIST = ALL_CRITERIA;
