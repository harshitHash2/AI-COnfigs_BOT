import { useEffect, useState } from 'react';
import { Search, Eye, ChevronDown, Star, CheckCircle2, Inbox } from 'lucide-react';
import { icApi, getConfigApiErrorDetail } from '@/lib/interviewConfigApi';
import { TENANT_ID } from '@/lib/config';
import { useToast } from '@/components/Toast';
import type { Rubric, InterviewType } from '@/types/interviewConfig';
import { INTERVIEW_TYPES, getTypeLabel } from '@/types/interviewConfig';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
  interviewType?: InterviewType;
}

export const RubricSelector = ({ value, onChange, interviewType }: Props) => {
  const toast = useToast();
  const [selected, setSelected] = useState<Rubric | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRubrics, setModalRubrics] = useState<Rubric[] | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalType, setModalType] = useState<InterviewType>(interviewType ?? 'technical');
  const [modalQuery, setModalQuery] = useState('');
  const [modalSelectedId, setModalSelectedId] = useState<string | null>(value);

  const loadSelected = async (id: string) => {
    setLoading(true);
    try {
      const r = await icApi.getRubric(id, TENANT_ID);
      setSelected(r);
    } catch (e) {
      toast.show(getConfigApiErrorDetail(e), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (value) loadSelected(value);
    else setSelected(null);
  }, [value]);

  const openModal = async () => {
    setModalOpen(true);
    setModalSelectedId(value);
    await loadModalRubrics(modalType);
  };

  const loadModalRubrics = async (type: InterviewType) => {
    setModalLoading(true);
    try {
      const data = await icApi.listRubrics(TENANT_ID, type);
      setModalRubrics(data.filter((r) => r.status === 'active'));
    } catch (e) {
      toast.show(getConfigApiErrorDetail(e), 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredModal = (modalRubrics ?? []).filter((r) => {
    if (modalQuery) {
      const q = modalQuery.toLowerCase();
      return r.name.toLowerCase().includes(q);
    }
    return true;
  });

  const applySelection = () => {
    onChange(modalSelectedId);
    setModalOpen(false);
    if (modalSelectedId) loadSelected(modalSelectedId);
    else setSelected(null);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Spinner className="h-4 w-4" /> Loading rubric...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="min-w-0">
          {selected ? (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-900 truncate">{selected.name}</p>
                {selected.is_default && (
                  <Badge bg="#FFFBED" color="#B45309"><Star className="h-3 w-3 fill-amber-400 text-amber-500" /> Default</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pass ≥ {selected.config.passing_score} · Strong hire ≥ {selected.config.strong_hire_score} · {selected.config.criteria.length} criteria
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">No rubric selected — platform default will be used</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selected && (
            <Button size="sm" variant="ghost" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => window.alert(selected.name)}>
              Preview
            </Button>
          )}
          <Button size="sm" variant="secondary" icon={<ChevronDown className="h-3.5 w-3.5" />} onClick={openModal}>
            Change
          </Button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Select Scoring Rubric${interviewType ? ` for ${getTypeLabel(interviewType)}` : ''}`}
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={applySelection}>Use selected rubric</Button>
        </>}>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={modalQuery} onChange={(e) => setModalQuery(e.target.value)} placeholder="Search..."
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/40" />
            </div>
            <Select value={modalType} onChange={(e) => { const t = e.target.value as InterviewType; setModalType(t); loadModalRubrics(t); }} className="w-36">
              {INTERVIEW_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </div>

          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {modalLoading ? (
              <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
            ) : (filteredModal ?? []).length === 0 ? (
              <EmptyState icon={<Inbox className="h-6 w-6" />} title="No rubrics found" description="No active rubrics match your filter." />
            ) : (
              filteredModal.map((r) => {
                const sel = modalSelectedId === r.id;
                return (
                  <button key={r.id} onClick={() => setModalSelectedId(r.id)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${sel ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? 'border-slate-900 bg-slate-900' : 'border-slate-300'}`}>
                      {sel && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{r.name}</p>
                        {r.is_default && <Badge bg="#FFFBED" color="#B45309">Default</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Pass ≥ {r.config.passing_score} · {r.config.criteria.length} criteria</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
