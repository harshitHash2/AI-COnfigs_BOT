import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, AlertCircle, Plus, RefreshCw, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { icApi, getConfigApiErrorDetail } from '@/lib/interviewConfigApi';
import { TENANT_ID } from '@/lib/config';
import { useNavigate } from '@/lib/router';
import { useToast } from '@/components/Toast';
import { useOptions } from '@/lib/optionsContext';
import type {
  Rubric,
  RubricConfig,
  RubricCreate,
  InterviewType,
  TypedCriterion,
} from '@/types/interviewConfig';
import { INTERVIEW_TYPES, getTypeLabel } from '@/types/interviewConfig';
import { Button } from '@/components/ui/Button';
import { FieldShell, TextInput, Select } from '@/components/ui/Field';
import { Toggle } from '@/components/ui/Toggle';
import { PageLoader } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';

interface Props {
  mode: 'new' | 'edit';
  rubricId?: string;
  initialType?: InterviewType;
}

interface FormState {
  name: string;
  interview_type: InterviewType | null;
  passing_score: number;
  strong_hire_score: number;
  human_review_min: number;
  human_review_max: number;
  criteria: TypedCriterion[];
  is_default: boolean;
}

interface Errors {
  name?: string;
  passing_score?: string;
  strong_hire_score?: string;
  human_review_min?: string;
  human_review_max?: string;
  criteria?: string;
}

const buildConfig = (f: FormState): RubricConfig => ({
  interview_type: f.interview_type,
  name: f.name,
  passing_score: f.passing_score,
  strong_hire_score: f.strong_hire_score,
  human_review_min: f.human_review_min,
  human_review_max: f.human_review_max,
  criteria: f.criteria,
});

