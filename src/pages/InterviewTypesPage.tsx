import { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  Clock,
  TrendingUp,
  Inbox,
  Save,
  AlertCircle,
} from 'lucide-react';
import { interviewTypeApi, getInterviewTypeErrorDetail } from '@/lib/interviewTypeApi';
import { useInterviewTypes } from '@/lib/interviewTypesContext';
import { TENANT_ID } from '@/lib/config';
import { useToast } from '@/components/Toast';
import type { InterviewTypeInfo, InterviewTypeCreate } from '@/types/interviewType';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FieldShell, TextInput, TextArea, Select } from '@/components/ui/Field';
import { PageLoader, EmptyState } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';

const LEVEL_OPTIONS = [
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

const getLevelLabel = (level: string): string =>
  LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? level;

export const InterviewTypesPage = () => {
  const { types, loading, error, refresh } = useInterviewTypes();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<InterviewTypeInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InterviewTypeInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const systemTypes = types.filter((t) => t.scope === 'system');
  const tenantTypes = types.filter((t) => t.scope === 'tenant' && t.tenant_id === TENANT_ID);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500 mb-3" />
        <p className="text-sm text-rose-600 mb-4">{error}</p>
        <Button onClick={refresh} variant="secondary">Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Interview Types</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage the interview types available across your organization.
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
          Add custom type
        </Button>
      </div>

      {/* System types */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">System types</h2>
            <p className="text-sm text-slate-500 mt-0.5">Built-in types available to all tenants. Read-only.</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" /> Read-only
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemTypes.map((t) => (
            <article key={t.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge bg="#F1F5F9" color="#475569">{t.name}</Badge>
                </div>
                <Lock className="h-4 w-4 text-slate-300" />
              </div>
              {t.description && (
                <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-auto pt-1">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {t.default_duration_minutes} min
                </span>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {getLevelLabel(t.default_level)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Tenant types */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Custom types</h2>
            <p className="text-sm text-slate-500 mt-0.5">Types created by your organization. Editable and deletable.</p>
          </div>
        </div>
        {tenantTypes.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Inbox className="h-6 w-6" />}
              title="No custom interview types yet"
              description="Create a custom type to match your organization's interview workflow."
              action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Add custom type</Button>}
            />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium hidden md:table-cell">Description</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Level</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenantTypes.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors animate-row-in">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{t.slug}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="text-xs text-slate-500 max-w-xs truncate">{t.description ?? '—'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{t.default_duration_minutes} min</td>
                      <td className="px-5 py-3.5 text-slate-600">{getLevelLabel(t.default_level)}</td>
                      <td className="px-5 py-3.5">
                        {t.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditTarget(t)} title="Edit"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(t)} title="Delete"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {showCreate && (
        <CreateTypeModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); refresh(); }}
          saving={saving}
          setSaving={setSaving}
        />
      )}

      {editTarget && (
        <EditTypeModal
          type={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); refresh(); }}
          saving={saving}
          setSaving={setSaving}
        />
      )}

      {deleteTarget && (
        <Modal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete interview type"
          description="This will deactivate the type. Existing configs using it will still reference the slug."
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" loading={deleting} icon={<Trash2 className="h-4 w-4" />}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await interviewTypeApi.softDelete(deleteTarget.id, TENANT_ID);
                    toast.show(`"${deleteTarget.name}" deleted`, 'success');
                    setDeleteTarget(null);
                    refresh();
                  } catch (e) {
                    toast.show(getInterviewTypeErrorDetail(e), 'error');
                  } finally {
                    setDeleting(false);
                  }
                }}>
                Delete
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">
            You're about to delete <span className="font-semibold text-slate-900">{deleteTarget.name}</span>.
            It will be marked inactive and removed from dropdowns.
          </p>
        </Modal>
      )}
    </div>
  );
};

interface ModalProps {
  onClose: () => void;
  onDone: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
}

const LEVEL_OPTIONS_MODAL = [
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

const CreateTypeModal = ({ onClose, onDone, saving, setSaving }: ModalProps) => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [level, setLevel] = useState('mid');

  const save = async () => {
    if (!name.trim()) { toast.show('Name is required', 'error'); return; }
    setSaving(true);
    try {
      const body: InterviewTypeCreate = {
        tenant_id: TENANT_ID,
        name: name.trim(),
        description: description.trim() || undefined,
        default_duration_minutes: duration,
        default_level: level,
      };
      await interviewTypeApi.create(body);
      toast.show(`"${name}" created`, 'success');
      onDone();
    } catch (e) {
      toast.show(getInterviewTypeErrorDetail(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Add custom interview type"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={saving} icon={<Save className="h-4 w-4" />} onClick={save}>Create</Button>
      </>}>
      <div className="flex flex-col gap-4">
        <FieldShell label="Name" htmlFor="it-name" required>
          <TextInput id="it-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Domain Expert" autoFocus />
        </FieldShell>
        <FieldShell label="Description" htmlFor="it-desc">
          <TextArea id="it-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What this interview type assesses..." />
        </FieldShell>
        <div className="grid grid-cols-2 gap-4">
          <FieldShell label="Default duration (min)" htmlFor="it-dur" required>
            <TextInput id="it-dur" type="number" min={5} max={120} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </FieldShell>
          <FieldShell label="Default level" htmlFor="it-level" required>
            <Select id="it-level" value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVEL_OPTIONS_MODAL.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FieldShell>
        </div>
      </div>
    </Modal>
  );
};

const EditTypeModal = ({ type, onClose, onDone, saving, setSaving }: ModalProps & { type: InterviewTypeInfo }) => {
  const toast = useToast();
  const [name, setName] = useState(type.name);
  const [description, setDescription] = useState(type.description ?? '');
  const [duration, setDuration] = useState(type.default_duration_minutes);
  const [level, setLevel] = useState(type.default_level);

  const save = async () => {
    if (!name.trim()) { toast.show('Name is required', 'error'); return; }
    setSaving(true);
    try {
      await interviewTypeApi.update(type.id, TENANT_ID, {
        name: name.trim(),
        description: description.trim() || undefined,
        default_duration_minutes: duration,
        default_level: level,
      });
      toast.show(`"${name}" saved`, 'success');
      onDone();
    } catch (e) {
      toast.show(getInterviewTypeErrorDetail(e), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Edit "${type.name}"`}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={saving} icon={<Save className="h-4 w-4" />} onClick={save}>Save</Button>
      </>}>
      <div className="flex flex-col gap-4">
        <FieldShell label="Name" htmlFor="it-edit-name" required>
          <TextInput id="it-edit-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </FieldShell>
        <FieldShell label="Description" htmlFor="it-edit-desc">
          <TextArea id="it-edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </FieldShell>
        <div className="grid grid-cols-2 gap-4">
          <FieldShell label="Default duration (min)" htmlFor="it-edit-dur" required>
            <TextInput id="it-edit-dur" type="number" min={5} max={120} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </FieldShell>
          <FieldShell label="Default level" htmlFor="it-edit-level" required>
            <Select id="it-edit-level" value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVEL_OPTIONS_MODAL.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FieldShell>
        </div>
      </div>
    </Modal>
  );
};
