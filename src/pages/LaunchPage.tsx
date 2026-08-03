import { useEffect, useMemo, useState } from 'react';
import {
  Rocket,
  Search,
  Eye,
  CheckCircle2,
  Star,
  Lock,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { api, getApiErrorDetail } from '@/lib/api';
import { TENANT_ID } from '@/lib/config';
import { useToast } from '@/components/Toast';
import type {
  BehaviorConfigResponse,
  InterviewType,
  LaunchInterviewRequest,
  LaunchInterviewResponse,
} from '@/types/behaviorConfig';
import { INTERVIEW_TYPE_OPTIONS, getTypeBadge } from '@/types/behaviorConfig';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, TextInput, FieldShell } from '@/components/ui/Field';
import { PageLoader, EmptyState } from '@/components/ui/Feedback';
import { ConfigPreview } from '@/components/ConfigPreview';
import { Drawer } from '@/components/ui/Drawer';

type Filter = InterviewType | 'all' | 'active';

export const LaunchPage = () => {
  const toast = useToast();
  const [configs, setConfigs] = useState<BehaviorConfigResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<BehaviorConfigResponse | null>(null);
  const [launching, setLaunching] = useState(false);
  const [result, setResult] = useState<LaunchInterviewResponse | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.listConfigs(TENANT_ID, {
          include_system_defaults: true,
        });
        setConfigs(data);
      } catch (e) {
        toast.show(getApiErrorDetail(e), 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!configs) return [];
    return configs.filter((c) => {
      if (c.status !== 'active') return false;
      if (typeFilter === 'active') return true;
      if (typeFilter !== 'all' && c.interview_type !== typeFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [configs, query, typeFilter]);

  const selected = useMemo(
    () => configs?.find((c) => c.id === selectedId) ?? null,
    [configs, selectedId],
  );

  const launch = async () => {
    setLaunching(true);
    setResult(null);
    try {
      const body: LaunchInterviewRequest = {
        tenant_id: TENANT_ID,
        platform_interview_id: 'demo_int_' + Math.random().toString(36).slice(2, 8),
        platform_jd_id: 'demo_jd_001',
        platform_candidate_id: 'demo_cand_' + Math.random().toString(36).slice(2, 8),
        interview_type: selected?.interview_type ?? null,
        interview_level: 'mid',
        duration_minutes: 30,
        meeting_url: 'https://meet.example.com/abc-defg-hij',
        platform: 'gmeet',
        behavior_config_id: selectedId,
        jd: { title: 'Senior Backend Engineer', skills: ['Go', 'PostgreSQL', 'System Design'] },
        candidate: { name: 'Jane Doe', experience_years: 6 },
      };
      const res = await api.launchInterview(body);
      setResult(res);
      toast.show('Interview bot launched', 'success');
    } catch (e) {
      toast.show(getApiErrorDetail(e), 'error');
    } finally {
      setLaunching(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Launch interview</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pick a behavior configuration, then launch the interview bot.
        </p>
      </div>

      {/* Selector */}
      <section className="card p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search configurations..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/40"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as Filter)}
            className="sm:w-52"
          >
            <option value="all">All types</option>
            <option value="active">Active only</option>
            {INTERVIEW_TYPE_OPTIONS.filter((o) => o.value !== null).map((o) => (
              <option key={o.value} value={o.value!}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" />}
            title="No configurations match"
            description="Adjust your search or filter to find a config."
          />
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto -mx-1 px-1">
            {filtered.map((c) => {
              const badge = getTypeBadge(c.interview_type);
              const isSel = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 ${
                    isSel
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900/10'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSel ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                    }`}
                  >
                    {isSel && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {c.name}
                      </p>
                      {c.is_tenant_default && (
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0" />
                      )}
                      {c.is_system_default && (
                        <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {c.description}
                    </p>
                    <div className="mt-1.5">
                      <Badge bg={badge.bg} color={badge.text}>
                        {badge.label}
                      </Badge>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(c);
                    }}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Selected summary + launch */}
      <section className="card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900">
              {selected ? 'Selected configuration' : 'No configuration selected'}
            </h2>
          </div>
          {selected && (
            <Button
              size="sm"
              variant="ghost"
              icon={<Eye className="h-3.5 w-3.5" />}
              onClick={() => setPreview(selected)}
            >
              Preview
            </Button>
          )}
        </div>

        {selected ? (
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <ConfigPreview config={selected} compact />
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Select a configuration above to proceed, or launch with the platform
            default (no behavior config).
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedId(null);
              setResult(null);
            }}
          >
            Clear
          </Button>
          <Button
            loading={launching}
            icon={<Rocket className="h-4 w-4" />}
            onClick={launch}
          >
            Launch interview
          </Button>
        </div>
      </section>

      {/* Result */}
      {result && (
        <section className="card p-6 flex flex-col gap-4 animate-pop-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Bot launched successfully
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Interview token', value: result.interview_token },
              { label: 'Session id', value: result.interview_session_id },
              { label: 'Bot session id', value: result.bot_session_id },
              { label: 'Platform', value: result.platform },
              { label: 'Status', value: result.status },
              { label: 'State URL', value: result.state_url },
              { label: 'Media WS URL', value: result.media_ws_url },
              { label: 'Meeting URL', value: result.meeting_url },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">
                  {row.label}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-700 truncate flex-1 font-mono">
                    {row.value}
                  </p>
                  <button
                    onClick={() => copy(row.value, row.label)}
                    className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                    title="Copy"
                  >
                    {copied === row.label ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Preview drawer */}
      <Drawer
        open={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.name ?? ''}
        subtitle={preview?.id}
        footer={
          <Button
            variant="secondary"
            onClick={() => setPreview(null)}
          >
            Close
          </Button>
        }
      >
        {preview && <ConfigPreview config={preview} />}
      </Drawer>
    </div>
  );
};
