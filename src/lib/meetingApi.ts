import type {
  MeetingLaunchRequest,
  MeetingLaunchResponse,
  InterviewState,
} from '@/types/meetingLaunch';
import { API_MODE } from './config';
import { mockMeetingApi, isMeetingApiError } from './meetingMockApi';
import { realMeetingApi, isMeetingHttpError } from './meetingRealApi';

export type MeetingApi = {
  launch(body: MeetingLaunchRequest): Promise<MeetingLaunchResponse>;
  getState(token: string): Promise<InterviewState>;
  endInterview(token: string): Promise<{ status: string; message: string }>;
};

export const meetingApi: MeetingApi =
  API_MODE === 'real' ? realMeetingApi : mockMeetingApi;

export const getMeetingApiErrorDetail = (e: unknown): string => {
  if (isMeetingApiError(e) || isMeetingHttpError(e)) return e.detail;
  if (e instanceof Error) return e.message;
  return 'An unexpected error occurred';
};
