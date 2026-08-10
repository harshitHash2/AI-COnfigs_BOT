import type {
  BehaviorConfigResponse,
  BehaviorConfigCreate,
  BehaviorConfigUpdate,
  BehaviorConfigBody,
  InterviewType,
  LaunchInterviewRequest,
  LaunchInterviewResponse,
  ApiError,
} from '@/types/behaviorConfig';
import { SYSTEM_DEFAULTS, initialTenantConfigs, createTenantConfig } from './mockData';

const LATENCY = 280;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const genId = () => 'aibc_' + Math.random().toString(36).slice(2, 14);

const cloneBody = (b: BehaviorConfigBody): BehaviorConfigBody => ({ ...b });

class ApiErrorImpl extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

const fail = (status: number, detail: string): never => {
  throw new ApiErrorImpl(status, detail);
};

const isApiError = (e: unknown): e is ApiErrorImpl =>
  e instanceof ApiErrorImpl;

// In-memory store seeded with initial tenant configs.
let tenantStore: BehaviorConfigResponse[] = initialTenantConfigs();

const findAll = (
  tenant_id: string,
  opts: {
    interview_type?: InterviewType | null;
    include_system_defaults?: boolean;
  } = {},
): BehaviorConfigResponse[] => {
  const include = opts.include_system_defaults ?? true;
  let result = tenantStore.filter((c) => c.tenant_id === tenant_id);
  if (opts.interview_type !== undefined) {
    result = result.filter((c) => c.interview_type === opts.interview_type);
  }
  if (include) {
    let sys = SYSTEM_DEFAULTS.slice();
    if (opts.interview_type !== undefined) {
      sys = sys.filter((c) => c.interview_type === opts.interview_type);
    }
    result = [...result, ...sys];
  }
  return result;
};

const findOne = (id: string, tenant_id: string): BehaviorConfigResponse | undefined => {
  if (SYSTEM_DEFAULTS.some((c) => c.id === id)) {
    return SYSTEM_DEFAULTS.find((c) => c.id === id);
  }
  return tenantStore.find((c) => c.id === id && c.tenant_id === tenant_id);
};

const ensureTenantDefaultExclusive = (
  tenant_id: string,
  type: InterviewType | null,
  exceptId?: string,
): BehaviorConfigResponse | undefined => {
  if (!type) return undefined;
  return tenantStore.find(
    (c) =>
      c.tenant_id === tenant_id &&
      c.interview_type === type &&
      c.is_tenant_default &&
      c.id !== exceptId &&
      c.status === 'active',
  );
};

