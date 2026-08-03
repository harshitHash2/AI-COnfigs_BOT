import type {
  BehaviorConfigResponse,
  BehaviorConfigCreate,
  BehaviorConfigUpdate,
  InterviewType,
  LaunchInterviewRequest,
  LaunchInterviewResponse,
  BehaviorConfigBody,
} from '@/types/behaviorConfig';
import { API_MODE } from './config';
import { mockApi, isApiError } from './mockApi';
import { realApi, isHttpError } from './realApi';

export type ApiClient = {
  getSystemDefaults(): Promise<BehaviorConfigResponse[]>;
  listConfigs(
    tenant_id: string,
    opts?: {
      interview_type?: InterviewType | null;
      include_system_defaults?: boolean;
    },
  ): Promise<BehaviorConfigResponse[]>;
  getConfig(id: string, tenant_id: string): Promise<BehaviorConfigResponse>;
  resolveConfig(
    tenant_id: string,
    opts: { interview_type?: InterviewType | null; config_id?: string },
  ): Promise<Partial<BehaviorConfigBody>>;
  createConfig(body: BehaviorConfigCreate): Promise<BehaviorConfigResponse>;
  updateConfig(
    id: string,
    tenant_id: string,
    patch: BehaviorConfigUpdate,
  ): Promise<BehaviorConfigResponse>;
  archiveConfig(id: string, tenant_id: string): Promise<BehaviorConfigResponse>;
  cloneConfig(
    id: string,
    tenant_id: string,
    new_name: string,
  ): Promise<BehaviorConfigResponse>;
  launchInterview(body: LaunchInterviewRequest): Promise<LaunchInterviewResponse>;
};

const api: ApiClient = API_MODE === 'real' ? realApi : mockApi;

export { api, isApiError, isHttpError };

export const getApiErrorDetail = (e: unknown): string => {
  if (isApiError(e) || isHttpError(e)) return e.detail;
  if (e instanceof Error) return e.message;
  return 'An unexpected error occurred';
};
