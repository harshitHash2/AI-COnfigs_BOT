import type { Persona } from '@/types/interviewConfig';
import { useOptions, findOptionLabel, findOptionText } from '@/lib/optionsContext';
import { Badge } from '@/components/ui/Badge';
import { UserCircle2, Gauge, ShieldAlert, GitBranch, MessageSquareQuote, Languages, FileText, Megaphone, Type } from 'lucide-react';

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
      {icon}{label}
    </div>
    <p className="text-sm text-slate-700 leading-relaxed">{value || <span className="text-slate-400 italic">Not set</span>}</p>
  </div>
);

export const PersonaPreview = ({ persona }: { persona: Persona }) => {
  const { options } = useOptions();
  const c = persona.config;
  const o = options?.persona;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 flex-wrap">
        {persona.is_default && <Badge bg="#FFFBEB" color="#B45309">Default</Badge>}
        {persona.tenant_id === 'system' && <Badge bg="#F1F5F9" color="#475569">System</Badge>}
        {persona.status === 'inactive' && <Badge bg="#FEE2E2" color="#B91C1C">Archived</Badge>}
      </div>
      <Row icon={<UserCircle2 className="h-3.5 w-3.5" />} label="Bot display name" value={c.display_name} />
      <Row icon={<Type className="h-3.5 w-3.5" />} label="Tone" value={findOptionLabel(o?.tone, c.tone)} />
      <Row icon={<Gauge className="h-3.5 w-3.5" />} label="Speaking pace" value={findOptionLabel(o?.pace, c.pace)} />
      <Row icon={<ShieldAlert className="h-3.5 w-3.5" />} label="Strictness" value={findOptionLabel(o?.strictness_level, c.strictness_level)} />
      <Row icon={<GitBranch className="h-3.5 w-3.5" />} label="Follow-up style" value={findOptionLabel(o?.follow_up_style, c.follow_up_style)} />
      <Row icon={<Type className="h-3.5 w-3.5" />} label="Max reply words" value={String(c.max_reply_words)} />
      <Row icon={<Languages className="h-3.5 w-3.5" />} label="Language policy" value={findOptionLabel(o?.language_policy, c.language_policy)} />
      <Row icon={<MessageSquareQuote className="h-3.5 w-3.5" />} label="Opening disclosure" value={findOptionText(o?.opening_disclosure, c.opening_disclosure)} />
      <Row icon={<Megaphone className="h-3.5 w-3.5" />} label="Closing message" value={findOptionText(o?.closing_message, c.closing_message)} />
    </div>
  );
};
