import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ConfigOptions } from '@/types/interviewConfig';
import { icApi, getConfigApiErrorDetail } from '@/lib/interviewConfigApi';

interface OptionsContextValue {
  options: ConfigOptions | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const OptionsContext = createContext<OptionsContextValue | null>(null);

export const OptionsProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfigOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const opts = await icApi.getOptions();
      setOptions(opts);
    } catch (e) {
      setError(getConfigApiErrorDetail(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <OptionsContext.Provider value={{ options, loading, error, reload: load }}>
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptions = (): OptionsContextValue => {
  const ctx = useContext(OptionsContext);
  if (!ctx) throw new Error('useOptions must be used within OptionsProvider');
  return ctx;
};

// Helper to find an option label by value
export const findOptionLabel = (
  list: { value: string; label: string }[] | undefined,
  value: string,
): string => list?.find((o) => o.value === value)?.label ?? value;

export const findOptionText = (
  list: { value: string; text?: string; prompt_text?: string }[] | undefined,
  value: string,
): string => list?.find((o) => o.value === value)?.text ?? list?.find((o) => o.value === value)?.prompt_text ?? '';
