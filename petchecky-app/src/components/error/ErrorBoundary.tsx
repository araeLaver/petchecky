"use client";

import { Component, ReactNode, ErrorInfo } from "react";

// ============================================
// Error Types
// ============================================

export interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  errorId: string;
  url?: string;
  userAgent?: string;
}

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export interface ErrorReport extends ErrorDetails {
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  handled: boolean;
}

// ============================================
// Error Reporter
// ============================================

type ErrorReportHandler = (report: ErrorReport) => void | Promise<void>;

let errorReportHandler: ErrorReportHandler | null = null;

export function setErrorReportHandler(handler: ErrorReportHandler) {
  errorReportHandler = handler;
}

function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function reportError(
  error: Error,
  severity: ErrorSeverity = "medium",
  context?: Record<string, unknown>
): Promise<void> {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date(),
    errorId: generateErrorId(),
    url: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    severity,
    context,
    handled: true,
  };

  // 콘솔에 로깅
  console.error("[Error Report]", report);

  // 외부 핸들러 호출
  if (errorReportHandler) {
    try {
      await errorReportHandler(report);
    } catch (e) {
      console.error("Failed to report error:", e);
    }
  }
}

// ============================================
// Error Boundary Props & State
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================
// ErrorBoundary 컴포넌트
// ============================================

/**
 * React Error Boundary 컴포넌트
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<ErrorFallback />}
 *   onError={(error) => reportError(error)}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // 에러 리포트
    reportError(error, "high", {
      componentStack: errorInfo.componentStack,
    });

    // 커스텀 에러 핸들러 호출
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // 커스텀 fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(this.state.error, this.handleReset);
        }
        return this.props.fallback;
      }

      // 기본 fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================
// DefaultErrorFallback 컴포넌트
// ============================================

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo | null;
  onReset?: () => void;
  showDetails?: boolean;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  onReset,
  showDetails = false,
}: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-6">
        {/* 아이콘 */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
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
        </div>

        {/* 메시지 */}
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-600 text-center mb-6">
          예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.
        </p>

        {/* 상세 정보 (개발 모드) */}
        {showDetails && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg overflow-auto max-h-48">
            <p className="text-sm font-mono text-red-600 mb-2">{error.message}</p>
            {error.stack && (
              <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium
                hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-colors"
            >
              다시 시도
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              transition-colors"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// withErrorBoundary HOC
// ============================================

interface WithErrorBoundaryOptions {
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error Boundary HOC
 *
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent, {
 *   fallback: <ErrorFallback />,
 * });
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
}

// ============================================
// useErrorHandler 훅
// ============================================

/**
 * 명령형 에러 핸들링 훅
 *
 * @example
 * ```tsx
 * const { handleError } = useErrorHandler();
 *
 * const fetchData = async () => {
 *   try {
 *     await api.getData();
 *   } catch (error) {
 *     handleError(error);
 *   }
 * };
 * ```
 */
export function useErrorHandler() {
  const handleError = (
    error: unknown,
    severity: ErrorSeverity = "medium",
    context?: Record<string, unknown>
  ) => {
    const err = error instanceof Error ? error : new Error(String(error));
    reportError(err, severity, context);
  };

  return { handleError, reportError };
}
