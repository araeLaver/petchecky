export { handlers } from "./handlers";

// 개발 환경에서 MSW 초기화
export async function initMocks() {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 실행하지 않음
    return;
  }

  if (process.env.NODE_ENV !== "development") {
    // 개발 환경에서만 실행
    return;
  }

  // MSW Worker 동적 import (브라우저 환경에서만)
  const { worker } = await import("./browser");

  // Service Worker 시작
  await worker.start({
    onUnhandledRequest: "bypass", // 처리되지 않은 요청은 그대로 통과
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });

  console.log("[MSW] Mock Service Worker가 활성화되었습니다.");
}

// 테스트 환경을 위한 서버 export
export async function getTestServer() {
  const { server } = await import("./server");
  return server;
}
