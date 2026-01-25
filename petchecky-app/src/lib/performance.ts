/**
 * 성능 모니터링 유틸리티
 */

// ============================================
// Types
// ============================================

export type WebVitalName = "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";

export interface WebVitalMetric {
  id: string;
  name: WebVitalName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
}

export interface CustomMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceReport {
  url: string;
  timestamp: number;
  webVitals: Partial<Record<WebVitalName, WebVitalMetric>>;
  customMetrics: CustomMetric[];
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
}

// ============================================
// Web Vitals 임계값
// ============================================

const VITALS_THRESHOLDS: Record<WebVitalName, { good: number; poor: number }> = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

// ============================================
// Rating 계산
// ============================================

export function getRating(
  name: WebVitalName,
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds = VITALS_THRESHOLDS[name];
  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needs-improvement";
  return "poor";
}

// ============================================
// Performance Observer
// ============================================

type MetricHandler = (metric: WebVitalMetric | CustomMetric) => void;

let metricsHandler: MetricHandler | null = null;
const collectedMetrics: (WebVitalMetric | CustomMetric)[] = [];

/**
 * 성능 메트릭 핸들러 설정
 */
export function setMetricsHandler(handler: MetricHandler): void {
  metricsHandler = handler;
}

/**
 * 수집된 메트릭 반환
 */
export function getCollectedMetrics(): (WebVitalMetric | CustomMetric)[] {
  return [...collectedMetrics];
}

/**
 * 메트릭 수집 초기화
 */
export function clearCollectedMetrics(): void {
  collectedMetrics.length = 0;
}

// ============================================
// Web Vitals 수집
// ============================================

/**
 * Web Vitals 수집 시작
 */
export async function initWebVitals(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // web-vitals 라이브러리 동적 로드
    const webVitals = await import("web-vitals");

    const handleMetric = (metric: {
      name: string;
      value: number;
      delta: number;
      id: string;
      navigationType: string;
    }) => {
      const vitalMetric: WebVitalMetric = {
        id: metric.id,
        name: metric.name as WebVitalName,
        value: metric.value,
        rating: getRating(metric.name as WebVitalName, metric.value),
        delta: metric.delta,
        navigationType: metric.navigationType,
      };

      collectedMetrics.push(vitalMetric);
      metricsHandler?.(vitalMetric);

      // 콘솔 로깅 (개발 모드)
      if (process.env.NODE_ENV === "development") {
        console.log(`[Performance] ${metric.name}:`, {
          value: metric.value.toFixed(2),
          rating: vitalMetric.rating,
        });
      }
    };

    // 모든 Web Vitals 수집
    webVitals.onCLS(handleMetric);
    webVitals.onFCP(handleMetric);
    webVitals.onLCP(handleMetric);
    webVitals.onTTFB(handleMetric);
    webVitals.onINP(handleMetric);
  } catch (error) {
    console.error("[Performance] Web Vitals 초기화 실패:", error);
  }
}

// ============================================
// Custom Metrics
// ============================================

/**
 * 커스텀 메트릭 기록
 */
