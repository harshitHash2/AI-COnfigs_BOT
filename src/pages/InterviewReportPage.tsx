import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  User,
  FileText,
  MessageSquare,
  Activity,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { reportApi } from '@/lib/interviewReportApi';
import { useNavigate } from '@/lib/router';
import { useToast } from '@/components/Toast';
import type { InterviewReport, Recommendation, LevelAssessment } from '@/types/interviewReport';
import { ScoreGauge } from '@/components/ScoreGauge';
import { SkillRadar } from '@/components/SkillRadar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Feedback';

const RECOMMENDATION_CONFIG: Record<Recommendation, { label: string; bg: string; color: string; border: string }> = {
  strong_hire: { label: 'Strong Hire', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  hire: { label: 'Hire', bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  lean_hire: { label: 'Lean Hire', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  hold: { label: 'Hold', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  lean_no: { label: 'Lean No Hire', bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
  no_hire: { label: 'No Hire', bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
};

const LEVEL_CONFIG: Record<LevelAssessment, { label: string; bg: string; color: string }> = {
  above_level: { label: 'Above Level', bg: '#ECFDF5', color: '#047857' },
  meets_level: { label: 'Meets Level', bg: '#F1F5F9', color: '#475569' },
  below_level: { label: 'Below Level', bg: '#FEF2F2', color: '#B91C1C' },
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

interface Props {
  platformInterviewId: string;
}

export const InterviewReportPage = ({ platformInterviewId }: Props) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<number>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await reportApi.getReport(platformInterviewId);
        setReport(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [platformInterviewId]);

  const toggleAnswer = (seq: number) => {
    setExpandedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(seq)) next.delete(seq);
      else next.add(seq);
      return next;
    });
  };

  if (loading) return <PageLoader />;

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-8 w-8 text-rose-500 mb-3" />
        <p className="text-sm text-rose-600 mb-4">{error ?? 'Report not found'}</p>
        <Button onClick={() => navigate('/launch')} variant="secondary">Back to launch</Button>
      </div>
    );
  }

  const { session, config, evaluation, answers, transcript, media, events } = report;
  const recConfig = RECOMMENDATION_CONFIG[evaluation.recommendation];
  const levelConfig = LEVEL_CONFIG[evaluation.level_assessment];
  const candidate = config.candidate;
  const jd = config.jd;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Back bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/launch')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Button size="sm" variant="ghost" icon={<Download className="h-3.5 w-3.5" />} onClick={() => toast.show('Export coming soon', 'info')}>
          Export
        </Button>
      </div>

      {/* 1. Header */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-semibold text-slate-900">{candidate.name}</h1>
              <Badge bg={recConfig.bg} color={recConfig.color}>{recConfig.label}</Badge>
              <Badge bg={levelConfig.bg} color={levelConfig.color}>{levelConfig.label}</Badge>
            </div>
            <p className="text-sm text-slate-500">
              {jd.title} · {config.interview_level} level · {config.interview_type} interview
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {jd.client_name} · {candidate.current_company ?? '—'}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDateTime(session.started_at)}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDuration(media.duration_seconds)}</span>
              <span className="inline-flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> {session.status}</span>
              <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {config.persona_display_name}</span>
            </div>
          </div>
          <div className="flex items-center justify-center shrink-0">
            <ScoreGauge score={evaluation.technical_score} />
          </div>
        </div>
      </div>

      {/* 2. Verdict & Summary */}
      <div className="card p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">AI Evaluation Summary</h2>
        </div>
        <div className="rounded-xl border p-4" style={{ backgroundColor: recConfig.bg, borderColor: recConfig.border }}>
          <p className="text-sm leading-relaxed" style={{ color: recConfig.color }}>
            {evaluation.summary}
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Rationale</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{evaluation.rationale}</p>
        </div>
      </div>

      {/* 3. Skill Scores */}
      <div className="card p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-900">Skill Breakdown</h2>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <SkillRadar skills={evaluation.skill_scores} />
          <div className="flex-1 flex flex-col gap-2 w-full">
            {Object.entries(evaluation.skill_scores).map(([skill, score]) => {
              const color = score >= 85 ? '#059669' : score >= 70 ? '#22C55E' : score >= 55 ? '#F97316' : '#EF4444';
              return (
                <div key={skill} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-600 w-40 shrink-0 truncate">{skill}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-8 text-right">{score}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Dimension Scores */}
      <div className="card p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-900">Evaluation Dimensions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(evaluation.dimension_scores).map(([dim, score]) => {
            const color = score >= 85 ? '#059669' : score >= 70 ? '#22C55E' : score >= 55 ? '#F97316' : '#EF4444';
            return (
              <div key={dim} className="rounded-xl border border-slate-200 p-4 flex flex-col items-center gap-1">
                <span className="text-2xl font-bold" style={{ color }}>{score}</span>
                <span className="text-xs text-slate-500 capitalize text-center">{dim.replace(/_/g, ' ')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Strengths & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-900">Strengths</h2>
          </div>
          <div className="flex flex-col gap-2">
            {evaluation.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
          {evaluation.evidence.length > 0 && (
            <div className="mt-2 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Supporting Evidence</h3>
              <div className="flex flex-col gap-1.5">
                {evaluation.evidence.map((e, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs text-slate-400 mt-1">•</span>
                    <p className="text-xs text-slate-500 leading-relaxed">{e}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-slate-900">Gaps & Areas to Probe</h2>
          </div>
          <div className="flex flex-col gap-2">
            {evaluation.gaps.map((g, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">{g}</p>
              </div>
            ))}
          </div>
          {evaluation.red_flags.length > 0 && (
            <div className="mt-2 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-rose-400 mb-2">Red Flags</h3>
              <div className="flex flex-col gap-1.5">
                {evaluation.red_flags.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Next Round Recommendation */}
      <div className="card p-6 flex flex-col gap-3" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Suggested Next Round</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{evaluation.suggested_next_round}</p>
      </div>

      {/* 7. Q&A Breakdown */}
      <div className="card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Question & Answer Breakdown</h2>
          </div>
          <span className="text-xs text-slate-400">{answers.length} questions</span>
        </div>
        <div className="flex flex-col gap-3">
          {answers.map((a) => {
            const expanded = expandedAnswers.has(a.sequence);
            const avgColor = a.scores.average >= 85 ? '#059669' : a.scores.average >= 70 ? '#22C55E' : a.scores.average >= 55 ? '#F97316' : '#EF4444';
            return (
              <div key={a.sequence} className="rounded-xl border border-slate-200 overflow-hidden">
                <button onClick={() => toggleAnswer(a.sequence)}
                  className="flex items-center justify-between w-full p-4 hover:bg-slate-50 transition-colors text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {a.sequence}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{a.skill_area}</p>
                      <p className="text-xs text-slate-400 truncate">{a.question_type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold" style={{ color: avgColor }}>{a.scores.average}</span>
                    {a.red_flag && <Badge bg="#FEE2E2" color="#B91C1C">Red flag</Badge>}
                    {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-slate-100 p-4 flex flex-col gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Question</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{a.question_asked}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Candidate's Answer</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{a.raw_answer}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">AI Summary</p>
                      <p className="text-sm text-slate-600 leading-relaxed italic">{a.answer_summary}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {Object.entries(a.scores).filter(([k]) => k !== 'level_assessment').map(([key, val]) => (
                        <div key={key} className="rounded-lg bg-slate-50 px-3 py-2 flex flex-col items-center">
                          <span className="text-lg font-bold text-slate-700">{val as number}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge bg={LEVEL_CONFIG[a.scores.level_assessment].bg} color={LEVEL_CONFIG[a.scores.level_assessment].color}>
                        {LEVEL_CONFIG[a.scores.level_assessment].label}
                      </Badge>
                      <span className="text-xs text-slate-400">{a.word_count} words</span>
                    </div>
                    {a.evidence.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">Evidence</p>
                        <div className="flex flex-col gap-1">
                          {a.evidence.map((e, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-500 leading-relaxed">{e}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {a.missing_points.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-1">Missing Points</p>
                        <div className="flex flex-col gap-1">
                          {a.missing_points.map((m, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-xs text-amber-500 mt-0.5">•</span>
                              <p className="text-xs text-slate-500 leading-relaxed">{m}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Transcript */}
      <div className="card overflow-hidden">
        <button onClick={() => setShowTranscript((s) => !s)}
          className="flex items-center justify-between w-full p-6 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">Full Transcript</h2>
            <span className="text-xs text-slate-400">{transcript.turns.length} turns</span>
          </div>
          {showTranscript ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>
        {showTranscript && (
          <div className="border-t border-slate-100 p-6 flex flex-col gap-3 max-h-[600px] overflow-y-auto">
            {transcript.turns.map((turn) => (
              <div key={turn.turn_index} className={`flex ${turn.speaker === 'interviewer' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${turn.speaker === 'interviewer' ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-white'}`}>
                  <p className="text-xs font-medium mb-1 opacity-60">
                    {turn.speaker === 'interviewer' ? config.persona_display_name : candidate.name}
                  </p>
                  <p className="text-sm leading-relaxed">{turn.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 9. Timeline */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Session Timeline</h2>
        </div>
        <div className="flex flex-col gap-0">
          {events.map((event, idx) => {
            const isLast = idx === events.length - 1;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full ${isLast ? 'bg-slate-900' : 'bg-slate-300'}`} />
                  {!isLast && <div className="w-px h-10 bg-slate-200" />}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-medium text-slate-700">{event.event_type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-400">{formatTime(event.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10. Meta Info */}
      <div className="card p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-900">Session Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetaItem icon={<FileText className="h-3.5 w-3.5" />} label="Session ID" value={session.interview_session_id} />
          <MetaItem icon={<Activity className="h-3.5 w-3.5" />} label="Token" value={session.interview_token} />
          <MetaItem icon={<Briefcase className="h-3.5 w-3.5" />} label="Platform Interview ID" value={session.platform_interview_id} />
          <MetaItem icon={<Phone className="h-3.5 w-3.5" />} label="Candidate Phone" value={candidate.phone} />
          {candidate.email && <MetaItem icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={candidate.email} />}
          {candidate.current_location && <MetaItem icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={candidate.current_location} />}
          <MetaItem icon={<Clock className="h-3.5 w-3.5" />} label="Duration" value={formatDuration(media.duration_seconds)} />
          <MetaItem icon={<Calendar className="h-3.5 w-3.5" />} label="Evaluated At" value={formatDateTime(evaluation.evaluated_at)} />
          <MetaItem icon={<Activity className="h-3.5 w-3.5" />} label="Webhook" value={evaluation.webhook_status} />
        </div>
      </div>
    </div>
  );
};

const MetaItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
      {icon}{label}
    </span>
    <p className="text-sm text-slate-700 font-mono truncate">{value}</p>
  </div>
);