const validate = (f: FormState): Errors => {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Name is required';
  else if (f.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
  else if (f.name.trim().length > 100) e.name = 'Name must be at most 100 characters';
  if (f.passing_score < 0 || f.passing_score > 100) e.passing_score = 'Must be 0–100';
  if (f.strong_hire_score < 0 || f.strong_hire_score > 100) e.strong_hire_score = 'Must be 0–100';
  if (f.passing_score > f.strong_hire_score)
    e.passing_score = 'Passing score must be ≤ Strong hire score';
  if (f.human_review_min < 0 || f.human_review_min > 100) e.human_review_min = 'Must be 0–100';
  if (f.human_review_max < 0 || f.human_review_max > 100) e.human_review_max = 'Must be 0–100';
  if (f.human_review_min > f.human_review_max)
    e.human_review_min = 'Min must be ≤ Max';
  if (f.criteria.length === 0) e.criteria = 'At least one criterion is required';
  return e;
};

export const RubricFormPage = ({ mode, rubricId, initialType }: Props) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { options } = useOptions();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<string[]>([]);
  const [typeChangeConfirm, setTypeChangeConfirm] = useState<InterviewType | null>(null);

  const defaultCriteria = useMemo(
    () => (initialType && options?.interview_type_criteria[initialType]) ?? [],
    [initialType, options],
  );

  const [form, setForm] = useState<FormState>({
    name: '',
    interview_type: initialType ?? 'technical',
    passing_score: 70,
    strong_hire_score: 85,
    human_review_min: 55,
    human_review_max: 69,
    criteria: [],
    is_default: false,
  });
  const [errors, setErrors] = useState<Errors>({});

  // Pre-fill criteria when options load (new mode)
  useEffect(() => {
    if (mode === 'new' && options && form.criteria.length === 0) {
      const type = form.interview_type;
      const defaults = options.interview_type_criteria[type as InterviewType];
      if (defaults) {
        setForm((f) => ({
          ...f,
          criteria: defaults.map((c) => ({ ...c })),
          passing_score: options.defaults.scoring_rubrics_by_type[type as InterviewType]?.passing_score ?? f.passing_score,
          strong_hire_score: options.defaults.scoring_rubrics_by_type[type as InterviewType]?.strong_hire_score ?? f.strong_hire_score,
          human_review_min: options.defaults.scoring_rubrics_by_type[type as InterviewType]?.human_review_min ?? f.human_review_min,
          human_review_max: options.defaults.scoring_rubrics_by_type[type as InterviewType]?.human_review_max ?? f.human_review_max,
        }));
      }
    }
  }, [mode, options, form.interview_type, form.criteria.length]);

  useEffect(() => {
    if (mode === 'edit' && rubricId) {
      (async () => {
        setLoading(true);
        try {
          const r = await icApi.getRubric(rubricId, TENANT_ID);
          setForm({
            name: r.name,
            interview_type: r.config.interview_type,
            passing_score: r.config.passing_score,
            strong_hire_score: r.config.strong_hire_score,
            human_review_min: r.config.human_review_min,
            human_review_max: r.config.human_review_max,
            criteria: r.config.criteria.map((c) => ({ ...c })),
            is_default: r.is_default,
          });
        } catch (e) {
          setError(getConfigApiErrorDetail(e));
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, rubricId]);

  const totalWeight = form.criteria.reduce((s, c) => s + c.weight_percent, 0);
  const weightValid = totalWeight === 100;

  const weightIndicator = useMemo(() => {
    if (totalWeight === 100)
      return { text: '100 / 100', color: 'text-emerald-600', icon: <CheckCircle2 className="h-4 w-4" />, bg: 'bg-emerald-50 border-emerald-200' };
    if (totalWeight < 100)
      return { text: `${totalWeight} / 100 — add ${100 - totalWeight}% more`, color: 'text-amber-600', icon: <AlertTriangle className="h-4 w-4" />, bg: 'bg-amber-50 border-amber-200' };
    return { text: `${totalWeight} / 100 — remove ${totalWeight - 100}%`, color: 'text-rose-600', icon: <AlertTriangle className="h-4 w-4" />, bg: 'bg-rose-50 border-rose-200' };
  }, [totalWeight]);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const applyTypeChange = (newType: InterviewType | null) => {
    if (newType && options?.interview_type_criteria[newType as InterviewType]) {
      const defaults = options.interview_type_criteria[newType as InterviewType]!;
      const defRubric = options.defaults.scoring_rubrics_by_type[newType as InterviewType];
      setForm((f) => ({
        ...f,
        interview_type: newType,
        criteria: defaults.map((c) => ({ ...c })),
        passing_score: defRubric?.passing_score ?? f.passing_score,
        strong_hire_score: defRubric?.strong_hire_score ?? f.strong_hire_score,
        human_review_min: defRubric?.human_review_min ?? f.human_review_min,
        human_review_max: defRubric?.human_review_max ?? f.human_review_max,
      }));
      toast.show(`Criteria reset to ${getTypeLabel(newType)} defaults`, 'info');
    } else {
      setForm((f) => ({ ...f, interview_type: newType }));
    }
  };

  const onTypeChange = (val: string) => {
    const newType = (val as InterviewType | '') || null;
    if (form.criteria.length > 0) {
      setTypeChangeConfirm(newType);
    } else {
      applyTypeChange(newType);
    }
  };

  const confirmTypeChange = () => {
    applyTypeChange(typeChangeConfirm);
    setTypeChangeConfirm(null);
  };

  const updateWeight = (idx: number, val: number) => {
    setForm((f) => ({
      ...f,
      criteria: f.criteria.map((c, i) => (i === idx ? { ...c, weight_percent: Math.max(0, Math.min(100, val)) } : c)),
    }));
  };

  const removeCriterion = (idx: number) => {
    setForm((f) => ({ ...f, criteria: f.criteria.filter((_, i) => i !== idx) }));
  };

  const autoBalance = () => {
    const n = form.criteria.length;
    if (n === 0) return;
    const base = Math.floor(100 / n);
    let remainder = 100 - base * n;
    setForm((f) => ({
      ...f,
      criteria: f.criteria.map((c, i) => {
        const w = base + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        return { ...c, weight_percent: w };
      }),
    }));
    toast.show('Weights auto-balanced', 'success');
  };

  const availableForPicker = useMemo(() => {
    const used = new Set(form.criteria.map((c) => c.criterion_key));
    const pool = options?.scoring_rubric.criteria ?? [];
    return pool.filter((c) => !used.has(c.criterion_key));
  }, [form.criteria, options]);

  const addPicked = () => {
    const picked = availableForPicker.filter((c) => pickerSelected.includes(c.criterion_key));
    setForm((f) => ({
      ...f,
      criteria: [...f.criteria, ...picked.map((c) => ({ ...c, weight_percent: 0 }))],
    }));
    setPickerOpen(false);
    setPickerSelected([]);
  };

  const save = async () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.show('Please fix the highlighted fields', 'error');
      return;
    }
    if (!weightValid) {
      toast.show('Criteria weights must total exactly 100%', 'error');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'new') {
        const body: RubricCreate = {
          tenant_id: TENANT_ID,
          name: form.name.trim(),
          is_default: form.is_default,
          status: 'active',
          config: buildConfig(form),
        };
        const created = await icApi.createRubric(body);
        toast.show(`"${created.name}" created`, 'success');
        navigate('/settings/rubrics');
      } else if (rubricId) {
        const updated = await icApi.updateRubric(rubricId, TENANT_ID, {
          name: form.name.trim(),
          is_default: form.is_default,
          config: buildConfig(form),
        });
        toast.show(`"${updated.name}" saved`, 'success');
        navigate('/settings/rubrics');
      }
    } catch (err) {
      toast.show(getConfigApiErrorDetail(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500 mb-3" />
        <p className="text-sm text-rose-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/settings/rubrics')} variant="secondary">Back to rubrics</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/settings/rubrics')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to rubrics
      </button>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">
        {mode === 'new' ? 'New Scoring Rubric' : `Edit "${form.name}"`}
      </h1>

      <div className="flex flex-col gap-6">
        {/* Setup */}
        <section className="card p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-900">Setup</h2>
          <FieldShell label="Rubric name" htmlFor="name" required error={errors.name}>
            <TextInput id="name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Senior Technical Rubric" />
          </FieldShell>
          <FieldShell label="Interview type" htmlFor="type" required hint="Selects the default criteria pool. Changing type resets criteria to type defaults.">
            <Select id="type" value={form.interview_type ?? ''} onChange={(e) => onTypeChange(e.target.value)}>
              {INTERVIEW_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              <option value="">Custom (no type)</option>
            </Select>
          </FieldShell>
        </section>

        {/* Scoring thresholds */}
        <section className="card p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-900">Scoring Thresholds</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldShell label="Passing score" htmlFor="pass" required error={errors.passing_score} hint="Minimum to pass (0–100)">
              <TextInput id="pass" type="number" min={0} max={100} value={form.passing_score} onChange={(e) => set({ passing_score: Number(e.target.value) })} />
            </FieldShell>
            <FieldShell label="Strong hire score" htmlFor="strong" required error={errors.strong_hire_score} hint="Bar for Strong Hire (0–100)">
              <TextInput id="strong" type="number" min={0} max={100} value={form.strong_hire_score} onChange={(e) => set({ strong_hire_score: Number(e.target.value) })} />
            </FieldShell>
            <FieldShell label="Human review min" htmlFor="hrmin" required error={errors.human_review_min} hint="Lower bound for manual review (0–100)">
              <TextInput id="hrmin" type="number" min={0} max={100} value={form.human_review_min} onChange={(e) => set({ human_review_min: Number(e.target.value) })} />
            </FieldShell>
            <FieldShell label="Human review max" htmlFor="hrmax" required error={errors.human_review_max} hint="Upper bound for manual review (0–100)">
              <TextInput id="hrmax" type="number" min={0} max={100} value={form.human_review_max} onChange={(e) => set({ human_review_max: Number(e.target.value) })} />
            </FieldShell>
          </div>
          {form.passing_score > form.strong_hire_score && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-xs text-amber-700">Passing score must be less than or equal to Strong hire score</p>
            </div>
          )}
        </section>

        {/* Evaluation criteria */}
        <section className="card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Evaluation Criteria</h2>
            <div className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${weightIndicator.bg} ${weightIndicator.color}`}>
              {weightIndicator.icon}
              Total weight: {weightIndicator.text}
            </div>
          </div>
          {errors.criteria && <p className="text-xs text-rose-600">{errors.criteria}</p>}

          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
            {form.criteria.map((c, idx) => (
              <div key={c.criterion_key} className="flex items-start gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{c.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{c.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <input type="number" min={0} max={100} value={c.weight_percent}
                      onChange={(e) => updateWeight(idx, Number(e.target.value))}
                      className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-800 text-right focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/40" />
                    <span className="text-sm text-slate-400">%</span>
                  </div>
                  <button onClick={() => removeCriterion(idx)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {form.criteria.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">No criteria yet. Add one below.</div>
            )}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setPickerOpen(true)} disabled={availableForPicker.length === 0}>
              Add criterion
            </Button>
            <Button size="sm" variant="ghost" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={autoBalance} disabled={form.criteria.length === 0}>
              Auto-balance weights
            </Button>
          </div>
        </section>

        <Toggle checked={form.is_default} onChange={(v) => set({ is_default: v })}
          label={`Set as default rubric for ${getTypeLabel(form.interview_type)} interviews`} />

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/settings/rubrics')}>Cancel</Button>
          <Button loading={saving} icon={<Save className="h-4 w-4" />} onClick={save} disabled={!weightValid}>
            {mode === 'new' ? 'Create Rubric' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Add criterion picker */}
      <Modal open={pickerOpen} onClose={() => { setPickerOpen(false); setPickerSelected([]); }} title="Add Criterion"
        footer={<>
          <Button variant="secondary" onClick={() => { setPickerOpen(false); setPickerSelected([]); }}>Cancel</Button>
          <Button onClick={addPicked} disabled={pickerSelected.length === 0}>Add selected</Button>
        </>}>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {availableForPicker.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">All available criteria are already in this rubric.</p>
          ) : (
            availableForPicker.map((c) => {
              const sel = pickerSelected.includes(c.criterion_key);
              return (
                <button key={c.criterion_key} onClick={() => {
                  setPickerSelected((s) => sel ? s.filter((k) => k !== c.criterion_key) : [...s, c.criterion_key]);
                }}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${sel ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? 'border-slate-900 bg-slate-900' : 'border-slate-300'}`}>
                    {sel && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Modal>

      {/* Type change confirm */}
      <Modal open={!!typeChangeConfirm} onClose={() => setTypeChangeConfirm(null)} title="Change interview type?"
        description="Changing the interview type will reset your criteria to that type's defaults. Your current weights will be lost."
        footer={<>
          <Button variant="secondary" onClick={() => setTypeChangeConfirm(null)}>Cancel</Button>
          <Button onClick={confirmTypeChange}>Change type</Button>
        </>}>
        <p className="text-sm text-slate-600">Switch to <span className="font-semibold text-slate-900">{typeChangeConfirm ? getTypeLabel(typeChangeConfirm) : ''}</span> and reset criteria?</p>
      </Modal>
    </div>
  );
};
