"use client";

import { Suspense, ReactNode } from "react";
import ErrorBoundary, { SectionErrorBoundary } from "@/components/ErrorBoundary";
import { InlineLoading } from "./PageLoading";

interface AsyncBoundaryProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  onError?: (error: Error) => void;
}

/**
 * AsyncBoundary - Error Boundary와 Suspense를 결합한 컴포넌트
 * 비동기 데이터 로딩 시 로딩/에러 상태를 쉽게 처리할 수 있습니다.
 *
 * @example
 * ```tsx
 * <AsyncBoundary loadingFallback={<Skeleton />}>
 *   <AsyncComponent />
 * </AsyncBoundary>
 * ```
 */
export function AsyncBoundary({
  children,
  loadingFallback,
  errorFallback,
  onError,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={loadingFallback || <DefaultLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * SectionAsyncBoundary - 섹션용 AsyncBoundary
 * 페이지 전체가 아닌 특정 섹션에서 사용합니다.
 */
export function SectionAsyncBoundary({
  children,
  loadingFallback,
  errorFallback,
  onError,
}: AsyncBoundaryProps) {
  return (
    <SectionErrorBoundary fallback={errorFallback} onError={onError}>
      <Suspense fallback={loadingFallback || <DefaultSectionLoading />}>
        {children}
      </Suspense>
    </SectionErrorBoundary>
  );
}

/**
 * 기본 로딩 Fallback
 */
function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <InlineLoading size="lg" />
    </div>
  );
}

/**
 * 섹션용 기본 로딩 Fallback
 */
function DefaultSectionLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <InlineLoading size="md" />
    </div>
  );
}

export default AsyncBoundary;
