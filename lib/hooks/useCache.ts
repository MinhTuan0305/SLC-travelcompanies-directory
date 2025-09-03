import { useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export function useCache<T>(expiryMs: number = 5 * 60 * 1000) { // 5 minutes default
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp + entry.expiry) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T, customExpiry?: number) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      expiry: customExpiry || expiryMs
    });
  }, [expiryMs]);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.timestamp + entry.expiry) {
      cacheRef.current.delete(key);
      return false;
    }
    
    return true;
  }, []);

  return { get, set, clear, has };
}
