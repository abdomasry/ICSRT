import { useEffect, useState } from 'react';

// Persist per-page by key, default 'gradient'. Allowed: 'gradient' | 'cards' | 'list'
export function useViewMode(storageKey) {
  const key = `viewMode:${storageKey || 'default'}`;
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(key) || 'gradient';
    } catch {
      return 'gradient';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, viewMode);
    } catch {}
  }, [key, viewMode]);

  return { viewMode, setViewMode };
}
