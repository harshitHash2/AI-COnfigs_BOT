import type {
  MeetingLaunchRequest,
  MeetingLaunchResponse,
  InterviewState,
  LifecycleEvent,
} from '@/types/meetingLaunch';

const LATENCY = 280;
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
export const isMeetingApiError = (e: unknown): e is ApiErr => e instanceof ApiErr;

interface SessionState {
  response: MeetingLaunchResponse;
  state: InterviewState;
  lifecycleIndex: number;
  ended: boolean;
  timer: ReturnType<typeof setInterval> | null;
}

const sessions: Map<string, SessionState> = new Map();

const LIFECYCLE_SEQUENCE = [
  'bot_starting',
  'joining_meeting',
  'waiting_for_lobby',
  'admitted_to_meeting',
  'waiting_for_candidate',
  'candidate_joined',
  'interview_in_progress',
  'interview_completed',
  'bot_leaving',
  'bot_stopped',
];

const startLifecycleTimer = (token: string) => {
  const session = sessions.get(token);
  if (!session) return;
  if (session.timer) clearInterval(session.timer);
  session.timer = setInterval(() => {
    if (session.lifecycleIndex < LIFECYCLE_SEQUENCE.length - 1 && !session.ended) {
      session.lifecycleIndex++;
      const event = LIFECYCLE_SEQUENCE[session.lifecycleIndex];
      session.state.lifecycle.push({
        timestamp: new Date().toISOString(),
        event,
      });
      session.state.status = event;
    } else if (session.timer) {
      clearInterval(session.timer);
      session.timer = null;
    }
  }, 4000);
};

export const mockMeetingApi = {
  async launch(body: MeetingLaunchRequest): Promise<MeetingLaunchResponse> {
    await sleep(LATENCY + 200);

    if (!body.meeting_url || !body.meeting_url.startsWith('https://')) {
      fail(422, 'meeting_url must start with https://');
    }
    if (!body.candidate?.id || !body.candidate?.name || !body.candidate?.phone) {
      fail(422, 'candidate.id, candidate.name, and candidate.phone are required');
    }
    if (!body.jd?.id || !body.jd?.title || !body.jd?.client_name) {
      fail(422, 'jd.id, jd.title, and jd.client_name are required');
    }
    if (!body.jd.must_have_skills?.length) {
      fail(422, 'jd.must_have_skills must have at least one skill');
    }
    if (body.jd.min_experience_years > body.jd.max_experience_years) {
      fail(422, 'jd.min_experience_years must be <= max_experience_years');
    }
    if (body.jd.min_ctc_lpa > body.jd.max_ctc_lpa) {
      fail(422, 'jd.min_ctc_lpa must be <= max_ctc_lpa');
    }
    if (body.duration_minutes < 5 || body.duration_minutes > 120) {
      fail(422, 'duration_minutes must be between 5 and 120');
    }

    const token = genId('ivk_');
    const now = new Date().toISOString();
    const response: MeetingLaunchResponse = {
      interview_token: token,
      interview_session_id: genId('ais_'),
      bot_session_id: genId('bot_'),
      media_ws_url: `wss://api.yourapp.com/ws/meetingbot/${token}`,
      meeting_url: body.meeting_url,
      platform: body.platform,
      status: 'bot_starting',
      state_url: `https://api.yourapp.com/api/interviews/${token}/state`,
      candidate_wait_timeout_secs: 120,
      start_after_candidate_join_secs: 5,
    };

    const state: InterviewState = {
      interview_token: token,
      bot_session_id: response.bot_session_id,
      platform: body.platform,
      status: 'bot_starting',
      meeting_url: body.meeting_url,
      lifecycle: [{ timestamp: now, event: 'bot_starting' }],
    };

    sessions.set(token, {
      response,
      state,
      lifecycleIndex: 0,
      ended: false,
      timer: null,
    });

    startLifecycleTimer(token);

    return response;
  },

  async getState(token: string): Promise<InterviewState> {
    await sleep(LATENCY);
    const session = sessions.get(token);
    if (!session) fail(404, 'Interview session not found');
    return JSON.parse(JSON.stringify(session!.state));
  },

  async endInterview(token: string): Promise<{ status: string; message: string }> {
    await sleep(LATENCY);
    const session = sessions.get(token);
    if (!session) fail(404, 'Interview session not found');
    const sess = session!;
    if (sess.ended) fail(422, 'Interview already ended');
    sess.ended = true;
    if (sess.timer) {
      clearInterval(sess.timer);
      sess.timer = null;
    }
    sess.state.status = 'bot_stopped';
    sess.state.lifecycle.push({
      timestamp: new Date().toISOString(),
      event: 'bot_stopped',
    });
    return { status: 'bot_stopped', message: 'Interview ended by operator' };
  },
};
