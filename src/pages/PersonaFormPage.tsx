import { useEffect, useState } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { icApi, getConfigApiErrorDetail } from '@/lib/interviewConfigApi';
import { TENANT_ID } from '@/lib/config';
import { useNavigate } from '@/lib/router';
import { useToast } from '@/components/Toast';
import { useOptions, findOptionText } from '@/lib/optionsContext';
import type { Persona, PersonaConfig, PersonaCreate } from '@/types/interviewConfig';
import { Button } from '@/components/ui/Button';
import { FieldShell, TextInput, Select } from '@/components/ui/Field';
import { Toggle } from '@/components/ui/Toggle';
import { PageLoader } from '@/components/ui/Feedback';

interface Props {
  mode: 'new' | 'edit';
  personaId?: string;
}

const emptyConfig = (defaults?: Partial<PersonaConfig>): PersonaConfig => ({
  display_name: defaults?.display_name ?? '',
  tone: defaults?.tone ?? 'calm_respectful',
  pace: defaults?.pace ?? 'slow_measured',
  strictness_level: defaults?.strictness_level ?? 'balanced',
  follow_up_style: defaults?.follow_up_style ?? 'adaptive',
  max_reply_words: defaults?.max_reply_words ?? 40,
  opening_disclosure: defaults?.opening_disclosure ?? 'standard_ai_disclosure',
  closing_message: defaults?.closing_message ?? 'standard_thank_you',
  language_policy: defaults?.language_policy ?? 'clear_indian_english',
});

interface FormState {
  name: string;
  display_name: string;
  is_default: boolean;
  config: PersonaConfig;
}

interface Errors {
  name?: string;
  display_name?: string;
  max_reply_words?: string;
}

