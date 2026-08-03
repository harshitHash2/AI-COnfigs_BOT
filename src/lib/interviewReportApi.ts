import type { InterviewReport } from '@/types/interviewReport';
import { MOCK_REPORT } from './interviewReportMockData';

const LATENCY = 300;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const reportApi = {
  async getReport(platformInterviewId: string): Promise<InterviewReport> {
    await sleep(LATENCY);
    // In mock mode, always return the canned report regardless of ID
    return JSON.parse(JSON.stringify(MOCK_REPORT));
  },
};