export function recordMetric(
  name: string,
  value: number,
  options?: {
    unit?: string;
    tags?: Record<string, string>;
  }
): void {
  const metric: CustomMetric = {
    name,
    value,
    unit: options?.unit,
    timestamp: Date.now(),
    tags: options?.tags,
  };

  collectedMetrics.push(metric);
  metricsHandler?.(metric);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] Custom Metric - ${name}:`, value, options?.unit || "");
  }
}

/**
 * 타이밍 측정
 */
export function measureTiming(name: string): () => void {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    recordMetric(name, duration, { unit: "ms" });
  };
}

/**
 * 비동기 함수 타이밍 측정
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const endTiming = measureTiming(name);
  try {
    const result = await fn();
    endTiming();
    return result;
  } catch (error) {
    endTiming();
    throw error;
  }
}

// ============================================
// Performance Marks
// ============================================

/**
 * 성능 마크 설정
 */
export function setMark(name: string): void {
  if (typeof performance !== "undefined") {
    performance.mark(name);
  }
}

/**
 * 성능 마크 간 측정
 */
export function measureBetweenMarks(
  measureName: string,
  startMark: string,
  endMark: string
): number | null {
  if (typeof performance === "undefined") return null;

  try {
    performance.measure(measureName, startMark, endMark);
    const entries = performance.getEntriesByName(measureName, "measure");
    const lastEntry = entries[entries.length - 1];
    return lastEntry?.duration ?? null;
  } catch {
    return null;
  }
}

// ============================================
// Resource Timing
// ============================================

export interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  transferSize: number;
  decodedBodySize: number;
}

/**
 * 리소스 타이밍 정보 수집
 */
export function getResourceTimings(): ResourceTiming[] {
  if (typeof performance === "undefined") return [];

  const entries = performance.getEntriesByType(
    "resource"
  ) as PerformanceResourceTiming[];

  return entries.map((entry) => ({
    name: entry.name,
    type: entry.initiatorType,
    duration: entry.duration,
    transferSize: entry.transferSize,
    decodedBodySize: entry.decodedBodySize,
  }));
}

/**
 * 느린 리소스 찾기
 */
export function getSlowResources(thresholdMs: number = 1000): ResourceTiming[] {
  return getResourceTimings().filter((r) => r.duration > thresholdMs);
}

// ============================================
// Long Tasks
// ============================================

const longTasks: { duration: number; startTime: number }[] = [];

/**
 * Long Task 모니터링 시작
 */
export function observeLongTasks(): () => void {
  if (typeof PerformanceObserver === "undefined") {
    return () => {};
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        longTasks.push({
          duration: entry.duration,
          startTime: entry.startTime,
        });

        if (process.env.NODE_ENV === "development") {
          console.warn(`[Performance] Long Task detected: ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ["longtask"] });

    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/**
 * 수집된 Long Tasks 반환
 */
export function getLongTasks(): typeof longTasks {
  return [...longTasks];
}

// ============================================
// Memory Usage
// ============================================

interface MemoryInfo {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

/**
 * 메모리 사용량 가져오기 (Chrome only)
 */
export function getMemoryUsage(): MemoryInfo | null {
  if (typeof performance === "undefined") return null;

  const memory = (performance as Performance & { memory?: MemoryInfo }).memory;
  if (!memory) return null;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
}

// ============================================
// Connection Info
// ============================================

interface ConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * 네트워크 연결 정보
 */
export function getConnectionInfo(): ConnectionInfo | null {
  if (typeof navigator === "undefined") return null;

  const connection = (
    navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
    }
  ).connection;

  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

// ============================================
// Performance Report
// ============================================

/**
 * 전체 성능 리포트 생성
 */
export function generatePerformanceReport(): PerformanceReport {
  const webVitals: Partial<Record<WebVitalName, WebVitalMetric>> = {};

  for (const metric of collectedMetrics) {
    if ("rating" in metric) {
      webVitals[metric.name as WebVitalName] = metric as WebVitalMetric;
    }
  }

  const customMetrics = collectedMetrics.filter(
    (m): m is CustomMetric => !("rating" in m)
  );

  const connectionInfo = getConnectionInfo();

  return {
    url: typeof window !== "undefined" ? window.location.href : "",
    timestamp: Date.now(),
    webVitals,
    customMetrics,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    connectionType: connectionInfo?.effectiveType,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
  };
}

/**
 * 성능 리포트 전송
 */
export async function sendPerformanceReport(
  endpoint: string = "/api/analytics/performance"
): Promise<void> {
  const report = generatePerformanceReport();

  try {
    // Beacon API 사용 (페이지 언로드 시에도 전송 보장)
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(report));
    } else {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
        keepalive: true,
      });
    }
  } catch (error) {
    console.error("[Performance] 리포트 전송 실패:", error);
  }
}
