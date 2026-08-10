import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  bg: string;
  color: string;
  className?: string;
}

export const Badge = ({ children, bg, color, className = '' }: BadgeProps) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}
    style={{ backgroundColor: bg, color }}
  >
    {children}
  </span>
);
