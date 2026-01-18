import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 프로덕션 환경에서만 활성화
  enabled: process.env.NODE_ENV === "production",

  // 샘플링 레이트 설정
  tracesSampleRate: 0.1, // 10%의 트랜잭션만 추적

  // 개인정보 마스킹
  beforeSend(event) {
    // 개인정보 필터링
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
    }
    return event;
  },
});
