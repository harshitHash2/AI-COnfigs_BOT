interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export const Toggle = ({
  checked,
  onChange,
  disabled = false,
  label,
  description,
}: ToggleProps) => (
  <label className={`flex items-start gap-3 ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400/40 ${
        checked ? 'bg-slate-900' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
    {(label || description) && (
      <span className="flex flex-col">
        {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
        {description && (
          <span className="text-xs text-slate-500 leading-snug mt-0.5">{description}</span>
        )}
      </span>
    )}
  </label>
);
