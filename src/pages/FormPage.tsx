import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, Wand2, AlertCircle } from 'lucide-react';
import { api, getApiErrorDetail } from '@/lib/api';
import { TENANT_ID } from '@/lib/config';
import { useNavigate } from '@/lib/router';
import { useToast } from '@/components/Toast';
import type {
  BehaviorConfigResponse,
  BehaviorConfigBody,
  BehaviorConfigCreate,
  InterviewType,
} from '@/types/behaviorConfig';
import { INTERVIEW_TYPE_OPTIONS, getTypeBadge } from '@/types/behaviorConfig';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { FieldShell, TextInput, TextArea, Select } from '@/components/ui/Field';
import { PageLoader } from '@/components/ui/Feedback';

interface FormPageProps {
  mode: 'new' | 'edit';
  configId?: string;
}

const emptyBody: BehaviorConfigBody = {
  interviewer_role_label: '',
  primary_objective: '',
  question_flow: '',
  opening_question_hint: '',
  show_level_guidance: true,
  additional_instructions: '',
  default_rubric_id: null,
};

interface FormState {
  name: string;
  description: string;
  interview_type: InterviewType | null;
  is_tenant_default: boolean;
  config: BehaviorConfigBody;
}

interface Errors {
  name?: string;
  interviewer_role_label?: string;
  primary_objective?: string;
  question_flow?: string;
}

