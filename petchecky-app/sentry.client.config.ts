import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 프로덕션 환경에서만 활성화
  enabled: process.env.NODE_ENV === "production",

  // 샘플링 레이트 설정
  tracesSampleRate: 0.1, // 10%의 트랜잭션만 추적
  replaysSessionSampleRate: 0.1, // 10%의 세션만 리플레이
  replaysOnErrorSampleRate: 1.0, // 에러 발생 시 100% 리플레이

  // 개인정보 마스킹
  beforeSend(event) {
    // 개인정보 필터링
    if (event.request?.headers) {
      delete event.request.headers["Authorization"];
      delete event.request.headers["Cookie"];
    }
    return event;
  },

  // 무시할 에러
  ignoreErrors: [
    // 네트워크 에러
    "Failed to fetch",
    "NetworkError",
    "ChunkLoadError",
    // 취소된 요청
    "AbortError",
    // 사용자 환경 문제
    "ResizeObserver loop limit exceeded",
  ],
});
