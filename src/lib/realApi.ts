import type {
  BehaviorConfigResponse,
  BehaviorConfigCreate,
  BehaviorConfigUpdate,
  InterviewType,
  LaunchInterviewRequest,
  LaunchInterviewResponse,
  BehaviorConfigBody,
} from '@/types/behaviorConfig';
import { API_BASE_URL, TENANT_ID } from './config';

class HttpError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

const json = async <T>(res: Response): Promise<T> => {
  if (res.status === 204) return undefined as unknown as T;
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new HttpError(res.status, text || `Request failed (${res.status})`);
    }
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    if (data && typeof data === 'object' && 'detail' in data) {
      detail = String((data as Record<string, unknown>).detail);
    } else if (typeof data === 'string' && data) {
      detail = data;
    }
    throw new HttpError(res.status, detail);
  }
  return data as T;
};

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

export const realApi = {
  async getSystemDefaults(): Promise<BehaviorConfigResponse[]> {
    const res = await fetch(buildUrl('/api/behavior-configs/system-defaults'), {
      headers: { 'Content-Type': 'application/json' },
    });
    return json<BehaviorConfigResponse[]>(res);
  },

  async listConfigs(
    tenant_id: string,
    opts: {
      interview_type?: InterviewType | null;
      include_system_defaults?: boolean;
    } = {},
  ): Promise<BehaviorConfigResponse[]> {
    const params = new URLSearchParams({ tenant_id });
    if (opts.interview_type !== undefined && opts.interview_type !== null) {
      params.set('interview_type', opts.interview_type);
    }
    if (opts.include_system_defaults !== undefined) {
      params.set('include_system_defaults', String(opts.include_system_defaults));
    }
    const res = await fetch(
      buildUrl(`/api/behavior-configs?${params.toString()}`),
      { headers: { 'Content-Type': 'application/json' } },
    );
    return json<BehaviorConfigResponse[]>(res);
  },

  async getConfig(id: string, tenant_id: string): Promise<BehaviorConfigResponse> {
    const res = await fetch(
      buildUrl(`/api/behavior-configs/${id}?tenant_id=${encodeURIComponent(tenant_id)}`),
      { headers: { 'Content-Type': 'application/json' } },
    );
    return json<BehaviorConfigResponse>(res);
  },

  async resolveConfig(
    tenant_id: string,
    opts: { interview_type?: InterviewType | null; config_id?: string },
  ): Promise<Partial<BehaviorConfigBody>> {
    const params = new URLSearchParams({ tenant_id });
    if (opts.config_id) params.set('config_id', opts.config_id);
    if (opts.interview_type) params.set('interview_type', opts.interview_type);
    const res = await fetch(
      buildUrl(`/api/behavior-configs/resolve?${params.toString()}`),
      { headers: { 'Content-Type': 'application/json' } },
    );
    return json<Partial<BehaviorConfigBody>>(res);
  },

  async createConfig(body: BehaviorConfigCreate): Promise<BehaviorConfigResponse> {
    const res = await fetch(buildUrl('/api/behavior-configs'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return json<BehaviorConfigResponse>(res);
  },

  async updateConfig(
    id: string,
    tenant_id: string,
    patch: BehaviorConfigUpdate,
  ): Promise<BehaviorConfigResponse> {
    const res = await fetch(
      buildUrl(`/api/behavior-configs/${id}?tenant_id=${encodeURIComponent(tenant_id)}`),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      },
    );
    return json<BehaviorConfigResponse>(res);
  },

  async archiveConfig(id: string, tenant_id: string): Promise<BehaviorConfigResponse> {
    const res = await fetch(
      buildUrl(`/api/behavior-configs/${id}?tenant_id=${encodeURIComponent(tenant_id)}`),
      { method: 'DELETE', headers: { 'Content-Type': 'application/json' } },
    );
    return json<BehaviorConfigResponse>(res);
  },

  async cloneConfig(
    id: string,
    tenant_id: string,
    new_name: string,
  ): Promise<BehaviorConfigResponse> {
    const res = await fetch(
      buildUrl(`/api/behavior-configs/${id}/clone?tenant_id=${encodeURIComponent(tenant_id)}`),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_name }),
      },
    );
    return json<BehaviorConfigResponse>(res);
  },

  async launchInterview(
    body: LaunchInterviewRequest,
  ): Promise<LaunchInterviewResponse> {
    const res = await fetch(buildUrl('/api/interviews/launch'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return json<LaunchInterviewResponse>(res);
  },
};

export { HttpError };
export const isHttpError = (e: unknown): e is HttpError => e instanceof HttpError;
