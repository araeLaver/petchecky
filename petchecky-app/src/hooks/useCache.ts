"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  cache,
  getCache,
  CacheOptions,
  CacheStats,
  dedupe,
} from "@/lib/cache";

// ============================================
// useCachedValue Hook
// ============================================

interface UseCachedValueOptions<T> extends CacheOptions {
  fallback?: T;
  onError?: (error: Error) => void;
}

interface UseCachedValueReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  invalidate: () => void;
}

/**
 * 캐시된 값 훅
 */
export function useCachedValue<T>(
  key: string,
  factory: () => Promise<T>,
  options: UseCachedValueOptions<T> = {}
): UseCachedValueReturn<T> {
  const { fallback, onError, ...cacheOptions } = options;

  const [data, setData] = useState<T | null>(() => {
    const cached = cache.get<T>(key);
    return cached ?? fallback ?? null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const value = await dedupe(key, factory);

      if (mountedRef.current) {
        cache.set(key, value, cacheOptions);
        setData(value);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [key, factory, cacheOptions, onError]);

  useEffect(() => {
    mountedRef.current = true;

    // Check cache first
    const cached = cache.get<T>(key);
    if (cached !== null) {
      setData(cached);
    } else {
      fetch();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [key, fetch]);

  const refresh = useCallback(async () => {
    cache.delete(key);
    await fetch();
  }, [key, fetch]);

  const invalidate = useCallback(() => {
    cache.delete(key);
    setData(fallback ?? null);
  }, [key, fallback]);

  return { data, isLoading, error, refresh, invalidate };
}

// ============================================
// useCacheStats Hook
// ============================================

/**
 * 캐시 통계 훅
 */
export function useCacheStats(): CacheStats {
  const [stats, setStats] = useState<CacheStats>(() => cache.getStats());

  useEffect(() => {
    const unsubscribe = cache.subscribe(() => {
      setStats(cache.getStats());
    });

    return unsubscribe;
  }, []);

  return stats;
}

// ============================================
// useCacheInvalidation Hook
// ============================================

interface UseCacheInvalidationReturn {
  invalidateKey: (key: string) => void;
  invalidateByTag: (tag: string) => number;
  invalidateByPattern: (pattern: string) => number;
  clearAll: () => void;
}

/**
 * 캐시 무효화 훅
 */
export function useCacheInvalidation(): UseCacheInvalidationReturn {
  const invalidateKey = useCallback((key: string) => {
    cache.delete(key);
  }, []);

  const invalidateByTag = useCallback((tag: string) => {
    return cache.invalidateByTag(tag);
  }, []);

  const invalidateByPattern = useCallback((pattern: string) => {
    return cache.invalidateByPattern(pattern);
  }, []);

  const clearAll = useCallback(() => {
    cache.clear();
  }, []);

  return { invalidateKey, invalidateByTag, invalidateByPattern, clearAll };
}

// ============================================
// useSWR-like Hook
// ============================================

interface UseSWROptions<T> {
  fallbackData?: T;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  dedupingInterval?: number;
  ttl?: number;
  tags?: string[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseSWRReturn<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: T | Promise<T>) => Promise<void>;
}

/**
 * SWR-like 데이터 페칭 훅
 */
export function useSWRLike<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseSWROptions<T> = {}
): UseSWRReturn<T> {
  const {
    fallbackData,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval,
    ttl = 5 * 60 * 1000,
    tags,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(() => {
    if (!key) return fallbackData;
    const cached = cache.get<T>(key);
    return cached ?? fallbackData;
  });
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setIsLoading] = useState(!data);
  const [isValidating, setIsValidating] = useState(false);

  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const revalidate = useCallback(async () => {
    if (!key) return;

    setIsValidating(true);

    try {
      const result = await dedupe(key, fetcherRef.current);

      if (mountedRef.current) {
        cache.set(key, result, { ttl, tags });
        setData(result);
        setError(undefined);
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsValidating(false);
      }
    }
  }, [key, ttl, tags, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (!key) return;

    mountedRef.current = true;

    const cached = cache.get<T>(key);
    if (cached !== null) {
      setData(cached);
      setIsLoading(false);
    } else {
      revalidate();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [key, revalidate]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus || !key) return;

    const handleFocus = () => {
      revalidate();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [key, revalidateOnFocus, revalidate]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect || !key) return;

    const handleOnline = () => {
      revalidate();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [key, revalidateOnReconnect, revalidate]);

  // Refresh interval
  useEffect(() => {
    if (!refreshInterval || !key) return;

    const interval = setInterval(revalidate, refreshInterval);
    return () => clearInterval(interval);
  }, [key, refreshInterval, revalidate]);

  const mutate = useCallback(
    async (newData?: T | Promise<T>) => {
      if (!key) return;

      if (newData !== undefined) {
        const resolved = await newData;
        cache.set(key, resolved, { ttl, tags });
        setData(resolved);
      } else {
        await revalidate();
      }
    },
    [key, ttl, tags, revalidate]
  );

  return { data, error, isLoading, isValidating, mutate };
}

// ============================================
// usePreload Hook
// ============================================

/**
 * 데이터 사전 로드 훅
 */
export function usePreload<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): () => void {
  return useCallback(() => {
    if (!cache.has(key)) {
      dedupe(key, fetcher).then((data) => {
        cache.set(key, data, options);
      });
    }
  }, [key, fetcher, options]);
}

// ============================================
// useCacheSubscription Hook
// ============================================

type CacheEventType = "set" | "get" | "delete" | "clear" | "expire";

/**
 * 캐시 이벤트 구독 훅
 */
export function useCacheSubscription(
  callback: (event: { type: CacheEventType; key: string; value?: unknown }) => void,
  filter?: { keys?: string[]; types?: CacheEventType[] }
): void {
  useEffect(() => {
    const unsubscribe = cache.subscribe((event) => {
      // Apply filters
      if (filter?.keys && !filter.keys.includes(event.key)) return;
      if (filter?.types && !filter.types.includes(event.type)) return;

      callback(event);
    });

    return unsubscribe;
  }, [callback, filter]);
}

// ============================================
// useOptimisticUpdate Hook
// ============================================

interface UseOptimisticUpdateReturn<T> {
  data: T | null;
  update: (optimisticData: T, mutator: () => Promise<T>) => Promise<void>;
  isUpdating: boolean;
  error: Error | null;
}

/**
 * 낙관적 업데이트 훅
 */
export function useOptimisticUpdate<T>(
  key: string,
  initialData?: T
): UseOptimisticUpdateReturn<T> {
  const [data, setData] = useState<T | null>(() => {
    return cache.get<T>(key) ?? initialData ?? null;
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (optimisticData: T, mutator: () => Promise<T>) => {
      const previousData = data;
      setData(optimisticData);
      setIsUpdating(true);
      setError(null);

      try {
        const result = await mutator();
        cache.set(key, result);
        setData(result);
      } catch (err) {
        // Rollback on error
        setData(previousData);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [key, data]
  );

  return { data, update, isUpdating, error };
}
