import { useEffect, useState } from 'react';
import {
  Video,
  User,
  Settings2,
  Rocket,
  Check,
  ArrowRight,
  ArrowLeft,
  Wand2,
  AlertCircle,
  Loader2,
  Star,
  Lock,
} from 'lucide-react';
import { meetingApi, getMeetingApiErrorDetail } from '@/lib/meetingApi';
import { api, getApiErrorDetail } from '@/lib/api';
import { icApi, getConfigApiErrorDetail } from '@/lib/interviewConfigApi';
import { TENANT_ID } from '@/lib/config';
import { useNavigate } from '@/lib/router';
import { useToast } from '@/components/Toast';
import { useOptions } from '@/lib/optionsContext';
import type {
  MeetingPlatform,
  InterviewType,
  InterviewLevel,
  Candidate,
  JobDescription,
  MeetingLaunchRequest,
  MeetingLaunchResponse,
} from '@/types/meetingLaunch';
import {
  PLATFORM_OPTIONS,
  INTERVIEW_TYPE_OPTIONS,
  LEVEL_OPTIONS,
  getPlatformLabel,
  getTypeLabel,
  getLevelLabel,
} from '@/types/meetingLaunch';
import type { BehaviorConfigResponse } from '@/types/behaviorConfig';
import type { Persona, Rubric } from '@/types/interviewConfig';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FieldShell, TextInput, TextArea, Select } from '@/components/ui/Field';
import { Toggle } from '@/components/ui/Toggle';
import { SkillTagInput } from '@/components/ui/SkillTagInput';
import { testCandidate, testJD } from '@/lib/testData';

const STEPS = [
  { num: 1, label: 'Meeting', icon: Video },
  { num: 2, label: 'Candidate & Job', icon: User },
  { num: 3, label: 'Settings', icon: Settings2 },
  { num: 4, label: 'Configs & Launch', icon: Rocket },
];

interface WizardState {
  // Step 1
  platform: MeetingPlatform;
  meeting_url: string;
  bot_display_name: string;
  // Step 2
  candidate: Candidate;
  jd: JobDescription;
  // Step 3
  interview_type: InterviewType;
  interview_level: InterviewLevel;
  duration_minutes: number;
  platform_interview_id: string;
  interview_script: string;
  result_webhook_url: string;
  // Step 4
  behavior_config_id: string | null;
  persona_id: string | null;
  scoring_rubric_id: string | null;
}

const initialState: WizardState = {
  platform: 'teams',
  meeting_url: '',
  bot_display_name: 'Priya AI Interviewer',
  candidate: { id: '', name: '', phone: '' },
  jd: {
    id: '',
    title: '',
    client_name: '',
    location: '',
    is_remote: false,
    min_experience_years: 0,
    max_experience_years: 0,
    min_ctc_lpa: 0,
    max_ctc_lpa: 0,
    max_notice_period_days: 60,
    must_have_skills: [],
    good_to_have_skills: [],
    responsibilities: '',
  },
  interview_type: 'technical',
  interview_level: 'mid',
  duration_minutes: 30,
  platform_interview_id: '',
  interview_script: '',
  result_webhook_url: '',
  behavior_config_id: null,
  persona_id: null,
  scoring_rubric_id: null,
};

