import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 프로덕션 환경에서만 활성화
  enabled: process.env.NODE_ENV === "production",

  // 샘플링 레이트 설정
  tracesSampleRate: 0.1,
});
