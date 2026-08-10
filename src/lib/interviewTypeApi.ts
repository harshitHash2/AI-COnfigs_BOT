import type {
  InterviewTypeInfo,
  InterviewTypeCreate,
  InterviewTypeUpdate,
} from '@/types/interviewType';
import { API_MODE, API_BASE_URL } from './config';
import {
  SYSTEM_INTERVIEW_TYPES,
  INITIAL_TENANT_INTERVIEW_TYPES,
} from './interviewTypeMockData';

const LATENCY = 260;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const genId = (p: string) => p + Math.random().toString(36).slice(2, 12);
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

class ApiErr extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}
const fail = (status: number, detail: string): never => {
  throw new ApiErr(status, detail);
};

let tenantStore: InterviewTypeInfo[] = [...INITIAL_TENANT_INTERVIEW_TYPES];

const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const mockApi = {
  async list(tenantId: string): Promise<InterviewTypeInfo[]> {
    await sleep(LATENCY);
    return [
      ...SYSTEM_INTERVIEW_TYPES.map(clone),
      ...tenantStore
        .filter((t) => t.tenant_id === tenantId)
        .map(clone),
    ];
  },

  async create(body: InterviewTypeCreate): Promise<InterviewTypeInfo> {
    await sleep(LATENCY);
    if (!body.name || body.name.trim().length < 2)
      fail(422, 'name must be 2–100 characters');
    const slug = slugify(body.name);
    const all = [...SYSTEM_INTERVIEW_TYPES, ...tenantStore];
    if (all.some((t) => t.slug === slug && t.tenant_id === body.tenant_id))
      fail(409, 'An interview type with this name already exists');
    const now = new Date().toISOString();
    const item: InterviewTypeInfo = {
      id: genId('it_'),
      slug,
      name: body.name.trim(),
      description: body.description ?? null,
      interview_type: slug,
      scope: 'tenant',
      default_duration_minutes: body.default_duration_minutes,
      default_level: body.default_level,
      status: 'active',
      tenant_id: body.tenant_id,
      created_at: now,
      updated_at: now,
    };
    tenantStore = [item, ...tenantStore];
    return clone(item);
  },

  async update(
    id: string,
    tenantId: string,
    patch: InterviewTypeUpdate,
  ): Promise<InterviewTypeInfo> {
    await sleep(LATENCY);
    const idx = tenantStore.findIndex(
      (t) => t.id === id && t.tenant_id === tenantId,
    );
    if (idx === -1) fail(404, 'Interview type not found');
    if (patch.name !== undefined && patch.name.trim().length < 2)
      fail(422, 'name must be 2–100 characters');
    const updated: InterviewTypeInfo = {
      ...tenantStore[idx],
      name: patch.name ?? tenantStore[idx].name,
      description: patch.description ?? tenantStore[idx].description,
      default_duration_minutes:
        patch.default_duration_minutes ?? tenantStore[idx].default_duration_minutes,
      default_level: patch.default_level ?? tenantStore[idx].default_level,
      status: patch.status ?? tenantStore[idx].status,
      updated_at: new Date().toISOString(),
    };
    tenantStore = tenantStore.map((t) => (t.id === id ? updated : t));
    return clone(updated);
  },

  async softDelete(id: string, tenantId: string): Promise<InterviewTypeInfo> {
    await sleep(LATENCY);
    const idx = tenantStore.findIndex(
      (t) => t.id === id && t.tenant_id === tenantId,
    );
    if (idx === -1) fail(404, 'Interview type not found');
    const updated: InterviewTypeInfo = {
      ...tenantStore[idx],
      status: 'inactive',
      updated_at: new Date().toISOString(),
    };
    tenantStore = tenantStore.map((t) => (t.id === id ? updated : t));
    return clone(updated);
  },
};

class HttpErr extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

const json = async <T>(res: Response): Promise<T> => {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new HttpErr(res.status, text);
    }
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    if (data && typeof data === 'object' && 'detail' in data) {
      detail = String((data as Record<string, unknown>).detail);
    } else if (typeof data === 'string' && data) {
      detail = data;
    }
    throw new HttpErr(res.status, detail);
  }
  return data as T;
};

const u = (path: string) => `${API_BASE_URL}${path}`;
const headers = { 'Content-Type': 'application/json' };

const realApi = {
  async list(tenantId: string): Promise<InterviewTypeInfo[]> {
    return json<InterviewTypeInfo[]>(
      await fetch(u(`/api/interview-types?tenant_id=${encodeURIComponent(tenantId)}`), { headers }),
    );
  },
  async create(body: InterviewTypeCreate): Promise<InterviewTypeInfo> {
    return json<InterviewTypeInfo>(
      await fetch(u('/api/interview-types'), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }),
    );
  },
  async update(id: string, tenantId: string, patch: InterviewTypeUpdate): Promise<InterviewTypeInfo> {
    return json<InterviewTypeInfo>(
      await fetch(u(`/api/interview-types/${id}?tenant_id=${encodeURIComponent(tenantId)}`), {
        method: 'PUT',
        headers,
        body: JSON.stringify(patch),
      }),
    );
  },
  async softDelete(id: string, tenantId: string): Promise<InterviewTypeInfo> {
    return json<InterviewTypeInfo>(
      await fetch(u(`/api/interview-types/${id}?tenant_id=${encodeURIComponent(tenantId)}`), {
        method: 'DELETE',
        headers,
      }),
    );
  },
};

export const interviewTypeApi = API_MODE === 'real' ? realApi : mockApi;

export const getInterviewTypeErrorDetail = (e: unknown): string => {
  if (e instanceof ApiErr || e instanceof HttpErr) return e.detail;
  if (e instanceof Error) return e.message;
  return 'An unexpected error occurred';
};
