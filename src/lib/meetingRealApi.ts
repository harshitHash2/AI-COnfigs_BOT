import type {
  MeetingLaunchRequest,
  MeetingLaunchResponse,
  InterviewState,
} from '@/types/meetingLaunch';
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

export const realMeetingApi = {
  async launch(body: MeetingLaunchRequest): Promise<MeetingLaunchResponse> {
    return json<MeetingLaunchResponse>(
      await fetch(u('/api/interviews/meeting/launch'), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }),
    );
  },

  async getState(token: string): Promise<InterviewState> {
    return json<InterviewState>(
      await fetch(u(`/api/interviews/${token}/state`), { headers }),
    );
  },

  async endInterview(token: string): Promise<{ status: string; message: string }> {
    return json<{ status: string; message: string }>(
      await fetch(u(`/api/interviews/${token}/end`), { method: 'POST', headers }),
    );
  },
};

export { HttpErr as MeetingHttpErr };
export const isMeetingHttpError = (e: unknown): e is HttpErr => e instanceof HttpErr;