const validate = (s: FormState): Errors => {
  const e: Errors = {};
  if (!s.name.trim()) e.name = 'Name is required';
  else if (s.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
  else if (s.name.trim().length > 100) e.name = 'Name must be at most 100 characters';
  if (!s.display_name.trim()) e.display_name = 'Bot display name is required';
  else if (s.display_name.trim().length < 2) e.display_name = 'Must be at least 2 characters';
  else if (s.display_name.trim().length > 60) e.display_name = 'Must be at most 60 characters';
  if (s.config.max_reply_words < 12 || s.config.max_reply_words > 120)
    e.max_reply_words = 'Must be between 12 and 120';
  return e;
};

export const PersonaFormPage = ({ mode, personaId }: Props) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { options } = useOptions();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '',
    display_name: '',
    is_default: false,
    config: emptyConfig(options?.defaults.persona),
  });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (mode === 'new' && options) {
      setForm((f) => ({ ...f, config: emptyConfig(options.defaults.persona) }));
    }
  }, [mode, options]);

  useEffect(() => {
    if (mode === 'edit' && personaId) {
      (async () => {
        setLoading(true);
        try {
          const p = await icApi.getPersona(personaId, TENANT_ID);
          setForm({
            name: p.name,
            display_name: p.display_name,
            is_default: p.is_default,
            config: { ...p.config },
          });
        } catch (e) {
          setError(getConfigApiErrorDetail(e));
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, personaId]);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const setConfig = (patch: Partial<PersonaConfig>) =>
    setForm((f) => ({ ...f, config: { ...f.config, ...patch } }));

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
        const body: PersonaCreate = {
          tenant_id: TENANT_ID,
          name: form.name.trim(),
          display_name: form.display_name.trim(),
          is_default: form.is_default,
          status: 'active',
          config: { ...form.config, display_name: form.display_name.trim() },
        };
        const created = await icApi.createPersona(body);
        toast.show(`"${created.name}" created`, 'success');
        navigate('/settings/personas');
      } else if (personaId) {
        const updated = await icApi.updatePersona(personaId, TENANT_ID, {
          name: form.name.trim(),
          display_name: form.display_name.trim(),
          is_default: form.is_default,
          config: { ...form.config, display_name: form.display_name.trim() },
        });
        toast.show(`"${updated.name}" saved`, 'success');
        navigate('/settings/personas');
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
        <Button onClick={() => navigate('/settings/personas')} variant="secondary">Back to personas</Button>
      </div>
    );
  }

  const o = options?.persona;
  const disclosureText = findOptionText(o?.opening_disclosure, form.config.opening_disclosure);
  const closingText = findOptionText(o?.closing_message, form.config.closing_message);

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/settings/personas')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to personas
      </button>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">
        {mode === 'new' ? 'New Persona' : `Edit "${form.name}"`}
      </h1>

      <div className="flex flex-col gap-6">
        {/* Bot identity */}
        <section className="card p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-900">Bot Identity</h2>
          <FieldShell label="Config name" htmlFor="name" required error={errors.name} hint="Internal label for this persona">
            <TextInput id="name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. My Custom Priya" />
          </FieldShell>
          <FieldShell label="Bot display name" htmlFor="dname" required error={errors.display_name} hint="What the bot says its name is">
            <TextInput id="dname" value={form.display_name} onChange={(e) => set({ display_name: e.target.value })} placeholder="e.g. Priya AI Interviewer" />
          </FieldShell>
        </section>

        {/* Conversation style */}
        <section className="card p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-900">Conversation Style</h2>
          <FieldShell label="Tone" htmlFor="tone" required hint={findOptionText(o?.tone, form.config.tone) ? `Preview: "${findOptionText(o?.tone, form.config.tone)}"` : undefined}>
            <Select id="tone" value={form.config.tone} onChange={(e) => setConfig({ tone: e.target.value })}>
              {o?.tone.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </Select>
          </FieldShell>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldShell label="Speaking pace" htmlFor="pace" required>
              <Select id="pace" value={form.config.pace} onChange={(e) => setConfig({ pace: e.target.value })}>
                {o?.pace.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
              </Select>
            </FieldShell>
            <FieldShell label="Strictness" htmlFor="strict" required>
              <Select id="strict" value={form.config.strictness_level} onChange={(e) => setConfig({ strictness_level: e.target.value })}>
                {o?.strictness_level.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
              </Select>
            </FieldShell>
          </div>
          <FieldShell label="Follow-up style" htmlFor="follow" required>
            <Select id="follow" value={form.config.follow_up_style} onChange={(e) => setConfig({ follow_up_style: e.target.value })}>
              {o?.follow_up_style.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </Select>
          </FieldShell>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldShell label="Max reply words" htmlFor="words" required error={errors.max_reply_words} hint="12–120 words">
              <TextInput id="words" type="number" min={12} max={120} value={form.config.max_reply_words}
                onChange={(e) => setConfig({ max_reply_words: Number(e.target.value) })} />
            </FieldShell>
            <FieldShell label="Language policy" htmlFor="lang" required>
              <Select id="lang" value={form.config.language_policy} onChange={(e) => setConfig({ language_policy: e.target.value })}>
                {o?.language_policy.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
              </Select>
            </FieldShell>
          </div>
        </section>

        {/* Opening disclosure */}
        <section className="card p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-900">Opening Disclosure</h2>
          <p className="text-xs text-slate-500 -mt-2">What the bot says when introducing itself</p>
          <FieldShell label="Disclosure" htmlFor="disclosure" required>
            <Select id="disclosure" value={form.config.opening_disclosure} onChange={(e) => setConfig({ opening_disclosure: e.target.value })}>
              {o?.opening_disclosure.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </Select>
          </FieldShell>
          {disclosureText && (
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-400 mb-1">Preview</p>
              <p className="text-sm text-slate-700 italic">"{disclosureText}"</p>
            </div>
          )}
        </section>

        {/* Closing message */}
        <section className="card p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-900">Closing Message</h2>
          <p className="text-xs text-slate-500 -mt-2">What the bot says when ending the interview</p>
          <FieldShell label="Closing" htmlFor="closing" required>
            <Select id="closing" value={form.config.closing_message} onChange={(e) => setConfig({ closing_message: e.target.value })}>
              {o?.closing_message.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </Select>
          </FieldShell>
          {closingText && (
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-400 mb-1">Preview</p>
              <p className="text-sm text-slate-700 italic">"{closingText}"</p>
            </div>
          )}
        </section>

        <Toggle checked={form.is_default} onChange={(v) => set({ is_default: v })}
          label="Set as default persona for all interviews" />

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/settings/personas')}>Cancel</Button>
          <Button loading={saving} icon={<Save className="h-4 w-4" />} onClick={save}>
            {mode === 'new' ? 'Create Persona' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
