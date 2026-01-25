"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  analytics,
  getAnalytics,
  AnalyticsEvent,
  UserProperties,
} from "@/lib/analytics";

// ============================================
// usePageTracking Hook
// ============================================

/**
 * 페이지 조회 자동 추적 훅
 */
export function usePageTracking(): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    analytics.page(url);
  }, [pathname, searchParams]);
}

// ============================================
// useAnalytics Hook
// ============================================

interface UseAnalyticsReturn {
  track: (name: string, properties?: Record<string, unknown>) => void;
  trackClick: (elementId: string, properties?: Record<string, unknown>) => void;
  trackSearch: (query: string, resultCount?: number) => void;
  trackError: (error: Error, context?: Record<string, unknown>) => void;
  trackFormSubmit: (formName: string, success: boolean, properties?: Record<string, unknown>) => void;
  trackConversion: (type: string, value?: number, properties?: Record<string, unknown>) => void;
  trackFeatureUsage: (feature: string, properties?: Record<string, unknown>) => void;
  time: (name: string) => () => void;
  identify: (userId: string, properties?: UserProperties) => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const track = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      analytics.track(name, { properties });
    },
    []
  );

  const trackClick = useCallback(
    (elementId: string, properties?: Record<string, unknown>) => {
      analytics.trackClick(elementId, properties);
    },
    []
  );

  const trackSearch = useCallback((query: string, resultCount?: number) => {
    analytics.trackSearch(query, resultCount);
  }, []);

  const trackError = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      analytics.trackError(error, context);
    },
    []
  );

  const trackFormSubmit = useCallback(
    (formName: string, success: boolean, properties?: Record<string, unknown>) => {
      analytics.trackFormSubmit(formName, success, properties);
    },
    []
  );

  const trackConversion = useCallback(
    (type: string, value?: number, properties?: Record<string, unknown>) => {
      analytics.trackConversion(type, value, properties);
    },
    []
  );

  const trackFeatureUsage = useCallback(
    (feature: string, properties?: Record<string, unknown>) => {
      analytics.trackFeatureUsage(feature, properties);
    },
    []
  );

  const time = useCallback((name: string) => {
    return analytics.time(name);
  }, []);

  const identify = useCallback((userId: string, properties?: UserProperties) => {
    analytics.identify(userId, properties);
  }, []);

  return {
    track,
    trackClick,
    trackSearch,
    trackError,
    trackFormSubmit,
    trackConversion,
    trackFeatureUsage,
    time,
    identify,
  };
}

// ============================================
// useTrackEvent Hook
// ============================================

/**
 * 특정 이벤트 추적 훅
 */
export function useTrackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): () => void {
  return useCallback(() => {
    analytics.track(eventName, { properties });
  }, [eventName, properties]);
}

// ============================================
// useTrackOnMount Hook
// ============================================

/**
 * 컴포넌트 마운트 시 이벤트 추적
 */
export function useTrackOnMount(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      analytics.track(eventName, { properties });
      tracked.current = true;
    }
  }, [eventName]);
}

// ============================================
// useTrackTiming Hook
// ============================================

interface UseTrackTimingReturn {
  startTiming: () => void;
  endTiming: () => void;
  isTracking: boolean;
}

/**
 * 타이밍 측정 훅
 */
export function useTrackTiming(name: string): UseTrackTimingReturn {
  const endTimingRef = useRef<(() => void) | null>(null);
  const isTrackingRef = useRef(false);

  const startTiming = useCallback(() => {
    if (!isTrackingRef.current) {
      endTimingRef.current = analytics.time(name);
      isTrackingRef.current = true;
    }
  }, [name]);

  const endTiming = useCallback(() => {
    if (endTimingRef.current) {
      endTimingRef.current();
      endTimingRef.current = null;
      isTrackingRef.current = false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (endTimingRef.current) {
        endTimingRef.current();
      }
    };
  }, []);

  return {
    startTiming,
    endTiming,
    isTracking: isTrackingRef.current,
  };
}

// ============================================
// useUserIdentity Hook
// ============================================

/**
 * 사용자 식별 훅
 */
export function useUserIdentity(
  userId: string | undefined,
  properties?: UserProperties
): void {
  useEffect(() => {
    if (userId) {
      analytics.identify(userId, properties);
    }
  }, [userId, properties]);
}

// ============================================
// useClickTracking Hook
// ============================================

interface UseClickTrackingOptions {
  trackingId: string;
  properties?: Record<string, unknown>;
}

/**
 * 클릭 추적 훅
 * ref를 반환하여 요소에 연결
 */
export function useClickTracking<T extends HTMLElement>({
  trackingId,
  properties,
}: UseClickTrackingOptions) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleClick = () => {
      analytics.trackClick(trackingId, properties);
    };

    element.addEventListener("click", handleClick);
    return () => element.removeEventListener("click", handleClick);
  }, [trackingId, properties]);

  return ref;
}

// ============================================
// useScrollDepth Hook
// ============================================

interface ScrollDepthMilestone {
  depth: number;
  reached: boolean;
}

/**
 * 스크롤 깊이 추적 훅
 */
export function useScrollDepth(milestones: number[] = [25, 50, 75, 100]): void {
  const milestonesRef = useRef<ScrollDepthMilestone[]>(
    milestones.map((depth) => ({ depth, reached: false }))
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = (window.scrollY / scrollHeight) * 100;

      milestonesRef.current.forEach((milestone) => {
        if (!milestone.reached && scrollDepth >= milestone.depth) {
          milestone.reached = true;
          analytics.track("scroll_depth", {
            category: "engagement",
            action: "scroll",
            label: `${milestone.depth}%`,
            value: milestone.depth,
            properties: { depth: milestone.depth },
          });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}

// ============================================
// useExitIntent Hook
// ============================================

/**
 * 이탈 의도 추적 훅
 */
export function useExitIntent(callback?: () => void): void {
  const triggered = useRef(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !triggered.current) {
        triggered.current = true;
        analytics.track("exit_intent", {
          category: "engagement",
          action: "exit_intent",
        });
        callback?.();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [callback]);
}

// ============================================
// useSessionDuration Hook
// ============================================

/**
 * 세션 지속 시간 추적 훅
 */
export function useSessionDuration(): void {
  const startTime = useRef(Date.now());

  useEffect(() => {
    const handleBeforeUnload = () => {
      const duration = Date.now() - startTime.current;
      analytics.track("session_duration", {
        category: "engagement",
        action: "session_end",
        value: duration,
        properties: { duration, durationMinutes: Math.round(duration / 60000) },
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
