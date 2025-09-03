import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedQueryOptions<T> {
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
}

interface UseOptimizedQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isStale: boolean;
}

export function useOptimizedQuery<T>({
  queryFn,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  retry = 3,
  retryDelay = 1000
}: UseOptimizedQueryOptions<T>): UseOptimizedQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const cacheRef = useRef<{
    data: T | null;
    timestamp: number;
    isStale: boolean;
  }>({
    data: null,
    timestamp: 0,
    isStale: false
  });
  
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const executeQuery = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      
      cacheRef.current = {
        data: result,
        timestamp: Date.now(),
        isStale: false
      };
      
      setData(result);
      setIsStale(false);
      retryCountRef.current = 0;
      
      // Set stale timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsStale(true);
        cacheRef.current.isStale = true;
      }, staleTime);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => {
          executeQuery();
        }, retryDelay * retryCountRef.current);
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, enabled, staleTime, retry, retryDelay]);

  const refetch = useCallback(() => {
    retryCountRef.current = 0;
    executeQuery();
  }, [executeQuery]);

  useEffect(() => {
    if (enabled) {
      // Check if we have cached data
      if (cacheRef.current.data && Date.now() - cacheRef.current.timestamp < cacheTime) {
        setData(cacheRef.current.data);
        setIsStale(cacheRef.current.isStale);
        
        if (!cacheRef.current.isStale) {
          // Set stale timer
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            setIsStale(true);
            cacheRef.current.isStale = true;
          }, staleTime - (Date.now() - cacheRef.current.timestamp));
        }
      } else {
        executeQuery();
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, executeQuery, cacheTime, staleTime]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isStale
  };
}