const validate = (s: FormState): Errors => {
  const e: Errors = {};
  if (!s.name.trim()) e.name = 'Name is required';
  else if (s.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
  if (!s.config.interviewer_role_label.trim())
    e.interviewer_role_label = 'Bot role label is required';
  if (!s.config.primary_objective.trim())
    e.primary_objective = 'Primary objective is required';
  if (!s.config.question_flow.trim()) e.question_flow = 'Question flow is required';
  return e;
};

export const FormPage = ({ mode, configId }: FormPageProps) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [prefilling, setPrefilling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    interview_type: null,
    is_tenant_default: false,
    config: { ...emptyBody },
  });
  const [errors, setErrors] = useState<Errors>({});

  const loadExisting = async (id: string) => {
    setLoading(true);
    try {
      const c = await api.getConfig(id, TENANT_ID);
      setForm({
        name: c.name,
        description: c.description,
        interview_type: c.interview_type,
        is_tenant_default: c.is_tenant_default,
        config: { ...c.config },
      });
    } catch (e) {
      setError(getApiErrorDetail(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && configId) loadExisting(configId);
  }, [mode, configId]);

  const badge = useMemo(() => getTypeBadge(form.interview_type), [form.interview_type]);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const setConfig = (patch: Partial<BehaviorConfigBody>) =>
    setForm((f) => ({ ...f, config: { ...f.config, ...patch } }));

  const prefill = async () => {
    setPrefilling(true);
    try {
      const resolved = await api.resolveConfig(TENANT_ID, {
        interview_type: form.interview_type,
      });
      setConfig({
        interviewer_role_label:
          resolved.interviewer_role_label ?? form.config.interviewer_role_label,
        primary_objective:
          resolved.primary_objective ?? form.config.primary_objective,
        question_flow: resolved.question_flow ?? form.config.question_flow,
        opening_question_hint:
          resolved.opening_question_hint ?? form.config.opening_question_hint,
        show_level_guidance:
          resolved.show_level_guidance ?? form.config.show_level_guidance,
        additional_instructions:
          resolved.additional_instructions ?? form.config.additional_instructions,
        default_rubric_id:
          resolved.default_rubric_id ?? form.config.default_rubric_id,
      });
      toast.show('Auto-filled from matching default', 'success');
    } catch (e) {
      toast.show(getApiErrorDetail(e), 'error');
    } finally {
      setPrefilling(false);
    }
  };

  const save = async () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.show('Please fix the highlighted fields', 'error');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'new') {
        const body: BehaviorConfigCreate = {
          tenant_id: TENANT_ID,
          name: form.name.trim(),
          description: form.description.trim(),
          interview_type: form.interview_type,
          is_tenant_default: form.is_tenant_default,
          config: form.config,
        };
        const created = await api.createConfig(body);
        toast.show(`"${created.name}" created`, 'success');
        navigate('/configs');
      } else if (configId) {
        const updated = await api.updateConfig(configId, TENANT_ID, {
          name: form.name.trim(),
          description: form.description.trim(),
          is_tenant_default: form.is_tenant_default,
          config: form.config,
        });
        toast.show(`"${updated.name}" saved`, 'success');
        navigate('/configs');
      }
    } catch (err) {
      toast.show(getApiErrorDetail(err), 'error');
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
        <Button onClick={() => navigate('/configs')} variant="secondary">
          Back to configurations
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/configs')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to configurations
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {mode === 'new' ? 'New configuration' : 'Edit configuration'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {mode === 'new'
              ? 'Define how the interview bot behaves.'
              : 'Update bot behavior and settings.'}
          </p>
        </div>
        <Badge bg={badge.bg} color={badge.text}>
          {badge.label}
        </Badge>
      </div>

      <div className="flex flex-col gap-6">
        {/* Basics */}
        <section className="card p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-900">Basics</h2>

          <FieldShell
            label="Configuration name"
            htmlFor="name"
            required
            error={errors.name}
          >
            <TextInput
              id="name"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="e.g. Senior Backend Technical"
            />
          </FieldShell>

          <FieldShell label="Description" htmlFor="description">
            <TextArea
              id="description"
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Short summary of what this config is for."
              rows={2}
            />
          </FieldShell>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldShell label="Interview type" htmlFor="type" hint="Drives auto-fill and default resolution.">
              <Select
                id="type"
                value={form.interview_type ?? ''}
                onChange={(e) =>
                  set({
                    interview_type:
                      (e.target.value as InterviewType | '') || null,
                  })
                }
              >
                {INTERVIEW_TYPE_OPTIONS.map((o) => (
                  <option key={o.label} value={o.value ?? ''}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FieldShell>

            <div className="flex items-end">
              <Toggle
                checked={form.is_tenant_default}
                onChange={(v) => set({ is_tenant_default: v })}
                label="Set as tenant default"
                description="Used when no config is specified for this type."
              />
            </div>
          </div>
        </section>

        {/* Bot behavior */}
        <section className="card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Bot behavior</h2>
            <Button
              size="sm"
              variant="ghost"
              icon={<Wand2 className="h-3.5 w-3.5" />}
              loading={prefilling}
              onClick={prefill}
              disabled={!form.interview_type}
            >
              Auto-fill from default
            </Button>
          </div>

          <FieldShell
            label="Interviewer role label"
            htmlFor="role"
            required
            error={errors.interviewer_role_label}
            hint="How the bot introduces itself / its persona."
          >
            <TextInput
              id="role"
              value={form.config.interviewer_role_label}
              onChange={(e) =>
                setConfig({ interviewer_role_label: e.target.value })
              }
              placeholder="e.g. senior technical interviewer"
            />
          </FieldShell>

          <FieldShell
            label="Primary objective"
            htmlFor="objective"
            required
            error={errors.primary_objective}
            hint="The main goal the bot pursues during the interview."
          >
            <TextArea
              id="objective"
              value={form.config.primary_objective}
              onChange={(e) =>
                setConfig({ primary_objective: e.target.value })
              }
              placeholder="Assess role-relevant technical capability..."
              rows={3}
            />
          </FieldShell>

          <FieldShell
            label="Question flow"
            htmlFor="flow"
            required
            error={errors.question_flow}
            hint="Guidance on the structure and order of questions."
          >
            <TextArea
              id="flow"
              value={form.config.question_flow}
              onChange={(e) => setConfig({ question_flow: e.target.value })}
              placeholder="Use a mix of resume verification, fundamentals, implementation..."
              rows={4}
            />
          </FieldShell>

          <FieldShell
            label="Opening question hint"
            htmlFor="opening"
            hint="Suggested first question (overridden by platform script if present)."
          >
            <TextArea
              id="opening"
              value={form.config.opening_question_hint}
              onChange={(e) =>
                setConfig({ opening_question_hint: e.target.value })
              }
              placeholder="Start with one short project question..."
              rows={2}
            />
          </FieldShell>

          <FieldShell
            label="Additional instructions"
            htmlFor="extra"
            hint="Any extra constraints or emphasis for the bot."
          >
            <TextArea
              id="extra"
              value={form.config.additional_instructions}
              onChange={(e) =>
                setConfig({ additional_instructions: e.target.value })
              }
              placeholder="Always ask about remote team experience..."
              rows={3}
            />
          </FieldShell>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Toggle
              checked={form.config.show_level_guidance}
              onChange={(v) => setConfig({ show_level_guidance: v })}
              label="Show level guidance"
              description="Include level-specific hints to the bot."
            />

            <FieldShell
              label="Default rubric id"
              htmlFor="rubric"
              hint="Optional. Leave blank for none."
            >
              <TextInput
                id="rubric"
                value={form.config.default_rubric_id ?? ''}
                onChange={(e) =>
                  setConfig({
                    default_rubric_id: e.target.value || null,
                  })
                }
                placeholder="rubric_xxx"
              />
            </FieldShell>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/configs')}>
            Cancel
          </Button>
          <Button
            loading={saving}
            icon={<Save className="h-4 w-4" />}
            onClick={save}
          >
            {mode === 'new' ? 'Create configuration' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
