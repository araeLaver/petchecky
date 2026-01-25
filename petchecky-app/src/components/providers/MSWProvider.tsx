"use client";

import { ReactNode, useEffect, useState } from "react";

interface MSWProviderProps {
  children: ReactNode;
}

/**
 * MSW Provider 컴포넌트
 * 개발 환경에서 API 모킹을 활성화합니다.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { MSWProvider } from "@/components/providers/MSWProvider";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <MSWProvider>{children}</MSWProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function MSWProvider({ children }: MSWProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function enableMocking() {
      // 개발 환경이 아니면 바로 ready 상태로
      if (process.env.NODE_ENV !== "development") {
        setIsReady(true);
        return;
      }

      // NEXT_PUBLIC_ENABLE_MSW 환경 변수로 MSW 활성화 여부 제어
      if (process.env.NEXT_PUBLIC_ENABLE_MSW !== "true") {
        setIsReady(true);
        return;
      }

      try {
        const { initMocks } = await import("@/mocks");
        await initMocks();
      } catch (error) {
        console.error("[MSW] 초기화 실패:", error);
      }

      setIsReady(true);
    }

    enableMocking();
  }, []);

  // MSW가 준비되기 전에는 로딩 표시 (선택적)
  // 또는 바로 children을 렌더링할 수도 있음
  if (!isReady) {
    return null; // 또는 로딩 스피너
  }

  return <>{children}</>;
}
