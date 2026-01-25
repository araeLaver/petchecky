"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// Error Page 컴포넌트
// ============================================

interface ErrorPageProps {
  title?: string;
  message?: string;
  statusCode?: number;
  actions?: ReactNode;
  illustration?: ReactNode;
}

/**
 * 전체 페이지 에러 UI
 *
 * @example
 * ```tsx
 * <ErrorPage
 *   statusCode={404}
 *   title="페이지를 찾을 수 없습니다"
 *   message="요청하신 페이지가 존재하지 않습니다."
 * />
 * ```
 */
export function ErrorPage({
  title = "문제가 발생했습니다",
  message = "예기치 않은 오류가 발생했습니다.",
  statusCode,
  actions,
  illustration,
}: ErrorPageProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const content = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        {/* 상태 코드 또는 일러스트 */}
        {illustration || (
          <div className="mb-8">
            {statusCode ? (
              <span className="text-9xl font-bold text-gray-200">{statusCode}</span>
            ) : (
              <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* 제목 및 메시지 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{message}</p>

        {/* 액션 버튼 */}
        {actions || (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium
                hover:bg-gray-50 transition-colors"
            >
              이전 페이지로
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                hover:bg-blue-700 transition-colors"
            >
              홈으로 이동
            </a>
          </div>
        )}
      </div>
    </div>
  );

  if (prefersReducedMotion) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {content}
    </motion.div>
  );
}

// ============================================
// ErrorCard 컴포넌트
// ============================================

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * 인라인 에러 카드
 *
 * @example
 * ```tsx
 * <ErrorCard
 *   title="데이터 로드 실패"
 *   message="서버에 연결할 수 없습니다."
 *   onRetry={refetch}
 * />
 * ```
 */
export function ErrorCard({
  title = "오류 발생",
  message,
  onRetry,
  onDismiss,
  className,
}: ErrorCardProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className || ""}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          {message && <p className="mt-1 text-sm text-red-700">{message}</p>}

          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  다시 시도
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  닫기
                </button>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 text-red-400 hover:text-red-500 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// NetworkError 컴포넌트
// ============================================

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

/**
 * 네트워크 에러 UI
 */
export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className || ""}`}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">네트워크 연결 오류</h3>
      <p className="text-gray-500 mb-4">인터넷 연결을 확인해 주세요.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

// ============================================
// EmptyState 컴포넌트
// ============================================

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * 빈 상태 UI
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title="반려동물이 없습니다"
 *   message="반려동물을 등록해 주세요."
 *   action={<Button>등록하기</Button>}
 * />
 * ```
 */
export function EmptyState({
  title = "데이터 없음",
  message,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className || ""}`}
    >
      {icon || (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-gray-500 mb-4">{message}</p>}
      {action}
    </div>
  );
}

// ============================================
// NotFound 컴포넌트
// ============================================

interface NotFoundProps {
  resourceName?: string;
  backPath?: string;
  className?: string;
}

/**
 * 404 Not Found UI
 */
export function NotFound({
  resourceName = "페이지",
  backPath = "/",
  className,
}: NotFoundProps) {
  return (
    <ErrorPage
      statusCode={404}
      title={`${resourceName}를 찾을 수 없습니다`}
      message={`요청하신 ${resourceName}가 존재하지 않거나 삭제되었습니다.`}
      actions={
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium
              hover:bg-gray-50 transition-colors"
          >
            이전으로
          </button>
          <a
            href={backPath}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
              hover:bg-blue-700 transition-colors"
          >
            홈으로
          </a>
        </div>
      }
    />
  );
}

// ============================================
// ServerError 컴포넌트
// ============================================

interface ServerErrorProps {
  errorId?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * 500 Server Error UI
 */
export function ServerError({ errorId, onRetry, className }: ServerErrorProps) {
  return (
    <ErrorPage
      statusCode={500}
      title="서버 오류"
      message={
        errorId
          ? `서버에서 오류가 발생했습니다. (오류 ID: ${errorId})`
          : "서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      }
      actions={
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          )}
          <a
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium
              hover:bg-gray-50 transition-colors"
          >
            홈으로
          </a>
        </div>
      }
    />
  );
}

// ============================================
// Maintenance 컴포넌트
// ============================================

interface MaintenanceProps {
  estimatedTime?: string;
  className?: string;
}

/**
 * 점검 중 UI
 */
export function Maintenance({ estimatedTime, className }: MaintenanceProps) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 px-4 ${className || ""}`}
    >
      <div className="max-w-lg w-full text-center">
        <div className="w-24 h-24 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-8">
          <svg
            className="w-12 h-12 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">서비스 점검 중</h1>
        <p className="text-gray-600 mb-2">
          더 나은 서비스를 위해 시스템 점검을 진행하고 있습니다.
        </p>
        {estimatedTime && (
          <p className="text-gray-500 mb-8">예상 완료 시간: {estimatedTime}</p>
        )}

        <p className="text-sm text-gray-400">불편을 드려 죄송합니다.</p>
      </div>
    </div>
  );
}

// ============================================
// InlineError 컴포넌트
// ============================================

interface InlineErrorProps {
  message: string;
  className?: string;
}

/**
 * 인라인 에러 메시지
 */
export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm text-red-600 ${className || ""}`}
      role="alert"
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}
