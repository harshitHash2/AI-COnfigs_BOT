import type { BehaviorConfigResponse, BehaviorConfigBody, InterviewType } from '@/types/behaviorConfig';

const ISO = (d: { toISOString: () => string }) => d.toISOString();

const nowISO = () => ISO(new Date());

const body = (
  interviewer_role_label: string,
  primary_objective: string,
  question_flow: string,
  opening_question_hint: string,
  show_level_guidance: boolean,
  additional_instructions = '',
  default_rubric_id: string | null = null,
): BehaviorConfigBody => ({
  interviewer_role_label,
  primary_objective,
  question_flow,
  opening_question_hint,
  show_level_guidance,
  additional_instructions,
  default_rubric_id,
});

export const SYSTEM_DEFAULTS: BehaviorConfigResponse[] = [
  {
    id: 'sys_behavior_technical',
    tenant_id: 'system',
    name: 'Technical Interview (System Default)',
    description:
      'Assesses role-relevant technical skills through implementation, debugging, system design, and tradeoff reasoning.',
    interview_type: 'technical',
    is_system_default: true,
    is_tenant_default: false,
    config: body(
      'senior technical interviewer',
      'Assess role-relevant technical capability, implementation depth, debugging, system design where appropriate, tradeoff reasoning, and practical experience. Avoid HR screening topics unless the candidate brings them up.',
      'Use a mix of resume verification, fundamentals, practical implementation, debugging, system design, tradeoff reasoning, and ownership questions. Do not ask salary, CTC, notice period, or HR screening questions unless the candidate brings them up.',
      'Start with one short project or experience question unless the platform script starts differently.',
      true,
    ),
    status: 'active',
    created_at: '2026-07-31T06:00:00',
    updated_at: '2026-07-31T06:00:00',
  },
  {
    id: 'sys_behavior_behavioral',
    tenant_id: 'system',
    name: 'Behavioral Interview (System Default)',
    description:
      'Assesses past behavior through STAR examples — ownership, collaboration, conflict handling, adaptability, and self-awareness.',
    interview_type: 'behavioral',
    is_system_default: true,
    is_tenant_default: false,
    config: body(
      'behavioral interviewer',
      'Assess past behavior through concrete examples: ownership, collaboration, conflict handling, adaptability, accountability, and self-awareness. Prefer STAR-style follow-ups (Situation, Task, Action, Result).',
      'Ask for specific past examples only. Probe the candidate\'s specific action, the measurable result, and what they learned. Avoid hypothetical answers — redirect with \'can you give me a real example from your experience?\'. Cover at least: one ownership moment, one collaboration moment, one failure or learning moment.',
      'Start with one short past-experience question unless the platform script starts differently.',
      false,
    ),
    status: 'active',
    created_at: '2026-07-31T06:00:00',
    updated_at: '2026-07-31T06:00:00',
  },
  {
    id: 'sys_behavior_hr',
    tenant_id: 'system',
    name: 'HR Interview (System Default)',
    description:
      'Assesses role interest, motivation, availability, notice period, compensation alignment, and joining risk.',
    interview_type: 'hr',
    is_system_default: true,
    is_tenant_default: false,
    config: body(
      'HR interviewer',
      'Assess role interest, motivation, availability, notice period, compensation alignment, location or relocation fit, and joining risk. Do not conduct a deep technical interview.',
      'Ask about motivation, current situation, notice period, CTC or compensation expectations when relevant, location or work-mode fit, availability, competing offers, and joining risk. Avoid deep technical probing.',
      'Start with a short question about interest in the role and current availability unless the platform script starts differently.',
      false,
    ),
    status: 'active',
    created_at: '2026-07-31T06:00:00',
    updated_at: '2026-07-31T06:00:00',
  },
  {
    id: 'sys_behavior_communication',
    tenant_id: 'system',
    name: 'Communication Interview (System Default)',
    description:
      'Assesses clarity, listening, structure, conciseness, confidence, and professional tone.',
    interview_type: 'communication',
    is_system_default: true,
    is_tenant_default: false,
    config: body(
      'communication assessor',
      'Assess clarity, listening, structure, conciseness, confidence, and professional tone. Ask the candidate to explain, summarize, clarify, and respond to workplace communication scenarios. Do not score technical correctness except for basic role understanding.',
      'Ask the candidate to explain a familiar project simply, summarize a scenario, clarify an ambiguous request, and respond to a workplace communication situation. Evaluate clarity and listening, not technical depth.',
      'Start with one short explanation or self-introduction question unless the platform script starts differently.',
      false,
    ),
    status: 'active',
    created_at: '2026-07-31T06:00:00',
    updated_at: '2026-07-31T06:00:00',
  },
  {
    id: 'sys_behavior_managerial',
    tenant_id: 'system',
    name: 'Managerial Interview (System Default)',
    description:
      'Assesses leadership, prioritization, stakeholder management, mentoring, and delivery ownership.',
    interview_type: 'managerial',
    is_system_default: true,
    is_tenant_default: false,
    config: body(
      'managerial interviewer',
      'Assess leadership, prioritization, stakeholder management, mentoring, delivery ownership, decision-making, and handling team conflict or ambiguity.',
      'Ask about leading people, prioritizing work, managing stakeholders, mentoring, handling conflict, and owning delivery risks. Seek concrete examples and measurable outcomes.',
      'Start with one short leadership or team ownership question unless the platform script starts differently.',
      true,
    ),
    status: 'active',
    created_at: '2026-07-31T06:00:00',
    updated_at: '2026-07-31T06:00:00',
  },
  {
    id: 'sys_behavior_cultural_fit',
    tenant_id: 'system',
    name: 'Cultural Fit Interview (System Default)',
    description:
      'Assesses values alignment, work style, collaboration style, adaptability, feedback orientation, and professionalism.',
    interview_type: 'cultural_fit',
    is_system_default: true,
    is_tenant_default: false,
    config: body(
      'culture fit interviewer',
      'Assess values alignment, work style, collaboration style, adaptability, feedback orientation, and professionalism. Avoid protected or invasive personal topics.',
      'Ask about preferred work style, collaboration, feedback, ownership, adaptability, and values in workplace situations. Keep questions job-related and respectful.',
      'Start with one short work-style or collaboration question unless the platform script starts differently.',
      false,
    ),
    status: 'active',
    created_at: '2026-07-31T06:00:00',
    updated_at: '2026-07-31T06:00:00',
  },
  {
    id: 'sys_behavior_screening',
    tenant_id: 'system',
    name: 'Screening Interview (System Default)',
    description:
      'Quickly verifies must-have fit, relevant experience, interest, logistics, availability, and any clear blockers.',
    interview_type: 'screening',
    is_system_default: true,
    is_tenant_default: false,
    config: body(
      'screening interviewer',
      'Quickly verify must-have fit, relevant experience, interest, notice period, CTC alignment, location fit, and availability. Keep it concise and do not run a full deep interview.',
      'Verify the must-have requirements, relevant experience, interest level, logistics, availability, and any clear blockers. Keep follow-ups short and focused.',
      'Start with one short eligibility or role-interest question unless the platform script starts differently.',
      false,
    ),
    status: 'active',
    created_at: '2026-07-31T06:00:00',
    updated_at: '2026-07-31T06:00:00',
  },
];

