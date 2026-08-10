import type {
  ConfigOptions,
  Persona,
  PersonaCreate,
  PersonaUpdate,
  Rubric,
  RubricCreate,
  RubricUpdate,
  InterviewType,
} from '@/types/interviewConfig';
import { API_MODE } from './config';
import { mockInterviewConfigApi, isConfigApiError } from './interviewConfigMockApi';
import { realInterviewConfigApi, isConfigHttpError } from './interviewConfigRealApi';

export type InterviewConfigApi = {
  getOptions(): Promise<ConfigOptions>;
  listPersonas(tenant_id: string): Promise<Persona[]>;
  getPersona(id: string, tenant_id: string): Promise<Persona>;
  createPersona(body: PersonaCreate): Promise<Persona>;
  updatePersona(id: string, tenant_id: string, patch: PersonaUpdate): Promise<Persona>;
  setPersonaDefault(id: string, tenant_id: string): Promise<Persona>;
  clonePersona(id: string, tenant_id: string, new_name: string): Promise<Persona>;
  archivePersona(id: string, tenant_id: string): Promise<Persona>;
  listRubrics(tenant_id: string, interview_type: InterviewType): Promise<Rubric[]>;
  getRubric(id: string, tenant_id: string): Promise<Rubric>;
  createRubric(body: RubricCreate): Promise<Rubric>;
  updateRubric(id: string, tenant_id: string, patch: RubricUpdate): Promise<Rubric>;
  setRubricDefault(id: string, tenant_id: string): Promise<Rubric>;
  cloneRubric(id: string, tenant_id: string, new_name: string): Promise<Rubric>;
  archiveRubric(id: string, tenant_id: string): Promise<Rubric>;
};

export const icApi: InterviewConfigApi =
  API_MODE === 'real' ? realInterviewConfigApi : mockInterviewConfigApi;

export const getConfigApiErrorDetail = (e: unknown): string => {
  if (isConfigApiError(e) || isConfigHttpError(e)) return e.detail;
  if (e instanceof Error) return e.message;
  return 'An unexpected error occurred';
};
