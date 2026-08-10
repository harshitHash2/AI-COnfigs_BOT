import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm disabled:bg-slate-300',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50',
  ghost:
    'text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm disabled:bg-rose-200',
  outline:
    'bg-transparent text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  disabled,
  className = '',
  ...rest
}: ButtonProps) => (
  <button
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:ring-offset-1 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    {...rest}
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
    {children}
    {iconRight}
  </button>
);
