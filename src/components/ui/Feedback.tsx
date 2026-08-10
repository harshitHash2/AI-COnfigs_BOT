import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <Loader2 className={`animate-spin text-slate-400 ${className}`} />
);

export const PageLoader = () => (
  <div className="flex items-center justify-center py-24">
    <Spinner className="h-7 w-7" />
  </div>
);

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);
