export const API_MODE: 'mock' | 'real' =
  (import.meta.env.VITE_API_MODE as 'mock' | 'real') || 'mock';

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'https://api.yourapp.com';

export const TENANT_ID: string =
  import.meta.env.VITE_TENANT_ID || 'tenant_abc';

export const isMockMode = (): boolean => API_MODE === 'mock';
