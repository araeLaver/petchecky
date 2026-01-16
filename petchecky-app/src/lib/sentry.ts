/**
 * Sentry 에러 모니터링 유틸리티
 *
 * 실제 Sentry 사용을 위해서는:
 * 1. npm install @sentry/nextjs
 * 2. .env.local에 NEXT_PUBLIC_SENTRY_DSN 설정
 * 3. sentry.client.config.ts, sentry.server.config.ts 파일 생성
 *
 * 현재는 Sentry 없이도 동작하도록 fallback 구현
 */

// Sentry 타입 정의 (Sentry가 설치되지 않았을 때를 위한 인터페이스)
interface SentryLike {
  captureException: (error: Error, options?: { extra?: Record<string, unknown> }) => void;
  captureMessage: (message: string, options?: { level?: string; extra?: Record<string, unknown> }) => void;
  setUser: (user: { id: string; email?: string; username?: string } | null) => void;
  setTag: (key: string, value: string) => void;
  setContext: (name: string, context: Record<string, unknown>) => void;
  addBreadcrumb: (breadcrumb: Record<string, unknown>) => void;
  startInactiveSpan: (options: { name: string; op: string }) => { end: () => void } | undefined;
}

// Sentry가 설치되어 있는지 확인
let Sentry: SentryLike | null = null;

try {
  // 동적 import를 시도하지만, 설치되지 않았다면 null 유지
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Sentry = require("@sentry/nextjs");
  }
} catch {
  // Sentry가 설치되지 않음 - fallback 사용
}

/**
 * 에러를 Sentry에 보고
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (Sentry) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    // Fallback: 콘솔에 로깅
    console.error("[Error]", error.message, context);
  }
}

/**
 * 메시지를 Sentry에 보고
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  context?: Record<string, unknown>
): void {
  if (Sentry) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } else {
    // Fallback: 콘솔에 로깅
    const logMethod = level === "error" || level === "fatal" ? "error" : level === "warning" ? "warn" : "info";
    console[logMethod](`[${level.toUpperCase()}]`, message, context);
  }
}

/**
 * 사용자 컨텍스트 설정
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (Sentry) {
    Sentry.setUser(user);
  }
}

/**
 * 태그 설정
 */
export function setTag(key: string, value: string): void {
  if (Sentry) {
    Sentry.setTag(key, value);
  }
}

/**
 * 추가 컨텍스트 설정
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  if (Sentry) {
    Sentry.setContext(name, context);
  }
}

/**
 * 브레드크럼 추가
 */
export function addBreadcrumb(breadcrumb: {
  category?: string;
  message?: string;
  level?: "fatal" | "error" | "warning" | "info" | "debug";
  data?: Record<string, unknown>;
}): void {
  if (Sentry) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

/**
 * 트랜잭션 시작 (성능 모니터링)
 */
export function startTransaction(
  name: string,
  op: string
): { finish: () => void } {
  if (Sentry) {
    const transaction = Sentry.startInactiveSpan({ name, op });
    return {
      finish: () => transaction?.end(),
    };
  }

  // Fallback
  const startTime = performance.now();
  return {
    finish: () => {
      const duration = performance.now() - startTime;
      console.debug(`[Performance] ${name} (${op}): ${duration.toFixed(2)}ms`);
    },
  };
}

/**
 * API 에러 핸들러
 */
export function handleApiError(error: unknown, endpoint: string): void {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  captureError(error instanceof Error ? error : new Error(errorMessage), {
    endpoint,
    errorType: "API_ERROR",
  });
}

/**
 * React Error Boundary에서 사용할 에러 핸들러
 */
export function handleBoundaryError(error: Error, errorInfo: { componentStack?: string }): void {
  captureError(error, {
    componentStack: errorInfo.componentStack,
    errorType: "REACT_BOUNDARY_ERROR",
  });
}

export default {
  captureError,
  captureMessage,
  setUser,
  setTag,
  setContext,
  addBreadcrumb,
  startTransaction,
  handleApiError,
  handleBoundaryError,
};
