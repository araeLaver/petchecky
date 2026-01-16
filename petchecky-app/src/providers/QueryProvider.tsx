"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5분 동안 데이터를 신선한 상태로 유지
            staleTime: 5 * 60 * 1000,
            // 30분 후 캐시에서 제거
            gcTime: 30 * 60 * 1000,
            // 창 포커스시 자동 재fetch 비활성화 (사용자 경험 개선)
            refetchOnWindowFocus: false,
            // 재시도 횟수
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