export const mockApi = {
  async getSystemDefaults(): Promise<BehaviorConfigResponse[]> {
    await sleep(LATENCY);
    return SYSTEM_DEFAULTS.map((c) => ({ ...c, config: cloneBody(c.config) }));
  },

  async listConfigs(
    tenant_id: string,
    opts: {
      interview_type?: InterviewType | null;
      include_system_defaults?: boolean;
    } = {},
  ): Promise<BehaviorConfigResponse[]> {
    await sleep(LATENCY);
    return findAll(tenant_id, opts).map((c) => ({
      ...c,
      config: cloneBody(c.config),
    }));
  },

  async getConfig(id: string, tenant_id: string): Promise<BehaviorConfigResponse> {
    await sleep(LATENCY);
    const found = findOne(id, tenant_id);
    if (!found) fail(404, 'Config not found');
    return { ...found!, config: cloneBody(found!.config) };
  },

  async resolveConfig(
    tenant_id: string,
    opts: { interview_type?: InterviewType | null; config_id?: string },
  ): Promise<Partial<BehaviorConfigBody>> {
    await sleep(LATENCY);
    let resolved: BehaviorConfigResponse | undefined;
    if (opts.config_id) {
      resolved = findOne(opts.config_id, tenant_id);
    } else if (opts.interview_type) {
      resolved =
        tenantStore.find(
          (c) =>
            c.tenant_id === tenant_id &&
            c.interview_type === opts.interview_type &&
            c.is_tenant_default &&
            c.status === 'active',
        ) ?? SYSTEM_DEFAULTS.find((c) => c.interview_type === opts.interview_type);
    }
    if (!resolved) return {};
    return cloneBody(resolved.config);
  },

  async createConfig(body: BehaviorConfigCreate): Promise<BehaviorConfigResponse> {
    await sleep(LATENCY);
    if (!body.name || body.name.trim().length < 2) {
      fail(422, 'Name must be at least 2 characters');
    }
    if (!body.config?.interviewer_role_label) {
      fail(422, 'Bot role label is required');
    }
    const id = genId();
    const ts = new Date().toISOString();
    const created: BehaviorConfigResponse = {
      id,
      tenant_id: body.tenant_id,
      name: body.name,
      description: body.description ?? '',
      interview_type: body.interview_type ?? null,
      is_system_default: false,
      is_tenant_default: body.is_tenant_default ?? false,
      config: cloneBody(body.config),
      status: 'active',
      created_at: ts,
      updated_at: ts,
    };
    if (created.is_tenant_default && created.interview_type) {
      tenantStore = tenantStore.map((c) =>
        c.tenant_id === body.tenant_id &&
        c.interview_type === created.interview_type &&
        c.is_tenant_default
          ? { ...c, is_tenant_default: false }
          : c,
      );
    }
    tenantStore = [created, ...tenantStore];
    return { ...created, config: cloneBody(created.config) };
  },

  async updateConfig(
    id: string,
    tenant_id: string,
    patch: BehaviorConfigUpdate,
  ): Promise<BehaviorConfigResponse> {
    await sleep(LATENCY);
    const sys = SYSTEM_DEFAULTS.find((c) => c.id === id);
    if (sys) fail(422, 'System defaults cannot be modified. Clone the config first.');
    const idx = tenantStore.findIndex((c) => c.id === id && c.tenant_id === tenant_id);
    if (idx === -1) fail(404, 'Config not found');
    const current = tenantStore[idx];
    const updated: BehaviorConfigResponse = {
      ...current,
      name: patch.name ?? current.name,
      description: patch.description ?? current.description,
      is_tenant_default: patch.is_tenant_default ?? current.is_tenant_default,
      config: patch.config ? { ...current.config, ...patch.config } : current.config,
      updated_at: new Date().toISOString(),
    };
    if (updated.is_tenant_default && updated.interview_type) {
      tenantStore = tenantStore.map((c) =>
        c.id !== updated.id &&
        c.tenant_id === tenant_id &&
        c.interview_type === updated.interview_type &&
        c.is_tenant_default
          ? { ...c, is_tenant_default: false }
          : c,
      );
    }
    tenantStore = tenantStore.map((c) => (c.id === updated.id ? updated : c));
    return { ...updated, config: cloneBody(updated.config) };
  },

  async archiveConfig(id: string, tenant_id: string): Promise<BehaviorConfigResponse> {
    await sleep(LATENCY);
    if (SYSTEM_DEFAULTS.some((c) => c.id === id)) {
      fail(422, 'System defaults cannot be archived.');
    }
    const idx = tenantStore.findIndex((c) => c.id === id && c.tenant_id === tenant_id);
    if (idx === -1) fail(404, 'Config not found');
    const updated: BehaviorConfigResponse = {
      ...tenantStore[idx],
      status: 'inactive',
      is_tenant_default: false,
      updated_at: new Date().toISOString(),
    };
    tenantStore = tenantStore.map((c) => (c.id === id ? updated : c));
    return { ...updated, config: cloneBody(updated.config) };
  },

  async cloneConfig(
    id: string,
    tenant_id: string,
    new_name: string,
  ): Promise<BehaviorConfigResponse> {
    await sleep(LATENCY);
    const source = findOne(id, tenant_id);
    if (!source) fail(404, 'Config not found');
    const newId = genId();
    const ts = new Date().toISOString();
    const cloned = createTenantConfig({
      id: newId,
      tenant_id,
      name: new_name,
      description: source!.description,
      interview_type: source!.interview_type,
      is_tenant_default: false,
      config: cloneBody(source!.config),
      created_at: ts,
      updated_at: ts,
    });
    tenantStore = [cloned, ...tenantStore];
    return { ...cloned, config: cloneBody(cloned.config) };
  },

  async launchInterview(
    body: LaunchInterviewRequest,
  ): Promise<LaunchInterviewResponse> {
    await sleep(LATENCY + 200);
    const token = Array.from({ length: 24 }, () =>
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(
        Math.floor(Math.random() * 62),
      ),
    ).join('');
    return {
      interview_token: token,
      interview_session_id: 'ais_' + Math.random().toString(36).slice(2, 14),
      bot_session_id: 'bot_' + Math.random().toString(36).slice(2, 12),
      media_ws_url: `wss://api.yourapp.com/ws/meetingbot/${token}`,
      meeting_url: body.meeting_url,
      platform: body.platform,
      status: 'bot_starting',
      state_url: `https://api.yourapp.com/api/interviews/${token}/state`,
      candidate_wait_timeout_secs: 120.0,
      start_after_candidate_join_secs: 5.0,
    };
  },
};

export { isApiError, ApiErrorImpl };
