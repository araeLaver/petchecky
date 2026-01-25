"use client";

import { ReactNode, ComponentPropsWithoutRef } from "react";
import { usePrefersHighContrast } from "@/hooks/useAccessibility";

type FocusRingVariant = "default" | "primary" | "error" | "success" | "inset";

interface FocusRingProps extends ComponentPropsWithoutRef<"div"> {
  variant?: FocusRingVariant;
  disabled?: boolean;
  children: ReactNode;
}

const variantStyles: Record<FocusRingVariant, string> = {
  default: "focus-visible:ring-blue-500 focus-visible:ring-offset-white",
  primary: "focus-visible:ring-blue-600 focus-visible:ring-offset-white",
  error: "focus-visible:ring-red-500 focus-visible:ring-offset-white",
  success: "focus-visible:ring-green-500 focus-visible:ring-offset-white",
  inset: "focus-visible:ring-inset focus-visible:ring-blue-500",
};

/**
 * 접근성 있는 포커스 링 래퍼 컴포넌트
 *
 * Features:
 * - 일관된 포커스 스타일
 * - 고대비 모드 지원
 * - 커스터마이징 가능
 * - 다양한 변형
 *
 * @example
 * ```tsx
 * <FocusRing variant="primary">
 *   <button>Click me</button>
 * </FocusRing>
 * ```
 */
export function FocusRing({
  variant = "default",
  disabled = false,
  children,
  className = "",
  ...props
}: FocusRingProps) {
  const prefersHighContrast = usePrefersHighContrast();

  const focusClasses = disabled
    ? ""
    : `
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-2
        ${variantStyles[variant]}
        ${prefersHighContrast ? "focus-visible:ring-[3px] focus-visible:ring-current" : ""}
      `;

  return (
    <div className={`${focusClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * 포커스 가능한 카드 컴포넌트
 */
interface FocusableCardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  interactive?: boolean;
  selected?: boolean;
}

export function FocusableCard({
  children,
  interactive = true,
  selected = false,
  className = "",
  ...props
}: FocusableCardProps) {
  return (
    <div
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      aria-pressed={interactive ? selected : undefined}
      className={`
        rounded-lg border bg-white p-4 shadow-sm
        ${interactive ? "cursor-pointer hover:shadow-md" : ""}
        ${selected ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-200"}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * 고대비 모드 지원 텍스트
 */
interface HighContrastTextProps extends ComponentPropsWithoutRef<"span"> {
  children: ReactNode;
  as?: "span" | "p" | "div" | "label";
}

export function HighContrastText({
  children,
  as: Component = "span",
  className = "",
  ...props
}: HighContrastTextProps) {
  const prefersHighContrast = usePrefersHighContrast();

  return (
    <Component
      className={`
        ${prefersHighContrast ? "text-[color:var(--foreground)] underline-offset-2" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * 시각적 상태 표시기
 * 색상에만 의존하지 않고 아이콘/텍스트로도 상태 전달
 */
type StatusType = "success" | "warning" | "error" | "info" | "neutral";

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { color: string; bgColor: string; icon: string; defaultLabel: string }
> = {
  success: {
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: "✓",
    defaultLabel: "성공",
  },
  warning: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    icon: "!",
    defaultLabel: "경고",
  },
  error: {
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: "✕",
    defaultLabel: "오류",
  },
  info: {
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: "i",
    defaultLabel: "정보",
  },
  neutral: {
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: "•",
    defaultLabel: "상태",
  },
};

const sizeClasses = {
  sm: "h-4 w-4 text-xs",
  md: "h-5 w-5 text-sm",
  lg: "h-6 w-6 text-base",
};

export function StatusIndicator({
  status,
  label,
  showIcon = true,
  showLabel = true,
  size = "md",
  className = "",
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="status"
    >
      {showIcon && (
        <span
          className={`
            inline-flex items-center justify-center rounded-full font-bold
            ${config.bgColor} ${config.color} ${sizeClasses[size]}
          `}
          aria-hidden="true"
        >
          {config.icon}
        </span>
      )}
      {showLabel && (
        <span className={config.color}>{displayLabel}</span>
      )}
      <span className="sr-only">{displayLabel}</span>
    </span>
  );
}

export default FocusRing;
