/**
 * 고급 캐싱 시스템
 * 인메모리 캐시 + ISR 최적화
 */

// ============================================
// Types
// ============================================

export interface CacheEntry<T = unknown> {
  value: T;
  createdAt: number;
  expiresAt: number | null;
  accessCount: number;
  lastAccessedAt: number;
  tags: string[];
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[];
  staleWhileRevalidate?: number;
  priority?: "low" | "normal" | "high";
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
  hitRate: number;
}

export interface CacheConfig {
  maxSize: number;
  maxMemoryMB: number;
  defaultTTL: number;
  cleanupInterval: number;
  enableStats: boolean;
}

type CacheListener = (event: {
  type: "set" | "get" | "delete" | "clear" | "expire";
  key: string;
  value?: unknown;
}) => void;

// ============================================
// Default Config
// ============================================

const defaultConfig: CacheConfig = {
  maxSize: 1000,
  maxMemoryMB: 50,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
  enableStats: true,
};

// ============================================
// MemoryCache Class
// ============================================

class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    memoryUsage: 0,
    hitRate: 0,
  };
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<CacheListener> = new Set();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.startCleanup();
  }

  // ============================================
  // Core Operations
  // ============================================

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.recordMiss();
      return null;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      this.recordMiss();
      this.emit("expire", key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessedAt = Date.now();

    this.recordHit();
    this.emit("get", key, entry.value);

    return entry.value as T;
  }

  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const { ttl = this.config.defaultTTL, tags = [] } = options;

    // Check size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      createdAt: Date.now(),
      expiresAt: ttl > 0 ? Date.now() + ttl : null,
      accessCount: 0,
      lastAccessedAt: Date.now(),
      tags,
    };

    this.cache.set(key, entry);
    this.updateStats();
    this.emit("set", key, value);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
      this.emit("delete", key);
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.updateStats();
    this.emit("clear", "*");
  }

  // ============================================
  // Advanced Operations
  // ============================================

  /**
   * Get or set pattern
   */
  async getOrSet<T>(
    key: string,
    factory: () => T | Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, options);
    return value;
  }

  /**
   * Stale-while-revalidate pattern
   */
  async getStale<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions & { staleWhileRevalidate: number }
  ): Promise<T> {
    const entry = this.cache.get(key);

    if (entry) {
      const isStale =
        entry.expiresAt && Date.now() > entry.expiresAt;
      const withinSWRWindow =
        options.staleWhileRevalidate &&
        entry.expiresAt &&
        Date.now() < entry.expiresAt + options.staleWhileRevalidate;

      if (!isStale) {
        return entry.value as T;
      }

      if (withinSWRWindow) {
        // Return stale value and revalidate in background
        this.revalidate(key, factory, options);
        return entry.value as T;
      }
    }

    // No cache or expired beyond SWR window
    const value = await factory();
    this.set(key, value, options);
    return value;
  }

  private async revalidate<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<void> {
    try {
      const value = await factory();
      this.set(key, value, options);
    } catch (error) {
      console.error(`[Cache] Revalidation failed for key ${key}:`, error);
    }
  }

  /**
   * Invalidate by tags
   */
  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Invalidate by pattern (glob-like)
   */
  invalidateByPattern(pattern: string): number {
    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );

    let count = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Get multiple keys
   */
  mget<T>(keys: string[]): (T | null)[] {
    return keys.map((key) => this.get<T>(key));
  }

  /**
   * Set multiple keys
   */
  mset<T>(entries: Array<{ key: string; value: T; options?: CacheOptions }>): void {
    for (const { key, value, options } of entries) {
      this.set(key, value, options);
    }
  }

  // ============================================
  // LRU Eviction
  // ============================================

  private evictLRU(): void {
    let oldest: { key: string; lastAccessedAt: number } | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.lastAccessedAt < oldest.lastAccessedAt) {
        oldest = { key, lastAccessedAt: entry.lastAccessedAt };
      }
    }

    if (oldest) {
      this.delete(oldest.key);
    }
  }

  // ============================================
  // Cleanup
  // ============================================

  private startCleanup(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.delete(key);
        this.emit("expire", key);
      }
    }
  }

  // ============================================
  // Stats
  // ============================================

  private recordHit(): void {
    if (!this.config.enableStats) return;
    this.stats.hits++;
    this.updateHitRate();
  }

  private recordMiss(): void {
    if (!this.config.enableStats) return;
    this.stats.misses++;
    this.updateHitRate();
  }

  private updateStats(): void {
    this.stats.size = this.cache.size;
    // Estimate memory usage (rough)
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private estimateMemoryUsage(): number {
    let bytes = 0;
    for (const [key, entry] of this.cache.entries()) {
      bytes += key.length * 2; // UTF-16
      bytes += JSON.stringify(entry.value).length * 2;
      bytes += 100; // metadata overhead
    }
    return bytes;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      hitRate: 0,
    };
  }

  // ============================================
  // Events
  // ============================================

  subscribe(listener: CacheListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(
    type: "set" | "get" | "delete" | "clear" | "expire",
    key: string,
    value?: unknown
  ): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ type, key, value });
      } catch {
        // Ignore listener errors
      }
    });
  }

  // ============================================
  // Utilities
  // ============================================

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values<T>(): T[] {
    return Array.from(this.cache.values()).map((entry) => entry.value as T);
  }

  entries<T>(): Array<[string, T]> {
    return Array.from(this.cache.entries()).map(([key, entry]) => [
      key,
      entry.value as T,
    ]);
  }

  // ============================================
  // Cleanup
  // ============================================

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
    this.listeners.clear();
  }
}

