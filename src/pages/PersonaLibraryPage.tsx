import { useEffect, useState } from 'react';
import { Plus, Copy, Eye, Star, Lock, Archive, Settings2, CheckCircle2, Inbox } from 'lucide-react';
import { icApi, getConfigApiErrorDetail } from '@/lib/interviewConfigApi';
import { TENANT_ID } from '@/lib/config';
import { useNavigate } from '@/lib/router';
import { useToast } from '@/components/Toast';
import { useOptions, findOptionLabel } from '@/lib/optionsContext';
import type { Persona } from '@/types/interviewConfig';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader, EmptyState } from '@/components/ui/Feedback';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { PersonaPreview } from '@/components/PersonaPreview';

export const PersonaLibraryPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { options } = useOptions();
  const [personas, setPersonas] = useState<Persona[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Persona | null>(null);
  const [cloneTarget, setCloneTarget] = useState<Persona | null>(null);
  const [cloneName, setCloneName] = useState('');
  const [cloning, setCloning] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Persona | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await icApi.listPersonas(TENANT_ID);
      setPersonas(data);
    } catch (e) {
      setError(getConfigApiErrorDetail(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const system = (personas ?? []).filter((p) => p.tenant_id === 'system');
  const tenant = (personas ?? []).filter((p) => p.tenant_id !== 'system' && p.status === 'active');

  const openClone = (p: Persona) => {
    setCloneTarget(p);
    setCloneName(`Copy of ${p.name}`);
  };

  const doClone = async () => {
    if (!cloneTarget) return;
    setCloning(true);
    try {
      const cloned = await icApi.clonePersona(cloneTarget.id, TENANT_ID, cloneName);
      toast.show(`Cloned as "${cloned.name}"`, 'success');
      setCloneTarget(null);
      navigate('/settings/personas/edit', { id: cloned.id });
    } catch (e) {
      toast.show(getConfigApiErrorDetail(e), 'error');
    } finally {
      setCloning(false);
    }
  };

  const doArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await icApi.archivePersona(archiveTarget.id, TENANT_ID);
      toast.show(`"${archiveTarget.name}" archived`, 'success');
      setArchiveTarget(null);
      load();
    } catch (e) {
      toast.show(getConfigApiErrorDetail(e), 'error');
    } finally {
      setArchiving(false);
    }
  };

  const doSetDefault = async (p: Persona) => {
    setSettingDefault(p.id);
    try {
      await icApi.setPersonaDefault(p.id, TENANT_ID);
      toast.show(`"${p.name}" is now the default persona`, 'success');
      load();
    } catch (e) {
      toast.show(getConfigApiErrorDetail(e), 'error');
    } finally {
      setSettingDefault(null);
    }
  };

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-rose-600 mb-4">{error}</p>
        <Button onClick={load} variant="secondary">Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">AI Interviewer Personas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure the bot's voice, tone, and conversation style.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/settings/personas/new')}>
          New Persona
        </Button>
      </div>

      {/* System presets */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">System Presets</h2>
          <span className="text-xs text-slate-400">Read-only — clone to customize</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {system.map((p) => (
            <article key={p.id} className="card p-5 flex flex-col gap-3 hover:shadow-md hover:border-slate-300 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-semibold">
                    {p.display_name.charAt(0)}
                  </div>
                  {p.is_default && (
                    <Badge bg="#FFFBEB" color="#B45309">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> Default
                    </Badge>
                  )}
                </div>
                <Lock className="h-4 w-4 text-slate-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{p.display_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{p.name}</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                {options?.system_personas.find((s) => s.id === p.id)?.description ?? ''}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                <Badge bg="#F1F5F9" color="#475569">System</Badge>
                <Badge bg="#ECFDF5" color="#047857">Active</Badge>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" variant="secondary" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => setPreview(p)}>
                  View
                </Button>
                <Button size="sm" variant="ghost" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => openClone(p)}>
                  Clone
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Tenant personas */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Your Personas</h2>
        {tenant.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="No custom personas yet"
              description="Create a new persona or clone a system preset to get started."
              action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/settings/personas/new')}>New Persona</Button>}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tenant.map((p) => (
              <article key={p.id} className="card p-5 flex flex-col gap-3 hover:shadow-md hover:border-slate-300 transition-all duration-200 animate-row-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-semibold">
                      {p.display_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">{p.name}</h3>
                        {p.is_default && (
                          <Badge bg="#FFFBEB" color="#B45309">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Bot name: {p.display_name}</p>
                    </div>
                  </div>
                  <Badge bg="#ECFDF5" color="#047857">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Tone: <span className="text-slate-700 font-medium">{findOptionLabel(options?.persona.tone, p.config.tone)}</span></span>
                  <span>Pace: <span className="text-slate-700 font-medium">{findOptionLabel(options?.persona.pace, p.config.pace)}</span></span>
                  <span>Strictness: <span className="text-slate-700 font-medium">{findOptionLabel(options?.persona.strictness_level, p.config.strictness_level)}</span></span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Disclosure: <span className="text-slate-700 font-medium">{findOptionLabel(options?.persona.opening_disclosure, p.config.opening_disclosure)}</span></span>
                  <span>Closing: <span className="text-slate-700 font-medium">{findOptionLabel(options?.persona.closing_message, p.config.closing_message)}</span></span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" variant="secondary" icon={<Settings2 className="h-3.5 w-3.5" />} onClick={() => navigate('/settings/personas/edit', { id: p.id })}>
                    Edit
                  </Button>
                  {!p.is_default && (
                    <Button size="sm" variant="ghost" icon={<CheckCircle2 className="h-3.5 w-3.5" />} loading={settingDefault === p.id} onClick={() => doSetDefault(p)}>
                      Set Default
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => openClone(p)}>
                    Clone
                  </Button>
                  <Button size="sm" variant="ghost" icon={<Archive className="h-3.5 w-3.5" />} onClick={() => setArchiveTarget(p)}>
                    Archive
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Preview drawer */}
      <Drawer open={!!preview} onClose={() => setPreview(null)} title={preview?.name ?? ''} subtitle={preview?.id}
        footer={<Button variant="secondary" onClick={() => setPreview(null)}>Close</Button>}>
        {preview && <PersonaPreview persona={preview} />}
      </Drawer>

      {/* Clone modal */}
      <Modal open={!!cloneTarget} onClose={() => setCloneTarget(null)} title="Clone persona"
        description="Create a new editable copy of this persona."
        footer={<>
          <Button variant="secondary" onClick={() => setCloneTarget(null)}>Cancel</Button>
          <Button loading={cloning} icon={<Copy className="h-4 w-4" />} onClick={doClone} disabled={!cloneName.trim()}>Clone</Button>
        </>}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">New name</label>
          <input value={cloneName} onChange={(e) => setCloneName(e.target.value)} autoFocus
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/40" />
          {cloneTarget && <p className="text-xs text-slate-500 mt-1">Source: <span className="font-medium">{cloneTarget.name}</span></p>}
        </div>
      </Modal>

      {/* Archive modal */}
      <Modal open={!!archiveTarget} onClose={() => setArchiveTarget(null)} title="Archive persona"
        description="Archived personas can't be used in new interviews. This can't be undone."
        footer={<>
          <Button variant="secondary" onClick={() => setArchiveTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={archiving} icon={<Archive className="h-4 w-4" />} onClick={doArchive}>Archive</Button>
        </>}>
        <p className="text-sm text-slate-600">You're about to archive <span className="font-semibold text-slate-900">{archiveTarget?.name}</span>.</p>
      </Modal>
    </div>
  );
};
