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
import {
  CONFIG_OPTIONS,
  SYSTEM_PERSONAS,
  INITIAL_TENANT_PERSONAS,
  INITIAL_TENANT_RUBRICS,
} from './interviewConfigMockData';

const LATENCY = 260;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const genId = (p: string) => p + Math.random().toString(36).slice(2, 12);

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
export const isConfigApiError = (e: unknown): e is ApiErr => e instanceof ApiErr;

let personaStore: Persona[] = [...INITIAL_TENANT_PERSONAS];
let rubricStore: Rubric[] = [...INITIAL_TENANT_RUBRICS];

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

const personaById = (id: string, tenant_id: string): Persona | undefined =>
  SYSTEM_PERSONAS.find((p) => p.id === id) ||
  personaStore.find((p) => p.id === id && p.tenant_id === tenant_id);

const rubricById = (id: string, tenant_id: string): Rubric | undefined =>
  rubricStore.find((r) => r.id === id && r.tenant_id === tenant_id);

const setPersonaDefaultExclusive = (tenant_id: string, id: string) => {
  personaStore = personaStore.map((p) =>
    p.tenant_id === tenant_id && p.id !== id ? { ...p, is_default: false } : p,
  );
  const idx = personaStore.findIndex((p) => p.id === id && p.tenant_id === tenant_id);
  if (idx !== -1) personaStore[idx].is_default = true;
};

const setRubricDefaultExclusive = (tenant_id: string, id: string, type: InterviewType | null) => {
  rubricStore = rubricStore.map((r) =>
    r.tenant_id === tenant_id && r.config.interview_type === type && r.id !== id
      ? { ...r, is_default: false }
      : r,
  );
  const idx = rubricStore.findIndex((r) => r.id === id && r.tenant_id === tenant_id);
  if (idx !== -1) rubricStore[idx].is_default = true;
};