export const LaunchWizardPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [launching, setLaunching] = useState(false);

  // Config lists for Step 4
  const [behaviorConfigs, setBehaviorConfigs] = useState<BehaviorConfigResponse[] | null>(null);
  const [personas, setPersonas] = useState<Persona[] | null>(null);
  const [rubrics, setRubrics] = useState<Rubric[] | null>(null);
  const [configsLoading, setConfigsLoading] = useState(false);

  const set = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));
  const setCand = (patch: Partial<Candidate>) =>
    setState((s) => ({ ...s, candidate: { ...s.candidate, ...patch } }));
  const setJd = (patch: Partial<JobDescription>) =>
    setState((s) => ({ ...s, jd: { ...s.jd, ...patch } }));

  const fillTestData = () => {
    setState((s) => ({
      ...s,
      candidate: { ...testCandidate },
      jd: { ...testJD },
      platform_interview_id: 'plat_int_' + Math.random().toString(36).slice(2, 8),
    }));
    toast.show('Test data filled', 'success');
  };

  // Load configs for Step 4
  useEffect(() => {
    if (step !== 4) return;
    let cancelled = false;
    const loadConfigs = async () => {
      setConfigsLoading(true);
      try {
        const [behaviors, pers, rubs] = await Promise.all([
          api.listConfigs(TENANT_ID, {
            interview_type: state.interview_type,
            include_system_defaults: true,
          }),
          icApi.listPersonas(TENANT_ID),
          icApi.listRubrics(TENANT_ID, state.interview_type),
        ]);
        if (cancelled) return;
        setBehaviorConfigs(behaviors);
        setPersonas(pers);
        setRubrics(rubs);

        // Auto-select defaults
        const sysBehavior = behaviors.find((b) => b.is_system_default && b.interview_type === state.interview_type);
        const tenantBehavior = behaviors.find((b) => b.is_tenant_default && b.tenant_id !== 'system');
        if (!state.behavior_config_id) {
          set({ behavior_config_id: tenantBehavior?.id ?? sysBehavior?.id ?? null });
        }
        const defPersona = pers.find((p) => p.is_default && p.tenant_id !== 'system') ?? pers.find((p) => p.tenant_id === 'system');
        if (!state.persona_id) {
          set({ persona_id: defPersona?.id ?? null });
        }
        const defRubric = rubs.find((r) => r.is_default);
        if (!state.scoring_rubric_id) {
          set({ scoring_rubric_id: defRubric?.id ?? null });
        }
      } catch (e) {
        toast.show(getConfigApiErrorDetail(e) || getApiErrorDetail(e), 'error');
      } finally {
        if (!cancelled) setConfigsLoading(false);
      }
    };
    loadConfigs();
    return () => {
      cancelled = true;
    };
  }, [step, state.interview_type]);

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!state.meeting_url) e.meeting_url = 'Meeting URL is required';
      else if (!state.meeting_url.startsWith('https://')) e.meeting_url = 'Must start with https://';
      if (state.bot_display_name.length > 60) e.bot_display_name = 'Max 60 characters';
    }
    if (s === 2) {
      if (!state.candidate.id) e['candidate.id'] = 'Required';
      if (!state.candidate.name) e['candidate.name'] = 'Required';
      if (!state.candidate.phone) e['candidate.phone'] = 'Required';
      if (!state.jd.id) e['jd.id'] = 'Required';
      if (!state.jd.title) e['jd.title'] = 'Required';
      if (!state.jd.client_name) e['jd.client_name'] = 'Required';
      if (!state.jd.location) e['jd.location'] = 'Required';
      if (state.jd.min_experience_years > state.jd.max_experience_years)
        e['jd.exp'] = 'Min must be <= Max';
      if (state.jd.min_ctc_lpa > state.jd.max_ctc_lpa) e['jd.ctc'] = 'Min must be <= Max';
      if (state.jd.must_have_skills.length === 0) e['jd.skills'] = 'At least one required';
      if (!state.jd.responsibilities) e['jd.responsibilities'] = 'Required';
    }
    if (s === 3) {
      if (!state.platform_interview_id) e.platform_interview_id = 'Required';
      if (state.duration_minutes < 5 || state.duration_minutes > 120)
        e.duration_minutes = 'Must be 5–120';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(4, s + 1));
    else toast.show('Please fix the highlighted fields', 'error');
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));

  const launch = async () => {
    setLaunching(true);
    try {
      const body: MeetingLaunchRequest = {
        tenant_id: TENANT_ID,
        platform: state.platform,
        meeting_url: state.meeting_url,
        bot_display_name: state.bot_display_name || undefined,
        candidate: state.candidate,
        jd: state.jd,
        interview_type: state.interview_type,
        interview_level: state.interview_level,
        duration_minutes: state.duration_minutes,
        platform_interview_id: state.platform_interview_id,
        platform_jd_id: state.jd.id,
        platform_candidate_id: state.candidate.id,
        interview_script: state.interview_script || undefined,
        result_webhook_url: state.result_webhook_url || null,
        behavior_config_id: state.behavior_config_id,
        persona_id: state.persona_id,
        scoring_rubric_id: state.scoring_rubric_id,
      };
      const res = await meetingApi.launch(body);
      toast.show('Interview bot launched', 'success');
      navigate('/launch/status', { token: res.interview_token });
    } catch (e) {
      toast.show(getMeetingApiErrorDetail(e), 'error');
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Launch Meeting Interview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure and fire the interview bot into a live meeting.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const done = step > s.num;
          const active = step === s.num;
          const Icon = s.icon;
          return (
            <div key={s.num} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                disabled={s.num > step}
                className={`flex items-center gap-2.5 ${s.num <= step ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className={`text-xs font-medium ${active ? 'text-slate-900' : 'text-slate-500'}`}>
                    Step {s.num}
                  </span>
                  <span className={`text-sm font-medium ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-colors ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="card p-6">
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-slate-900">Meeting Setup</h2>
            <FieldShell label="Platform" htmlFor="platform" required>
              <Select id="platform" value={state.platform} onChange={(e) => set({ platform: e.target.value as MeetingPlatform })}>
                {PLATFORM_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </FieldShell>
            <FieldShell label="Meeting URL" htmlFor="url" required error={errors.meeting_url} hint="Must start with https://">
              <TextInput id="url" value={state.meeting_url} onChange={(e) => set({ meeting_url: e.target.value })} placeholder="https://teams.microsoft.com/l/meetup-join/..." />
            </FieldShell>
            <FieldShell label="Bot display name" htmlFor="botname" error={errors.bot_display_name} hint="Optional, max 60 chars. What the bot says its name is.">
              <TextInput id="botname" value={state.bot_display_name} onChange={(e) => set({ bot_display_name: e.target.value })} placeholder="Priya AI Interviewer" />
            </FieldShell>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Candidate & Job Description</h2>
              <Button size="sm" variant="ghost" icon={<Wand2 className="h-3.5 w-3.5" />} onClick={fillTestData}>
                Fill test data
              </Button>
            </div>

            {/* Candidate */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Candidate</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldShell label="Candidate ID" htmlFor="candId" required error={errors['candidate.id']}>
                  <TextInput id="candId" value={state.candidate.id} onChange={(e) => setCand({ id: e.target.value })} placeholder="cand_001" />
                </FieldShell>
                <FieldShell label="Name" htmlFor="candName" required error={errors['candidate.name']}>
                  <TextInput id="candName" value={state.candidate.name} onChange={(e) => setCand({ name: e.target.value })} placeholder="Ravi Shankar" />
                </FieldShell>
                <FieldShell label="Phone" htmlFor="candPhone" required error={errors['candidate.phone']}>
                  <TextInput id="candPhone" value={state.candidate.phone} onChange={(e) => setCand({ phone: e.target.value })} placeholder="+91 98765 43210" />
                </FieldShell>
                <FieldShell label="Email" htmlFor="candEmail">
                  <TextInput id="candEmail" type="email" value={state.candidate.email ?? ''} onChange={(e) => setCand({ email: e.target.value })} placeholder="ravi@example.com" />
                </FieldShell>
                <FieldShell label="Current company" htmlFor="candCo">
                  <TextInput id="candCo" value={state.candidate.current_company ?? ''} onChange={(e) => setCand({ current_company: e.target.value })} />
                </FieldShell>
                <FieldShell label="Current role" htmlFor="candRole">
                  <TextInput id="candRole" value={state.candidate.current_role ?? ''} onChange={(e) => setCand({ current_role: e.target.value })} />
                </FieldShell>
                <FieldShell label="Total experience (years)" htmlFor="candTotal">
                  <TextInput id="candTotal" type="number" value={state.candidate.total_experience_years ?? ''} onChange={(e) => setCand({ total_experience_years: e.target.value ? Number(e.target.value) : undefined })} />
                </FieldShell>
                <FieldShell label="Relevant experience (years)" htmlFor="candRel">
                  <TextInput id="candRel" type="number" value={state.candidate.relevant_experience_years ?? ''} onChange={(e) => setCand({ relevant_experience_years: e.target.value ? Number(e.target.value) : undefined })} />
                </FieldShell>
                <FieldShell label="Current location" htmlFor="candLoc">
                  <TextInput id="candLoc" value={state.candidate.current_location ?? ''} onChange={(e) => setCand({ current_location: e.target.value })} />
                </FieldShell>
                <FieldShell label="Current CTC (LPA)" htmlFor="candCtc">
                  <TextInput id="candCtc" type="number" value={state.candidate.current_ctc_lpa ?? ''} onChange={(e) => setCand({ current_ctc_lpa: e.target.value ? Number(e.target.value) : undefined })} />
                </FieldShell>
                <FieldShell label="Expected CTC (LPA)" htmlFor="candExpCtc">
                  <TextInput id="candExpCtc" type="number" value={state.candidate.expected_ctc_lpa ?? ''} onChange={(e) => setCand({ expected_ctc_lpa: e.target.value ? Number(e.target.value) : undefined })} />
                </FieldShell>
                <FieldShell label="Notice period (days)" htmlFor="candNotice">
                  <TextInput id="candNotice" type="number" value={state.candidate.notice_period_days ?? ''} onChange={(e) => setCand({ notice_period_days: e.target.value ? Number(e.target.value) : undefined })} />
                </FieldShell>
              </div>
            </div>

            {/* JD */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Job Description</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldShell label="JD ID" htmlFor="jdId" required error={errors['jd.id']}>
                  <TextInput id="jdId" value={state.jd.id} onChange={(e) => setJd({ id: e.target.value })} placeholder="jd_001" />
                </FieldShell>
                <FieldShell label="Title" htmlFor="jdTitle" required error={errors['jd.title']}>
                  <TextInput id="jdTitle" value={state.jd.title} onChange={(e) => setJd({ title: e.target.value })} placeholder="Backend Engineer" />
                </FieldShell>
                <FieldShell label="Client name" htmlFor="jdClient" required error={errors['jd.client_name']}>
                  <TextInput id="jdClient" value={state.jd.client_name} onChange={(e) => setJd({ client_name: e.target.value })} />
                </FieldShell>
                <FieldShell label="Location" htmlFor="jdLoc" required error={errors['jd.location']}>
                  <TextInput id="jdLoc" value={state.jd.location} onChange={(e) => setJd({ location: e.target.value })} />
                </FieldShell>
                <FieldShell label="Min experience (years)" htmlFor="jdMinExp" required error={errors['jd.exp']}>
                  <TextInput id="jdMinExp" type="number" value={state.jd.min_experience_years} onChange={(e) => setJd({ min_experience_years: Number(e.target.value) })} />
                </FieldShell>
                <FieldShell label="Max experience (years)" htmlFor="jdMaxExp" required>
                  <TextInput id="jdMaxExp" type="number" value={state.jd.max_experience_years} onChange={(e) => setJd({ max_experience_years: Number(e.target.value) })} />
                </FieldShell>
                <FieldShell label="Min CTC (LPA)" htmlFor="jdMinCtc" required error={errors['jd.ctc']}>
                  <TextInput id="jdMinCtc" type="number" value={state.jd.min_ctc_lpa} onChange={(e) => setJd({ min_ctc_lpa: Number(e.target.value) })} />
                </FieldShell>
                <FieldShell label="Max CTC (LPA)" htmlFor="jdMaxCtc" required>
                  <TextInput id="jdMaxCtc" type="number" value={state.jd.max_ctc_lpa} onChange={(e) => setJd({ max_ctc_lpa: Number(e.target.value) })} />
                </FieldShell>
                <FieldShell label="Max notice period (days)" htmlFor="jdNotice">
                  <TextInput id="jdNotice" type="number" value={state.jd.max_notice_period_days} onChange={(e) => setJd({ max_notice_period_days: Number(e.target.value) })} />
                </FieldShell>
                <div className="flex items-end">
                  <Toggle checked={state.jd.is_remote} onChange={(v) => setJd({ is_remote: v })} label="Remote" />
                </div>
              </div>
              <SkillTagInput label="Must-have skills" tags={state.jd.must_have_skills} onChange={(t) => setJd({ must_have_skills: t })} required error={errors['jd.skills']} />
              <SkillTagInput label="Good-to-have skills" tags={state.jd.good_to_have_skills} onChange={(t) => setJd({ good_to_have_skills: t })} />
              <FieldShell label="Responsibilities" htmlFor="jdResp" required error={errors['jd.responsibilities']}>
                <TextArea id="jdResp" value={state.jd.responsibilities} onChange={(e) => setJd({ responsibilities: e.target.value })} rows={3} placeholder="Design and build scalable backend services..." />
              </FieldShell>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-slate-900">Interview Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldShell label="Interview type" htmlFor="itype" required>
                <Select id="itype" value={state.interview_type} onChange={(e) => set({ interview_type: e.target.value as InterviewType })}>
                  {INTERVIEW_TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </FieldShell>
              <FieldShell label="Interview level" htmlFor="ilevel" required>
                <Select id="ilevel" value={state.interview_level} onChange={(e) => set({ interview_level: e.target.value as InterviewLevel })}>
                  {LEVEL_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </Select>
              </FieldShell>
            </div>
            <FieldShell label="Duration (minutes)" htmlFor="dur" required error={errors.duration_minutes} hint="5–120 minutes">
              <div className="flex items-center gap-4">
                <input type="range" min={5} max={120} step={5} value={state.duration_minutes}
                  onChange={(e) => set({ duration_minutes: Number(e.target.value) })}
                  className="flex-1 accent-slate-900" />
                <input type="number" min={5} max={120} value={state.duration_minutes}
                  onChange={(e) => set({ duration_minutes: Number(e.target.value) })}
                  className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/40" />
                <span className="text-sm text-slate-400">min</span>
              </div>
            </FieldShell>
            <FieldShell label="Platform interview ID" htmlFor="pintid" required error={errors.platform_interview_id} hint="Manual or ATS reference">
              <TextInput id="pintid" value={state.platform_interview_id} onChange={(e) => set({ platform_interview_id: e.target.value })} placeholder="plat_int_001" />
            </FieldShell>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldShell label="Platform JD ID" htmlFor="pjdid" hint="Auto-filled from Step 2">
                <TextInput id="pjdid" value={state.jd.id} disabled />
              </FieldShell>
              <FieldShell label="Platform candidate ID" htmlFor="pcid" hint="Auto-filled from Step 2">
                <TextInput id="pcid" value={state.candidate.id} disabled />
              </FieldShell>
            </div>
            <FieldShell label="Interview script" htmlFor="script" hint="Optional override">
              <TextArea id="script" value={state.interview_script} onChange={(e) => set({ interview_script: e.target.value })} rows={3} placeholder="Leave blank to use the config's default script..." />
            </FieldShell>
            <FieldShell label="Result webhook URL" htmlFor="webhook" hint="Optional. POST callback when interview completes.">
              <TextInput id="webhook" type="url" value={state.result_webhook_url} onChange={(e) => set({ result_webhook_url: e.target.value })} placeholder="https://yourapp.com/webhooks/interview-result" />
            </FieldShell>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-slate-900">Config Selection & Launch</h2>
            {configsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                {/* Behavior config */}
                <ConfigPicker
                  label="Interview Behavior"
                  hint="Auto-filtered by interview type"
                  value={state.behavior_config_id}
                  onChange={(v) => set({ behavior_config_id: v })}
                  options={(behaviorConfigs ?? []).map((b) => ({
                    id: b.id,
                    name: b.name,
                    isSystem: b.is_system_default,
                    isDefault: b.is_tenant_default,
                    subtitle: b.interview_type ?? 'custom',
                  }))}
                />

                {/* Persona */}
                <ConfigPicker
                  label="Interviewer Persona"
                  hint="Bot voice and conversation style"
                  value={state.persona_id}
                  onChange={(v) => set({ persona_id: v })}
                  options={(personas ?? []).map((p) => ({
                    id: p.id,
                    name: p.name,
                    isSystem: p.tenant_id === 'system',
                    isDefault: p.is_default,
                    subtitle: p.display_name,
                  }))}
                />

                {/* Rubric */}
                <ConfigPicker
                  label="Scoring Rubric"
                  hint="How the AI evaluates candidates"
                  value={state.scoring_rubric_id}
                  onChange={(v) => set({ scoring_rubric_id: v })}
                  options={(rubrics ?? []).map((r) => ({
                    id: r.id,
                    name: r.name,
                    isSystem: false,
                    isDefault: r.is_default,
                    subtitle: `Pass ≥ ${r.config.passing_score} · ${r.config.criteria.length} criteria`,
                  }))}
                />

                {/* Review */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Review</h3>
                  <ReviewRow label="Platform" value={getPlatformLabel(state.platform)} />
                  <ReviewRow label="Meeting URL" value={state.meeting_url} />
                  <ReviewRow label="Candidate" value={`${state.candidate.name} (${state.candidate.id})`} />
                  <ReviewRow label="Role" value={`${state.jd.title} (${getLevelLabel(state.interview_level)})`} />
                  <ReviewRow label="Duration" value={`${state.duration_minutes} min`} />
                  <ReviewRow label="Type" value={getTypeLabel(state.interview_type)} />
                  <ReviewRow label="Behavior" value={behaviorConfigs?.find((b) => b.id === state.behavior_config_id)?.name ?? 'System default (auto)'} />
                  <ReviewRow label="Persona" value={personas?.find((p) => p.id === state.persona_id)?.name ?? 'None'} />
                  <ReviewRow label="Rubric" value={rubrics?.find((r) => r.id === state.scoring_rubric_id)?.name ?? 'None'} />
                </div>

                <div className="flex items-center justify-end">
                  <Button loading={launching} icon={<Rocket className="h-4 w-4" />} onClick={launch} size="lg">
                    Launch Interview Bot
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nav buttons */}
      {step < 4 && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={prev} disabled={step === 1}>
            Back
          </Button>
          <Button iconRight={<ArrowRight className="h-4 w-4" />} onClick={next}>
            Continue
          </Button>
        </div>
      )}
      {step === 4 && (
        <div className="flex items-center justify-start">
          <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={prev}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start gap-3 text-sm">
    <span className="text-slate-400 w-28 shrink-0">{label}</span>
    <span className="text-slate-700 font-medium truncate">{value || '—'}</span>
  </div>
);

interface ConfigOption {
  id: string;
  name: string;
  isSystem: boolean;
  isDefault: boolean;
  subtitle: string;
}

const ConfigPicker = ({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: ConfigOption[];
}) => (
  <FieldShell label={label} hint={hint}>
    <Select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">System default (auto)</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
          {o.isSystem ? ' (System)' : o.isDefault ? ' (Default)' : ''}
        </option>
      ))}
    </Select>
    {value && (() => {
      const sel = options.find((o) => o.id === value);
      if (!sel) return null;
      return (
        <div className="flex items-center gap-2 mt-1.5">
          {sel.isSystem && <Badge bg="#F1F5F9" color="#475569"><Lock className="h-3 w-3" /> System</Badge>}
          {sel.isDefault && <Badge bg="#FFFBEB" color="#B45309"><Star className="h-3 w-3 fill-amber-400 text-amber-500" /> Default</Badge>}
          <span className="text-xs text-slate-500">{sel.subtitle}</span>
        </div>
      );
    })()}
  </FieldShell>
);
