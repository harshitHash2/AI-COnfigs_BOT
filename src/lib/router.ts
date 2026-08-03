import { useEffect, useState, useCallback } from 'react';

export interface RouteState {
  path: string;
  params: Record<string, string>;
}

const parse = (hash: string): RouteState => {
  const clean = hash.replace(/^#/, '') || '/';
  const [path, query = ''] = clean.split('?');
  const params: Record<string, string> = {};
  new URLSearchParams(query).forEach((v, k) => (params[k] = v));
  return { path: path || '/', params };
};

export const useHashRoute = (): RouteState => {
  const [route, setRoute] = useState<RouteState>(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
};

export const navigate = (path: string, params?: Record<string, string>) => {
  let target = path;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    if (qs) target += `?${qs}`;
  }
  window.location.hash = target;
};

export const useNavigate = () => useCallback(navigate, []);