export const mockInterviewConfigApi = {
  async getOptions(): Promise<ConfigOptions> {
    await sleep(LATENCY);
    return clone(CONFIG_OPTIONS);
  },

  async listPersonas(tenant_id: string): Promise<Persona[]> {
    await sleep(LATENCY);
    return [...SYSTEM_PERSONAS, ...personaStore.filter((p) => p.tenant_id === tenant_id)].map(
      clone,
    );
  },

  async getPersona(id: string, tenant_id: string): Promise<Persona> {
    await sleep(LATENCY);
    const p = personaById(id, tenant_id);
    if (!p) fail(404, 'Persona not found');
    return clone(p!);
  },

  async createPersona(body: PersonaCreate): Promise<Persona> {
    await sleep(LATENCY);
    if (!body.name || body.name.trim().length < 3)
      fail(422, 'name must be 3–100 characters');
    if (!body.display_name || body.display_name.trim().length < 2)
      fail(422, 'display_name must be 2–60 characters');
    if (body.config.max_reply_words < 12 || body.config.max_reply_words > 120)
      fail(422, 'max_reply_words must be between 12 and 120');
    const now = new Date().toISOString();
    const persona: Persona = {
      id: genId('aip_'),
      tenant_id: body.tenant_id,
      name: body.name,
      display_name: body.display_name,
      config: clone(body.config),
      is_default: body.is_default ?? false,
      status: body.status ?? 'active',
      created_at: now,
      updated_at: now,
    };
    if (persona.is_default) setPersonaDefaultExclusive(body.tenant_id, persona.id);
    personaStore = [persona, ...personaStore];
    return clone(persona);
  },

  async updatePersona(id: string, tenant_id: string, patch: PersonaUpdate): Promise<Persona> {
    await sleep(LATENCY);
    if (SYSTEM_PERSONAS.some((p) => p.id === id))
      fail(422, 'System personas cannot be modified. Clone first.');
    const idx = personaStore.findIndex((p) => p.id === id && p.tenant_id === tenant_id);
    if (idx === -1) fail(404, 'Persona not found');
    if (patch.name !== undefined && patch.name.trim().length < 3)
      fail(422, 'name must be 3–100 characters');
    if (patch.display_name !== undefined && patch.display_name.trim().length < 2)
      fail(422, 'display_name must be 2–60 characters');
    if (patch.config && (patch.config.max_reply_words < 12 || patch.config.max_reply_words > 120))
      fail(422, 'max_reply_words must be between 12 and 120');
    const updated: Persona = {
      ...personaStore[idx],
      name: patch.name ?? personaStore[idx].name,
      display_name: patch.display_name ?? personaStore[idx].display_name,
      config: patch.config ? clone(patch.config) : personaStore[idx].config,
      is_default: patch.is_default ?? personaStore[idx].is_default,
      updated_at: new Date().toISOString(),
    };
    if (patch.is_default) setPersonaDefaultExclusive(tenant_id, id);
    personaStore = personaStore.map((p) => (p.id === id ? updated : p));
    return clone(updated);
  },

  async setPersonaDefault(id: string, tenant_id: string): Promise<Persona> {
    await sleep(LATENCY);
    if (SYSTEM_PERSONAS.some((p) => p.id === id))
      fail(422, 'System personas cannot be set as tenant default. Clone first.');
    if (!personaStore.find((p) => p.id === id && p.tenant_id === tenant_id))
      fail(404, 'Persona not found');
    setPersonaDefaultExclusive(tenant_id, id);
    return clone(personaStore.find((p) => p.id === id && p.tenant_id === tenant_id)!);
  },

  async clonePersona(id: string, tenant_id: string, new_name: string): Promise<Persona> {
    await sleep(LATENCY);
    const source = personaById(id, tenant_id);
    if (!source) fail(404, 'Persona not found');
    const now = new Date().toISOString();
    const cloned: Persona = {
      id: genId('aip_'),
      tenant_id,
      name: new_name,
      display_name: source!.display_name,
      config: clone(source!.config),
      is_default: false,
      status: 'active',
      created_at: now,
      updated_at: now,
    };
    personaStore = [cloned, ...personaStore];
    return clone(cloned);
  },

  async archivePersona(id: string, tenant_id: string): Promise<Persona> {
    await sleep(LATENCY);
    if (SYSTEM_PERSONAS.some((p) => p.id === id)) fail(422, 'System personas cannot be archived.');
    const idx = personaStore.findIndex((p) => p.id === id && p.tenant_id === tenant_id);
    if (idx === -1) fail(404, 'Persona not found');
    const updated: Persona = {
      ...personaStore[idx],
      status: 'inactive',
      is_default: false,
      updated_at: new Date().toISOString(),
    };
    personaStore = personaStore.map((p) => (p.id === id ? updated : p));
    return clone(updated);
  },

  async listRubrics(tenant_id: string, interview_type: InterviewType): Promise<Rubric[]> {
    await sleep(LATENCY);
    return rubricStore
      .filter((r) => r.tenant_id === tenant_id && r.config.interview_type === interview_type)
      .map(clone);
  },

  async getRubric(id: string, tenant_id: string): Promise<Rubric> {
    await sleep(LATENCY);
    const r = rubricById(id, tenant_id);
    if (!r) fail(404, 'Rubric not found');
    return clone(r!);
  },

  async createRubric(body: RubricCreate): Promise<Rubric> {
    await sleep(LATENCY);
    if (!body.name || body.name.trim().length < 3) fail(422, 'name must be 3–100 characters');
    const c = body.config;
    if (c.passing_score > c.strong_hire_score)
      fail(422, 'passing_score must be less than or equal to strong_hire_score');
    if (c.human_review_min > c.human_review_max)
      fail(422, 'human_review_min must be less than or equal to human_review_max');
    const total = c.criteria.reduce((s, x) => s + x.weight_percent, 0);
    if (total !== 100)
      fail(422, 'scoring rubric criteria weight_percent total must equal 100');
    if (c.criteria.length === 0) fail(422, 'At least one criterion is required');
    const now = new Date().toISOString();
    const rubric: Rubric = {
      id: genId('aisr_'),
      tenant_id: body.tenant_id,
      name: body.name,
      display_name: null,
      config: clone(c),
      is_default: body.is_default ?? false,
      status: body.status ?? 'active',
      created_at: now,
      updated_at: now,
    };
    if (rubric.is_default) setRubricDefaultExclusive(body.tenant_id, rubric.id, c.interview_type);
    rubricStore = [rubric, ...rubricStore];
    return clone(rubric);
  },

  async updateRubric(id: string, tenant_id: string, patch: RubricUpdate): Promise<Rubric> {
    await sleep(LATENCY);
    const idx = rubricStore.findIndex((r) => r.id === id && r.tenant_id === tenant_id);
    if (idx === -1) fail(404, 'Rubric not found');
    if (patch.name !== undefined && patch.name.trim().length < 3)
      fail(422, 'name must be 3–100 characters');
    if (patch.config) {
      const c = patch.config;
      if (c.passing_score > c.strong_hire_score)
        fail(422, 'passing_score must be less than or equal to strong_hire_score');
      if (c.human_review_min > c.human_review_max)
        fail(422, 'human_review_min must be less than or equal to human_review_max');
      const total = c.criteria.reduce((s, x) => s + x.weight_percent, 0);
      if (total !== 100)
        fail(422, 'scoring rubric criteria weight_percent total must equal 100');
      if (c.criteria.length === 0) fail(422, 'At least one criterion is required');
    }
    const updated: Rubric = {
      ...rubricStore[idx],
      name: patch.name ?? rubricStore[idx].name,
      config: patch.config ? clone(patch.config) : rubricStore[idx].config,
      is_default: patch.is_default ?? rubricStore[idx].is_default,
      updated_at: new Date().toISOString(),
    };
    if (patch.is_default)
      setRubricDefaultExclusive(tenant_id, id, updated.config.interview_type);
    rubricStore = rubricStore.map((r) => (r.id === id ? updated : r));
    return clone(updated);
  },

  async setRubricDefault(id: string, tenant_id: string): Promise<Rubric> {
    await sleep(LATENCY);
    const r = rubricStore.find((x) => x.id === id && x.tenant_id === tenant_id);
    if (!r) fail(404, 'Rubric not found');
    setRubricDefaultExclusive(tenant_id, id, r!.config.interview_type);
    return clone(rubricStore.find((x) => x.id === id && x.tenant_id === tenant_id)!);
  },

  async cloneRubric(id: string, tenant_id: string, new_name: string): Promise<Rubric> {
    await sleep(LATENCY);
    const source = rubricById(id, tenant_id);
    if (!source) fail(404, 'Rubric not found');
    const now = new Date().toISOString();
    const cloned: Rubric = {
      id: genId('aisr_'),
      tenant_id,
      name: new_name,
      display_name: null,
      config: clone(source!.config),
      is_default: false,
      status: 'active',
      created_at: now,
      updated_at: now,
    };
    rubricStore = [cloned, ...rubricStore];
    return clone(cloned);
  },

  async archiveRubric(id: string, tenant_id: string): Promise<Rubric> {
    await sleep(LATENCY);
    const idx = rubricStore.findIndex((r) => r.id === id && r.tenant_id === tenant_id);
    if (idx === -1) fail(404, 'Rubric not found');
    const updated: Rubric = {
      ...rubricStore[idx],
      status: 'inactive',
      is_default: false,
      updated_at: new Date().toISOString(),
    };
    rubricStore = rubricStore.map((r) => (r.id === id ? updated : r));
    return clone(updated);
  },
};
