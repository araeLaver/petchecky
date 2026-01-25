/**
 * Web Vitals Monitoring
 *
 * Core Web Vitals 측정 및 보고
 * - LCP (Largest Contentful Paint): 2.5초 이하 권장
 * - FID (First Input Delay): 100ms 이하 권장
 * - CLS (Cumulative Layout Shift): 0.1 이하 권장
 * - INP (Interaction to Next Paint): 200ms 이하 권장
 * - TTFB (Time to First Byte): 800ms 이하 권장
 */

import * as Sentry from "@sentry/nextjs";
import type { Metric } from "web-vitals";

// Web Vitals 타입 (web-vitals 패키지에서 제공하는 타입 사용)
export type WebVitalMetric = Metric;

// 임계값 정의
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

/**
 * 메트릭 등급 계산
 */
function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return "good";
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Web Vitals 보고
 */
export function reportWebVitals(metric: WebVitalMetric): void {
  // 개발 환경에서 콘솔 로깅
  if (process.env.NODE_ENV === "development") {
    const rating = getRating(metric.name, metric.value);
    const color =
      rating === "good" ? "\x1b[32m" : rating === "needs-improvement" ? "\x1b[33m" : "\x1b[31m";
    console.log(
      `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${rating})`,
      `color: ${color === "\x1b[32m" ? "green" : color === "\x1b[33m" ? "orange" : "red"}`
    );
  }

  // 프로덕션 환경에서 Sentry로 전송
  if (process.env.NODE_ENV === "production") {
    Sentry.addBreadcrumb({
      category: "web-vitals",
      message: `${metric.name}: ${metric.value}`,
      level: metric.rating === "poor" ? "warning" : "info",
      data: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        navigationType: metric.navigationType,
      },
    });

    // 성능이 좋지 않은 경우 Sentry에 이벤트 전송
    if (metric.rating === "poor") {
      Sentry.captureMessage(`Poor Web Vital: ${metric.name}`, {
        level: "warning",
        tags: {
          vital_name: metric.name,
          vital_rating: metric.rating,
        },
        extra: {
          value: metric.value,
          threshold: THRESHOLDS[metric.name],
          delta: metric.delta,
          navigationType: metric.navigationType,
        },
      });
    }
  }

  // Google Analytics로 전송 (선택사항)
  if (typeof window !== "undefined" && "gtag" in window) {
    const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
    gtag("event", metric.name, {
      event_category: "Web Vitals",
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

/**
 * Web Vitals 초기화 (클라이언트에서 호출)
 */
export async function initWebVitals(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // web-vitals v4: FID는 INP로 대체됨
    const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import("web-vitals");

    onCLS(reportWebVitals);
    onFCP(reportWebVitals);
    onINP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  } catch (error) {
    console.error("Failed to initialize web vitals:", error);
  }
}

/**
 * 성능 최적화 팁 생성
 */
export function getOptimizationTips(metrics: Record<string, number>): string[] {
  const tips: string[] = [];

  if (metrics.LCP && metrics.LCP > THRESHOLDS.LCP.good) {
    tips.push("LCP 개선: 큰 이미지 최적화, 서버 응답 시간 단축, CSS/JS 최적화");
  }

  if (metrics.CLS && metrics.CLS > THRESHOLDS.CLS.good) {
    tips.push("CLS 개선: 이미지/비디오에 크기 지정, 동적 콘텐츠에 공간 예약");
  }

  if (metrics.INP && metrics.INP > THRESHOLDS.INP.good) {
    tips.push("INP 개선: 이벤트 핸들러 최적화, 렌더링 작업 최소화, JavaScript 실행 시간 단축");
  }

  if (metrics.TTFB && metrics.TTFB > THRESHOLDS.TTFB.good) {
    tips.push("TTFB 개선: 서버 응답 시간 최적화, CDN 사용, 캐싱 설정");
  }

  return tips;
}

// Export thresholds for external use
export { THRESHOLDS as WEB_VITALS_THRESHOLDS };
