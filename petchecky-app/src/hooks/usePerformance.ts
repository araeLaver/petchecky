"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  initWebVitals,
  setMetricsHandler,
  getCollectedMetrics,
  clearCollectedMetrics,
  recordMetric,
  measureTiming,
  observeLongTasks,
  getMemoryUsage,
  getConnectionInfo,
  generatePerformanceReport,
  sendPerformanceReport,
  type WebVitalMetric,
  type CustomMetric,
  type WebVitalName,
} from "@/lib/performance";

// ============================================
// useWebVitals Hook
// ============================================

interface WebVitalsState {
  CLS?: WebVitalMetric;
  FCP?: WebVitalMetric;
  FID?: WebVitalMetric;
  INP?: WebVitalMetric;
  LCP?: WebVitalMetric;
  TTFB?: WebVitalMetric;
}

/**
 * Web Vitals 모니터링 훅
 *
 * @example
 * ```tsx
 * const { vitals, isCollecting } = useWebVitals();
 *
 * return (
 *   <div>
 *     <p>LCP: {vitals.LCP?.value}ms ({vitals.LCP?.rating})</p>
 *     <p>CLS: {vitals.CLS?.value}</p>
 *   </div>
 * );
 * ```
 */
export function useWebVitals(): {
  vitals: WebVitalsState;
  isCollecting: boolean;
} {
  const [vitals, setVitals] = useState<WebVitalsState>({});
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    setIsCollecting(true);

    // 메트릭 핸들러 설정
    setMetricsHandler((metric) => {
      if ("rating" in metric) {
        setVitals((prev) => ({
          ...prev,
          [metric.name]: metric,
        }));
      }
    });

    // Web Vitals 초기화
    initWebVitals();

    // 이전에 수집된 메트릭 로드
    const collected = getCollectedMetrics();
    const initialVitals: WebVitalsState = {};
    for (const metric of collected) {
      if ("rating" in metric) {
        initialVitals[metric.name as WebVitalName] = metric as WebVitalMetric;
      }
    }
    setVitals(initialVitals);

    return () => {
      setIsCollecting(false);
    };
  }, []);

  return { vitals, isCollecting };
}

// ============================================
// usePerformanceMonitor Hook
// ============================================

interface PerformanceMonitorOptions {
  enableLongTaskObserver?: boolean;
  reportEndpoint?: string;
  reportOnUnload?: boolean;
}

/**
 * 종합 성능 모니터링 훅
 */
export function usePerformanceMonitor(options: PerformanceMonitorOptions = {}) {
  const {
    enableLongTaskObserver = true,
    reportEndpoint,
    reportOnUnload = true,
  } = options;

  const { vitals, isCollecting } = useWebVitals();
  const [longTaskCount, setLongTaskCount] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState<ReturnType<typeof getMemoryUsage>>(null);
  const [connectionInfo, setConnectionInfo] = useState<ReturnType<typeof getConnectionInfo>>(null);

  // Long Task 모니터링
  useEffect(() => {
    if (!enableLongTaskObserver) return;

    const cleanup = observeLongTasks();

    // Long Task 카운트 주기적 업데이트
    const interval = setInterval(() => {
      const tasks = getCollectedMetrics().filter(
        (m) => "name" in m && m.name === "longtask"
      );
      setLongTaskCount(tasks.length);
    }, 5000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [enableLongTaskObserver]);

  // 메모리 사용량 모니터링
  useEffect(() => {
    const updateMemory = () => {
      setMemoryUsage(getMemoryUsage());
    };

    updateMemory();
    const interval = setInterval(updateMemory, 10000);

    return () => clearInterval(interval);
  }, []);

  // 연결 정보 가져오기
  useEffect(() => {
    setConnectionInfo(getConnectionInfo());
  }, []);

  // 페이지 언로드 시 리포트 전송
  useEffect(() => {
    if (!reportOnUnload || !reportEndpoint) return;

    const handleUnload = () => {
      sendPerformanceReport(reportEndpoint);
    };

    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        handleUnload();
      }
    });

    return () => {
      window.removeEventListener("visibilitychange", handleUnload);
    };
  }, [reportOnUnload, reportEndpoint]);

  // 수동 리포트 전송
  const sendReport = useCallback(async () => {
    if (reportEndpoint) {
      await sendPerformanceReport(reportEndpoint);
    }
    return generatePerformanceReport();
  }, [reportEndpoint]);

  return {
    vitals,
    isCollecting,
    longTaskCount,
    memoryUsage,
    connectionInfo,
    sendReport,
    recordMetric,
    measureTiming,
  };
}

// ============================================
// useRenderCount Hook
// ============================================

/**
 * 컴포넌트 렌더링 횟수 추적 훅 (디버깅용)
 */
export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;

    if (process.env.NODE_ENV === "development") {
      console.log(`[Render] ${componentName}: ${renderCount.current}`);
    }
  });

  return renderCount.current;
}

// ============================================
// useComponentTiming Hook
// ============================================

/**
 * 컴포넌트 마운트/업데이트 타이밍 측정 훅
 */
export function useComponentTiming(componentName: string): void {
  const mountTime = useRef(performance.now());
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      const mountDuration = performance.now() - mountTime.current;
      recordMetric(`${componentName}_mount`, mountDuration, { unit: "ms" });
      isMounted.current = true;
    } else {
      recordMetric(`${componentName}_update`, performance.now() - mountTime.current, {
        unit: "ms",
      });
    }

    mountTime.current = performance.now();
  });
}

// ============================================
// useAsyncTiming Hook
// ============================================

/**
 * 비동기 작업 타이밍 측정 훅
 *
 * @example
 * ```tsx
 * const { execute, isLoading, duration } = useAsyncTiming('fetchPets');
 *
 * const fetchData = () => execute(async () => {
 *   return await api.getPets();
 * });
 * ```
 */
export function useAsyncTiming(operationName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      const startTime = performance.now();

      try {
        const result = await fn();
        const elapsed = performance.now() - startTime;
        setDuration(elapsed);
        recordMetric(operationName, elapsed, { unit: "ms" });
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        const elapsed = performance.now() - startTime;
        recordMetric(`${operationName}_error`, elapsed, { unit: "ms" });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [operationName]
  );

  return { execute, isLoading, duration, error };
}

// ============================================
// useFrameRate Hook
// ============================================

/**
 * 프레임 레이트 모니터링 훅
 */
export function useFrameRate(): { fps: number; isMonitoring: boolean } {
  const [fps, setFps] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsMonitoring(true);
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const measureFps = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      rafId = requestAnimationFrame(measureFps);
    };

    rafId = requestAnimationFrame(measureFps);

    return () => {
      cancelAnimationFrame(rafId);
      setIsMonitoring(false);
    };
  }, []);

  return { fps, isMonitoring };
}
