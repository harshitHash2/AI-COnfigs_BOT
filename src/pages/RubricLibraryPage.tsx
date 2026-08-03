import { useEffect, useState, useCallback } from 'react';
import { Plus, Copy, Star, Archive, Settings2, Inbox, CheckCircle2 } from 'lucide-react';
import { icApi, getConfigApiErrorDetail } from '@/lib/interviewConfigApi';
import { TENANT_ID } from '@/lib/config';
import { useNavigate } from '@/lib/router';
import { useToast } from '@/components/Toast';
import type { Rubric, InterviewType } from '@/types/interviewConfig';
import { INTERVIEW_TYPES, getTypeLabel } from '@/types/interviewConfig';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader, EmptyState } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';

type Tab = InterviewType;

export const RubricLibraryPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('technical');
  const [cache, setCache] = useState<Partial<Record<Tab, Rubric[]>>>({});
  const [loadingTabs, setLoadingTabs] = useState<Partial<Record<Tab, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<Tab, string>>>({});
  const [cloneTarget, setCloneTarget] = useState<Rubric | null>(null);
  const [cloneName, setCloneName] = useState('');
  const [cloning, setCloning] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Rubric | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  const loadTab = useCallback(async (tab: Tab) => {
    setLoadingTabs((s) => ({ ...s, [tab]: true }));
    setErrors((s) => ({ ...s, [tab]: undefined }));
    try {
      const data = await icApi.listRubrics(TENANT_ID, tab);
      setCache((c) => ({ ...c, [tab]: data }));
    } catch (e) {
      setErrors((s) => ({ ...s, [tab]: getConfigApiErrorDetail(e) }));
    } finally {
      setLoadingTabs((s) => ({ ...s, [tab]: false }));
    }
  }, []);

  useEffect(() => {
    if (!cache[activeTab] && !loadingTabs[activeTab]) loadTab(activeTab);
  }, [activeTab, cache, loadingTabs, loadTab]);

  const rubrics = (cache[activeTab] ?? []).filter((r) => r.status === 'active');
  const isLoading = !!loadingTabs[activeTab];
  const tabError = errors[activeTab];

  const openClone = (r: Rubric) => {
    setCloneTarget(r);
    setCloneName(`Copy of ${r.name}`);
  };

  const doClone = async () => {
    if (!cloneTarget) return;
    setCloning(true);
    try {
      const cloned = await icApi.cloneRubric(cloneTarget.id, TENANT_ID, cloneName);
      toast.show(`Cloned as "${cloned.name}"`, 'success');
      setCloneTarget(null);
      loadTab(activeTab);
      navigate('/settings/rubrics/edit', { id: cloned.id });
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
      await icApi.archiveRubric(archiveTarget.id, TENANT_ID);
      toast.show(`"${archiveTarget.name}" archived`, 'success');
      setArchiveTarget(null);
      loadTab(activeTab);
    } catch (e) {
      toast.show(getConfigApiErrorDetail(e), 'error');
    } finally {
      setArchiving(false);
    }
  };

  const doSetDefault = async (r: Rubric) => {
    setSettingDefault(r.id);
    try {
      await icApi.setRubricDefault(r.id, TENANT_ID);
      toast.show(`"${r.name}" is now the default for ${getTypeLabel(activeTab)}`, 'success');
      loadTab(activeTab);
    } catch (e) {
      toast.show(getConfigApiErrorDetail(e), 'error');
    } finally {
      setSettingDefault(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Scoring Rubrics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Define how the AI evaluates and scores candidates.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/settings/rubrics/new', { type: activeTab })}>
          New Rubric
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {INTERVIEW_TYPES.map((t) => (
          <button key={t.value} onClick={() => setActiveTab(t.value)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.value
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : tabError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-rose-600 mb-4">{tabError}</p>
          <Button onClick={() => loadTab(activeTab)} variant="secondary">Retry</Button>
        </div>
      ) : rubrics.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title={`No custom rubric for ${getTypeLabel(activeTab)} yet`}
            description="Create a rubric for this interview type to start scoring candidates."
            action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/settings/rubrics/new', { type: activeTab })}>Create for {getTypeLabel(activeTab)}</Button>}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rubrics.map((r) => (
            <article key={r.id} className="card p-5 flex flex-col gap-3 hover:shadow-md hover:border-slate-300 transition-all duration-200 animate-row-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{r.name}</h3>
                  {r.is_default && (
                    <Badge bg="#FFFBEB" color="#B45309"><Star className="h-3 w-3 fill-amber-400 text-amber-500" /> Default</Badge>
                  )}
                </div>
                <Badge bg="#ECFDF5" color="#047857"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active</Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Pass ≥ <span className="text-slate-700 font-medium">{r.config.passing_score}</span></span>
                <span>Strong hire ≥ <span className="text-slate-700 font-medium">{r.config.strong_hire_score}</span></span>
                <span>Review <span className="text-slate-700 font-medium">{r.config.human_review_min}–{r.config.human_review_max}</span></span>
                <span><span className="text-slate-700 font-medium">{r.config.criteria.length}</span> criteria</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.config.criteria.map((c) => (
                  <span key={c.criterion_key} className="inline-flex items-center rounded-md bg-slate-50 border border-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {c.label} <span className="text-slate-400 ml-1">{c.weight_percent}%</span>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" variant="secondary" icon={<Settings2 className="h-3.5 w-3.5" />} onClick={() => navigate('/settings/rubrics/edit', { id: r.id })}>Edit</Button>
                <Button size="sm" variant="ghost" icon={<Copy className="h-3.5 w-3.5" />} onClick={() => openClone(r)}>Clone</Button>
                {!r.is_default && (
                  <Button size="sm" variant="ghost" icon={<CheckCircle2 className="h-3.5 w-3.5" />} loading={settingDefault === r.id} onClick={() => doSetDefault(r)}>Set Default</Button>
                )}
                <Button size="sm" variant="ghost" icon={<Archive className="h-3.5 w-3.5" />} onClick={() => setArchiveTarget(r)}>Archive</Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Clone modal */}
      <Modal open={!!cloneTarget} onClose={() => setCloneTarget(null)} title="Clone rubric"
        description="Create a new editable copy of this rubric."
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
      <Modal open={!!archiveTarget} onClose={() => setArchiveTarget(null)} title="Archive rubric"
        description="Archived rubrics can't be used in new interviews. This can't be undone."
        footer={<>
          <Button variant="secondary" onClick={() => setArchiveTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={archiving} icon={<Archive className="h-4 w-4" />} onClick={doArchive}>Archive</Button>
        </>}>
        <p className="text-sm text-slate-600">You're about to archive <span className="font-semibold text-slate-900">{archiveTarget?.name}</span>.</p>
      </Modal>
    </div>
  );
};
