/**
 * 분석 시스템 라이브러리
 * 사용자 행동 분석, 이벤트 트래킹
 */

// ============================================
// Types
// ============================================

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  page: string;
}

export interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  duration?: number;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  plan?: string;
  petCount?: number;
  locale?: string;
  timezone?: string;
  [key: string]: unknown;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint?: string;
  batchSize: number;
  flushInterval: number;
  sampleRate: number;
  excludePaths: string[];
  respectDoNotTrack: boolean;
}

// ============================================
// Default Config
// ============================================

const defaultConfig: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV === "development",
  endpoint: "/api/analytics/events",
  batchSize: 10,
  flushInterval: 30000,
  sampleRate: 1,
  excludePaths: ["/admin", "/api"],
  respectDoNotTrack: true,
};

// ============================================
// Analytics Class
// ============================================

class Analytics {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private pageViewQueue: PageView[] = [];
  private sessionId: string;
  private userId?: string;
  private userProperties: UserProperties = {};
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private pageEnterTime: number = Date.now();
  private currentPath: string = "";

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    this.init();
  }

  // ============================================
  // Initialization
  // ============================================

  private init(): void {
    if (typeof window === "undefined") return;

    // Check Do Not Track
    if (this.config.respectDoNotTrack && this.isDoNotTrackEnabled()) {
      this.config.enabled = false;
      return;
    }

    // Start flush timer
    this.startFlushTimer();

    // Track page visibility
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    // Track before unload
    window.addEventListener("beforeunload", this.handleBeforeUnload);

    // Restore session
    this.restoreSession();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private isDoNotTrackEnabled(): boolean {
    if (typeof navigator === "undefined") return false;
    return navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  }

  private restoreSession(): void {
    try {
      const stored = sessionStorage.getItem("analytics_session");
      if (stored) {
        const data = JSON.parse(stored);
        this.sessionId = data.sessionId;
        this.userId = data.userId;
        this.userProperties = data.userProperties || {};
      }
    } catch {
      // Ignore
    }
  }

  private saveSession(): void {
    try {
      sessionStorage.setItem(
        "analytics_session",
        JSON.stringify({
          sessionId: this.sessionId,
          userId: this.userId,
          userProperties: this.userProperties,
        })
      );
    } catch {
      // Ignore
    }
  }

  // ============================================
  // Timer Management
  // ============================================

  private startFlushTimer(): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // ============================================
  // Event Handlers
  // ============================================

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === "hidden") {
      this.flush();
    }
  };

  private handleBeforeUnload = (): void => {
    this.trackPageDuration();
    this.flush(true);
  };

  // ============================================
  // User Identification
  // ============================================

  identify(userId: string, properties?: UserProperties): void {
    this.userId = userId;
    if (properties) {
      this.userProperties = { ...this.userProperties, ...properties };
    }
    this.saveSession();

    this.track("user_identified", {
      category: "user",
      action: "identify",
      properties: { userId, ...properties },
    });
  }

  setUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };
    this.saveSession();
  }

  reset(): void {
    this.userId = undefined;
    this.userProperties = {};
    this.sessionId = this.generateSessionId();
    this.saveSession();
  }

  // ============================================
  // Event Tracking
  // ============================================

  track(
    name: string,
    options: {
      category?: string;
      action?: string;
      label?: string;
      value?: number;
      properties?: Record<string, unknown>;
    } = {}
  ): void {
    if (!this.config.enabled) return;
    if (!this.shouldSample()) return;

    const event: AnalyticsEvent = {
      name,
      category: options.category || "general",
      action: options.action || name,
      label: options.label,
      value: options.value,
      properties: options.properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      page: typeof window !== "undefined" ? window.location.pathname : "",
    };

    this.eventQueue.push(event);
    this.log("Track:", event);

    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  // ============================================
  // Page Tracking
  // ============================================

  page(path?: string, title?: string): void {
    if (!this.config.enabled) return;

    // Track duration of previous page
    this.trackPageDuration();

    const pagePath = path || (typeof window !== "undefined" ? window.location.pathname : "");
    const pageTitle = title || (typeof document !== "undefined" ? document.title : "");

    // Check if path is excluded
    if (this.isPathExcluded(pagePath)) return;

    this.currentPath = pagePath;
    this.pageEnterTime = Date.now();

    const pageView: PageView = {
      path: pagePath,
      title: pageTitle,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.pageViewQueue.push(pageView);
    this.log("Page view:", pageView);
  }

  private trackPageDuration(): void {
    if (this.currentPath && this.pageEnterTime) {
      const duration = Date.now() - this.pageEnterTime;
      this.track("page_duration", {
        category: "engagement",
        action: "time_on_page",
        label: this.currentPath,
        value: duration,
        properties: { path: this.currentPath, duration },
      });
    }
  }

  private isPathExcluded(path: string): boolean {
    return this.config.excludePaths.some((p) => path.startsWith(p));
  }

  // ============================================
  // Common Events
  // ============================================

  trackClick(elementId: string, properties?: Record<string, unknown>): void {
    this.track("click", {
      category: "interaction",
      action: "click",
      label: elementId,
      properties,
    });
  }

  trackSearch(query: string, resultCount?: number): void {
    this.track("search", {
      category: "search",
      action: "query",
      label: query,
      value: resultCount,
      properties: { query, resultCount },
    });
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    this.track("error", {
      category: "error",
      action: "occurred",
      label: error.message,
      properties: {
        name: error.name,
        message: error.message,
        stack: error.stack?.slice(0, 500),
        ...context,
      },
    });
  }

  trackFormSubmit(formName: string, success: boolean, properties?: Record<string, unknown>): void {
    this.track("form_submit", {
      category: "form",
      action: success ? "submit_success" : "submit_error",
      label: formName,
      properties: { formName, success, ...properties },
    });
  }

  trackConversion(type: string, value?: number, properties?: Record<string, unknown>): void {
    this.track("conversion", {
      category: "conversion",
      action: type,
      value,
      properties,
    });
  }

  trackFeatureUsage(feature: string, properties?: Record<string, unknown>): void {
    this.track("feature_used", {
      category: "feature",
      action: "use",
      label: feature,
      properties,
    });
  }

  // ============================================
  // Timing
  // ============================================

  time(name: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.track("timing", {
        category: "performance",
        action: "measure",
        label: name,
        value: Math.round(duration),
        properties: { name, duration },
      });
    };
  }

  // ============================================
  // Sampling
  // ============================================

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  // ============================================
  // Flushing
  // ============================================

  async flush(useBeacon = false): Promise<void> {
    if (this.eventQueue.length === 0 && this.pageViewQueue.length === 0) return;

    const events = [...this.eventQueue];
    const pageViews = [...this.pageViewQueue];

    this.eventQueue = [];
    this.pageViewQueue = [];

    const payload = {
      events,
      pageViews,
      userProperties: this.userProperties,
    };

    try {
      if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          this.config.endpoint || "/api/analytics/events",
          JSON.stringify(payload)
        );
      } else if (this.config.endpoint) {
        await fetch(this.config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      }
    } catch (error) {
      // Re-queue events on failure
      this.eventQueue = [...events, ...this.eventQueue];
      this.pageViewQueue = [...pageViews, ...this.pageViewQueue];
      console.error("[Analytics] Flush failed:", error);
    }
  }

  // ============================================
  // Debugging
  // ============================================

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log("[Analytics]", ...args);
    }
  }

  // ============================================
  // Cleanup
  // ============================================

  destroy(): void {
    this.stopFlushTimer();
    this.flush(true);

    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this.handleBeforeUnload);
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let analyticsInstance: Analytics | null = null;

