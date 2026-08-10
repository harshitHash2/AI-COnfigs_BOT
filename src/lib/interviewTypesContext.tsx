import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { InterviewTypeInfo } from '@/types/interviewType';
import { interviewTypeApi } from './interviewTypeApi';
import { TENANT_ID } from './config';

interface InterviewTypesContextValue {
  types: InterviewTypeInfo[];
  loading: boolean;
  error: string | null;
  getType: (slug: string | null | undefined) => InterviewTypeInfo | undefined;
  getTypeName: (slug: string | null | undefined) => string;
  refresh: () => Promise<void>;
}

const InterviewTypesContext = createContext<InterviewTypesContextValue | null>(null);

export const InterviewTypesProvider = ({ children }: { children: ReactNode }) => {
  const [types, setTypes] = useState<InterviewTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await interviewTypeApi.list(TENANT_ID);
      setTypes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load interview types');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getType = useCallback(
    (slug: string | null | undefined) =>
      slug ? types.find((t) => t.slug === slug || t.interview_type === slug) : undefined,
    [types],
  );

  const getTypeName = useCallback(
    (slug: string | null | undefined) => {
      if (!slug) return 'Custom';
      const t = types.find((x) => x.slug === slug || x.interview_type === slug);
      return t?.name ?? slug;
    },
    [types],
  );

  return (
    <InterviewTypesContext.Provider value={{ types, loading, error, getType, getTypeName, refresh: load }}>
      {children}
    </InterviewTypesContext.Provider>
  );
};

export const useInterviewTypes = (): InterviewTypesContextValue => {
  const ctx = useContext(InterviewTypesContext);
  if (!ctx)
    throw new Error('useInterviewTypes must be used within InterviewTypesProvider');
  return ctx;
};
