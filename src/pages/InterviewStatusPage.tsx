import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, StopCircle, CheckCircle2, Loader2, Copy, Check, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { meetingApi, getMeetingApiErrorDetail } from '@/lib/meetingApi';
import { useNavigate } from '@/lib/router';
import { useToast } from '@/components/Toast';
import type { InterviewState, MeetingLaunchResponse } from '@/types/meetingLaunch';
import { getPlatformLabel } from '@/types/meetingLaunch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Props {
  token: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  bot_starting: { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  joining_meeting: { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  waiting_for_lobby: { bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
  admitted_to_meeting: { bg: '#F0FDF4', color: '#15803D', dot: '#22C55E' },
  waiting_for_candidate: { bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
  candidate_joined: { bg: '#F0FDF4', color: '#15803D', dot: '#22C55E' },
  interview_in_progress: { bg: '#F0FDF4', color: '#15803D', dot: '#22C55E' },
  interview_completed: { bg: '#F1F5F9', color: '#475569', dot: '#64748B' },
  bot_leaving: { bg: '#F1F5F9', color: '#475569', dot: '#64748B' },
  bot_stopped: { bg: '#FEE2E2', color: '#B91C1C', dot: '#EF4444' },
};

export const InterviewStatusPage = ({ token }: Props) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [state, setState] = useState<InterviewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const poll = async () => {
    try {
      const s = await meetingApi.getState(token);
      setState(s);
      setError(null);
    } catch (e) {
      setError(getMeetingApiErrorDetail(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [token]);

  const endInterview = async () => {
    setEnding(true);
    try {
      await meetingApi.endInterview(token);
      toast.show('Interview ended', 'success');
      poll();
    } catch (e) {
      toast.show(getMeetingApiErrorDetail(e), 'error');
    } finally {
      setEnding(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const isTerminal = state?.status === 'bot_stopped' || state?.status === 'interview_completed';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-rose-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/launch')} variant="secondary">Back to launch</Button>
      </div>
    );
  }

  const statusStyle = state ? STATUS_COLORS[state.status] ?? { bg: '#F1F5F9', color: '#475569', dot: '#64748B' } : null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <button onClick={() => navigate('/launch')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors self-start">
        <ArrowLeft className="h-4 w-4" /> Back to launch
      </button>

      <div className="card p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Bot Launched</h1>
            <p className="text-sm text-slate-500">The interview bot is now active.</p>
          </div>
        </div>

        {/* Key info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow label="Interview Token" value={token} onCopy={() => copy(token, 'token')} copied={copied === 'token'} />
          {state && <InfoRow label="Bot Session ID" value={state.bot_session_id} onCopy={() => copy(state.bot_session_id, 'bot')} copied={copied === 'bot'} />}
          {state && <InfoRow label="Platform" value={getPlatformLabel(state.platform)} />}
          {state && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</span>
              {statusStyle && (
                <div className="flex items-center gap-2">
                  <Badge bg={statusStyle.bg} color={statusStyle.color}>
                    {!isTerminal && <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusStyle.dot }} />}
                    {state.status}
                  </Badge>
                  {!isTerminal && <RefreshCw className="h-3 w-3 animate-spin text-slate-300" />}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!isTerminal && (
            <Button variant="danger" icon={<StopCircle className="h-4 w-4" />} loading={ending} onClick={endInterview}>
              End Interview
            </Button>
          )}
          {isTerminal && (
            <Button icon={<FileText className="h-4 w-4" />} onClick={() => navigate('/interview/report', { id: token })}>
              View Full Report
            </Button>
          )}
          <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={poll}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Lifecycle events */}
      {state && state.lifecycle.length > 0 && (
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Lifecycle Events</h2>
          <div className="flex flex-col gap-0">
            {state.lifecycle.map((event, idx) => {
              const isLast = idx === state.lifecycle.length - 1;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full ${isLast ? 'bg-slate-900' : 'bg-slate-300'}`} />
                    {idx < state.lifecycle.length - 1 && <div className="w-px h-8 bg-slate-200" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-slate-700">{event.event}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(event.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raw response */}
      <div className="card overflow-hidden">
        <button onClick={() => setShowRaw((s) => !s)}
          className="flex items-center justify-between w-full px-6 py-4 hover:bg-slate-50 transition-colors">
          <span className="text-sm font-semibold text-slate-700">Raw API Response</span>
          {showRaw ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>
        {showRaw && state && (
          <div className="border-t border-slate-100 px-6 py-4">
            <pre className="text-xs text-slate-600 overflow-x-auto font-mono leading-relaxed">
              {JSON.stringify(state, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, onCopy, copied }: { label: string; value: string; onCopy?: () => void; copied?: boolean }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
    <div className="flex items-center gap-2">
      <p className="text-sm text-slate-700 font-mono truncate">{value}</p>
      {onCopy && (
        <button onClick={onCopy} className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  </div>
);