export function getAnalytics(config?: Partial<AnalyticsConfig>): Analytics {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics(config);
  }
  return analyticsInstance;
}

export function createAnalytics(config?: Partial<AnalyticsConfig>): Analytics {
  return new Analytics(config);
}

// ============================================
// Convenience Functions
// ============================================

export const analytics = {
  track: (...args: Parameters<Analytics["track"]>) => getAnalytics().track(...args),
  page: (...args: Parameters<Analytics["page"]>) => getAnalytics().page(...args),
  identify: (...args: Parameters<Analytics["identify"]>) => getAnalytics().identify(...args),
  reset: () => getAnalytics().reset(),
  trackClick: (...args: Parameters<Analytics["trackClick"]>) => getAnalytics().trackClick(...args),
  trackSearch: (...args: Parameters<Analytics["trackSearch"]>) => getAnalytics().trackSearch(...args),
  trackError: (...args: Parameters<Analytics["trackError"]>) => getAnalytics().trackError(...args),
  trackFormSubmit: (...args: Parameters<Analytics["trackFormSubmit"]>) => getAnalytics().trackFormSubmit(...args),
  trackConversion: (...args: Parameters<Analytics["trackConversion"]>) => getAnalytics().trackConversion(...args),
  trackFeatureUsage: (...args: Parameters<Analytics["trackFeatureUsage"]>) => getAnalytics().trackFeatureUsage(...args),
  time: (...args: Parameters<Analytics["time"]>) => getAnalytics().time(...args),
  flush: (...args: Parameters<Analytics["flush"]>) => getAnalytics().flush(...args),
};

export { Analytics };
