export type InterviewTypeScope = 'system' | 'tenant';

export interface InterviewTypeInfo {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  interview_type: string;
  scope: InterviewTypeScope;
  default_duration_minutes: number;
  default_level: string;
  status: 'active' | 'inactive';
  tenant_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface InterviewTypeCreate {
  tenant_id: string;
  name: string;
  description?: string;
  default_duration_minutes: number;
  default_level: string;
}

export interface InterviewTypeUpdate {
  name?: string;
  description?: string;
  default_duration_minutes?: number;
  default_level?: string;
  status?: 'active' | 'inactive';
}