const cloneConfig = (c: BehaviorConfigBody): BehaviorConfigBody => ({
  ...c,
  default_rubric_id: c.default_rubric_id,
});

export const createTenantConfig = (overrides: {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  interview_type: InterviewType | null;
  is_tenant_default: boolean;
  config: BehaviorConfigBody;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}): BehaviorConfigResponse => ({
  id: overrides.id,
  tenant_id: overrides.tenant_id,
  name: overrides.name,
  description: overrides.description,
  interview_type: overrides.interview_type,
  is_system_default: false,
  is_tenant_default: overrides.is_tenant_default,
  config: cloneConfig(overrides.config),
  status: overrides.status ?? 'active',
  created_at: overrides.created_at ?? nowISO(),
  updated_at: overrides.updated_at ?? nowISO(),
});

export const initialTenantConfigs = (): BehaviorConfigResponse[] => [
  createTenantConfig({
    id: 'aibc_a1b2c3d4e5f6',
    tenant_id: 'tenant_abc',
    name: 'Our Behavioral',
    description:
      'Customized for senior hires — extra focus on leadership and ownership.',
    interview_type: 'behavioral',
    is_tenant_default: true,
    config: body(
      'behavioral interviewer',
      'Assess past behavior through concrete examples with emphasis on leadership and ownership.',
      'Ask for specific past examples. Probe deeply on ownership and conflict resolution.',
      'Start with a question about the candidate\'s biggest ownership challenge.',
      false,
      'Always ask about experience with remote teams. Focus on candidates who have managed ambiguity.',
    ),
    created_at: '2026-07-31T09:00:00',
    updated_at: '2026-07-31T09:00:00',
  }),
  createTenantConfig({
    id: 'aibc_leadership_v1',
    tenant_id: 'tenant_abc',
    name: 'Leadership Deep-Dive',
    description:
      'Managerial interview tuned for engineering manager roles — emphasis on delivery ownership and stakeholder management.',
    interview_type: 'managerial',
    is_tenant_default: false,
    config: body(
      'managerial interviewer',
      'Assess leadership depth, delivery ownership, stakeholder management, and decision-making under ambiguity for engineering manager candidates.',
      'Ask for concrete leadership examples: owning a delivery risk, managing a difficult stakeholder, mentoring a struggling engineer, and resolving cross-team conflict. Require measurable outcomes.',
      'Start by asking about the largest team the candidate has led and the hardest delivery decision they owned.',
      true,
      'Probe for evidence of hiring and firing decisions. Ask how they handle underperforming senior engineers.',
    ),
    created_at: '2026-07-31T09:30:00',
    updated_at: '2026-07-31T09:30:00',
  }),
  createTenantConfig({
    id: 'aibc_archived_screening',
    tenant_id: 'tenant_abc',
    name: 'Quick Screen (Legacy)',
    description: 'Older screening config, archived in favor of the system default.',
    interview_type: 'screening',
    is_tenant_default: false,
    config: body(
      'screening interviewer',
      'Quick eligibility and interest check for high-volume sourcing pipelines.',
      'Verify must-haves, notice period, and CTC band only. Keep under 15 minutes.',
      'Start with a one-line role-interest question.',
      false,
    ),
    status: 'inactive',
    created_at: '2026-07-25T08:00:00',
    updated_at: '2026-07-29T11:00:00',
  }),
];
