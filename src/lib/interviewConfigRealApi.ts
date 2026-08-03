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
import { API_BASE_URL } from './config';

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

export const realInterviewConfigApi = {
  async getOptions(): Promise<ConfigOptions> {
    return json<ConfigOptions>(await fetch(u('/api/interview-configs/options'), { headers }));
  },
  async listPersonas(tenant_id: string): Promise<Persona[]> {
    return json<Persona[]>(
      await fetch(u(`/api/interview-configs/personas?tenant_id=${encodeURIComponent(tenant_id)}`), { headers }),
    );
  },
  async getPersona(id: string, tenant_id: string): Promise<Persona> {
    return json<Persona>(
      await fetch(u(`/api/interview-configs/personas/${id}?tenant_id=${encodeURIComponent(tenant_id)}`), { headers }),
    );
  },
  async createPersona(body: PersonaCreate): Promise<Persona> {
    return json<Persona>(
      await fetch(u('/api/interview-configs/personas'), { method: 'POST', headers, body: JSON.stringify(body) }),
    );
  },
  async updatePersona(id: string, tenant_id: string, patch: PersonaUpdate): Promise<Persona> {
    return json<Persona>(
      await fetch(u(`/api/interview-configs/personas/${id}?tenant_id=${encodeURIComponent(tenant_id)}`), {
        method: 'PUT', headers, body: JSON.stringify(patch),
      }),
    );
  },
  async setPersonaDefault(id: string, tenant_id: string): Promise<Persona> {
    return json<Persona>(
      await fetch(u(`/api/interview-configs/personas/${id}/set-default?tenant_id=${encodeURIComponent(tenant_id)}`), {
        method: 'POST', headers,
      }),
    );
  },
  async clonePersona(id: string, tenant_id: string, new_name: string): Promise<Persona> {
    return json<Persona>(
      await fetch(u(`/api/interview-configs/personas/${id}/clone?tenant_id=${encodeURIComponent(tenant_id)}&new_name=${encodeURIComponent(new_name)}`), {
        method: 'POST', headers,
      }),
    );
  },
  async archivePersona(id: string, tenant_id: string): Promise<Persona> {
    return json<Persona>(
      await fetch(u(`/api/interview-configs/personas/${id}/archive?tenant_id=${encodeURIComponent(tenant_id)}`), {
        method: 'POST', headers,
      }),
    );
  },
  async listRubrics(tenant_id: string, interview_type: InterviewType): Promise<Rubric[]> {
    return json<Rubric[]>(
      await fetch(u(`/api/interview-configs/scoring-rubrics?tenant_id=${encodeURIComponent(tenant_id)}&interview_type=${interview_type}`), { headers }),
    );
  },
  async getRubric(id: string, tenant_id: string): Promise<Rubric> {
    return json<Rubric>(
      await fetch(u(`/api/interview-configs/scoring-rubrics/${id}?tenant_id=${encodeURIComponent(tenant_id)}`), { headers }),
    );
  },
  async createRubric(body: RubricCreate): Promise<Rubric> {
    return json<Rubric>(
      await fetch(u('/api/interview-configs/scoring-rubrics'), { method: 'POST', headers, body: JSON.stringify(body) }),
    );
  },
  async updateRubric(id: string, tenant_id: string, patch: RubricUpdate): Promise<Rubric> {
    return json<Rubric>(
      await fetch(u(`/api/interview-configs/scoring-rubrics/${id}?tenant_id=${encodeURIComponent(tenant_id)}`), {
        method: 'PUT', headers, body: JSON.stringify(patch),
      }),
    );
  },
  async setRubricDefault(id: string, tenant_id: string): Promise<Rubric> {
    return json<Rubric>(
      await fetch(u(`/api/interview-configs/scoring-rubrics/${id}/set-default?tenant_id=${encodeURIComponent(tenant_id)}`), {
        method: 'POST', headers,
      }),
    );
  },
  async cloneRubric(id: string, tenant_id: string, new_name: string): Promise<Rubric> {
    return json<Rubric>(
      await fetch(u(`/api/interview-configs/scoring-rubrics/${id}/clone?tenant_id=${encodeURIComponent(tenant_id)}&new_name=${encodeURIComponent(new_name)}`), {
        method: 'POST', headers,
      }),
    );
  },
  async archiveRubric(id: string, tenant_id: string): Promise<Rubric> {
    return json<Rubric>(
      await fetch(u(`/api/interview-configs/scoring-rubrics/${id}/archive?tenant_id=${encodeURIComponent(tenant_id)}`), {
        method: 'POST', headers,
      }),
    );
  },
};

export { HttpErr as ConfigHttpErr };
export const isConfigHttpError = (e: unknown): e is HttpErr => e instanceof HttpErr;
