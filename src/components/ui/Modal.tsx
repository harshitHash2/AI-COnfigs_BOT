import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-pop-in">
        <header className="flex items-start justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && (
              <p className="text-sm text-slate-500 mt-1 leading-snug">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="px-6 pb-4">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 rounded-b-2xl">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
