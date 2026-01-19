"use client";

import { ReactNode, ElementType } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: ElementType;
}

/**
 * VisuallyHidden - 시각적으로 숨기지만 스크린 리더에는 읽히는 컴포넌트
 *
 * 스크린 리더 사용자에게만 정보를 제공할 때 사용합니다.
 *
 * @example
 * ```tsx
 * <button>
 *   <Icon />
 *   <VisuallyHidden>메뉴 열기</VisuallyHidden>
 * </button>
 * ```
 */
export function VisuallyHidden({
  children,
  as: Component = "span",
}: VisuallyHiddenProps) {
  return (
    <Component
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      }}
    >
      {children}
    </Component>
  );
}

/**
 * 스크린 리더용 라이브 영역
 * 동적으로 변하는 콘텐츠를 스크린 리더에 알림
 */
interface LiveRegionProps {
  children: ReactNode;
  mode?: "polite" | "assertive" | "off";
  atomic?: boolean;
}

export function LiveRegion({
  children,
  mode = "polite",
  atomic = true,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={mode}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

/**
 * 스크린 리더 전용 텍스트 (Tailwind CSS 클래스 사용)
 */
export function SrOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

export default VisuallyHidden;
