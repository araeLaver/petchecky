import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* 테스트 실행 타임아웃 */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  /* 병렬 실행 */
  fullyParallel: true,
  /* CI에서 재시도 */
  retries: process.env.CI ? 2 : 0,
  /* 워커 수 */
  workers: process.env.CI ? 1 : undefined,
  /* 리포터 */
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  /* 전역 설정 */
  use: {
    /* Base URL */
    baseURL: "http://localhost:3000",
    /* 추적 수집 */
    trace: "on-first-retry",
    /* 스크린샷 */
    screenshot: "only-on-failure",
    /* 비디오 */
    video: "on-first-retry",
    /* 타임존 */
    timezoneId: "Asia/Seoul",
    /* 언어 */
    locale: "ko-KR",
  },
  /* 프로젝트별 설정 */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    /* 모바일 테스트 */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  /* 로컬 개발 서버 */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
