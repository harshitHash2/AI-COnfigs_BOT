import type { BehaviorConfigResponse } from '@/types/behaviorConfig';
import { getTypeBadge } from '@/types/behaviorConfig';
import { Badge } from '@/components/ui/Badge';
import { UserCircle2, Target, GitBranch, MessageSquareQuote, ListChecks, FileText, Award } from 'lucide-react';

interface ConfigPreviewProps {
  config: BehaviorConfigResponse;
  compact?: boolean;
}

const Section = ({
  icon,
  label,
  value,
  compact,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  compact?: boolean;
}) => (
  <div className={compact ? '' : 'flex flex-col gap-1'}>
    <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
      {icon}
      {label}
    </div>
    <p className={`text-sm text-slate-700 leading-relaxed ${compact ? 'mt-0.5' : ''}`}>
      {value || <span className="text-slate-400 italic">Not set</span>}
    </p>
  </div>
);

export const ConfigPreview = ({ config, compact = false }: ConfigPreviewProps) => {
  const badge = getTypeBadge(config.interview_type);
  const c = config.config;

  return (
    <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-5'}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge bg={badge.bg} color={badge.text}>
          {badge.label}
        </Badge>
        {config.is_tenant_default && (
          <Badge bg="#FFFBEB" color="#B45309">
            Tenant default
          </Badge>
        )}
        {config.is_system_default && (
          <Badge bg="#F1F5F9" color="#475569">
            System
          </Badge>
        )}
        {config.status === 'inactive' && (
          <Badge bg="#FEE2E2" color="#B91C1C">
            Archived
          </Badge>
        )}
      </div>

      <Section
        icon={<UserCircle2 className="h-3.5 w-3.5" />}
        label="Bot role"
        value={c.interviewer_role_label}
        compact={compact}
      />
      <Section
        icon={<Target className="h-3.5 w-3.5" />}
        label="Primary objective"
        value={c.primary_objective}
        compact={compact}
      />
      <Section
        icon={<GitBranch className="h-3.5 w-3.5" />}
        label="Question flow"
        value={c.question_flow}
        compact={compact}
      />
      <Section
        icon={<MessageSquareQuote className="h-3.5 w-3.5" />}
        label="Opening question hint"
        value={c.opening_question_hint}
        compact={compact}
      />
      {!compact && (
        <Section
          icon={<FileText className="h-3.5 w-3.5" />}
          label="Additional instructions"
          value={c.additional_instructions}
        />
      )}
      {!compact && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            <ListChecks className="h-3.5 w-3.5" />
            Level guidance
          </div>
          <p className="text-sm text-slate-700">
            {c.show_level_guidance ? 'Shown to the bot during the interview' : 'Hidden from the bot'}
          </p>
        </div>
      )}
      {!compact && c.default_rubric_id && (
        <Section
          icon={<Award className="h-3.5 w-3.5" />}
          label="Default rubric"
          value={c.default_rubric_id}
        />
      )}
    </div>
  );
};
