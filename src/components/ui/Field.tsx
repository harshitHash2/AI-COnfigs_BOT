import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

const baseField =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/40 disabled:bg-slate-50 disabled:text-slate-500';

interface FieldShellProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export const FieldShell = ({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className = '',
}: FieldShellProps) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
    {error ? (
      <p className="text-xs text-rose-600">{error}</p>
    ) : hint ? (
      <p className="text-xs text-slate-500 leading-snug">{hint}</p>
    ) : null}
  </div>
);

export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${baseField} ${props.className ?? ''}`} />
);

export const TextArea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`${baseField} resize-y min-h-[90px] ${props.className ?? ''}`} />
);

export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`${baseField} appearance-none pr-9 ${props.className ?? ''}`} />
);