// ============================================
// Singleton Instance
// ============================================

let cacheInstance: MemoryCache | null = null;

export function getCache(config?: Partial<CacheConfig>): MemoryCache {
  if (!cacheInstance) {
    cacheInstance = new MemoryCache(config);
  }
  return cacheInstance;
}

export function createCache(config?: Partial<CacheConfig>): MemoryCache {
  return new MemoryCache(config);
}

// ============================================
// ISR Utilities
// ============================================

interface ISRConfig {
  revalidate: number;
  tags?: string[];
}

/**
 * ISR 설정을 위한 캐시 태그 생성
 */
export function createCacheTag(type: string, id?: string | number): string {
  return id ? `${type}:${id}` : type;
}

/**
 * 페이지별 ISR 설정 헬퍼
 */
export function createISRConfig(options: ISRConfig) {
  return {
    revalidate: options.revalidate,
    tags: options.tags,
  };
}

/**
 * 데이터 갱신 후 재검증 트리거
 */
export async function revalidatePath(path: string): Promise<void> {
  if (typeof window !== "undefined") {
    // Client-side: call revalidation API
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
    } catch (error) {
      console.error("[Cache] Revalidation failed:", error);
    }
  }
}

/**
 * 태그 기반 재검증 트리거
 */
export async function revalidateTag(tag: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });
    } catch (error) {
      console.error("[Cache] Tag revalidation failed:", error);
    }
  }
}

// ============================================
// Request Deduplication
// ============================================

const pendingRequests: Map<string, Promise<unknown>> = new Map();

/**
 * 중복 요청 방지
 */
export async function dedupe<T>(
  key: string,
  factory: () => Promise<T>
): Promise<T> {
  const pending = pendingRequests.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = factory().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// ============================================
// Convenience Functions
// ============================================

export const cache = {
  get: <T>(key: string) => getCache().get<T>(key),
  set: <T>(key: string, value: T, options?: CacheOptions) =>
    getCache().set(key, value, options),
  has: (key: string) => getCache().has(key),
  delete: (key: string) => getCache().delete(key),
  clear: () => getCache().clear(),
  getOrSet: <T>(key: string, factory: () => T | Promise<T>, options?: CacheOptions) =>
    getCache().getOrSet(key, factory, options),
  invalidateByTag: (tag: string) => getCache().invalidateByTag(tag),
  invalidateByPattern: (pattern: string) => getCache().invalidateByPattern(pattern),
  getStats: () => getCache().getStats(),
  subscribe: (listener: CacheListener) => getCache().subscribe(listener),
};

export { MemoryCache };
