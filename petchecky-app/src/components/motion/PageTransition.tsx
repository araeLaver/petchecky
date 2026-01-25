"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// 페이지 전환 Variants
// ============================================

export const pageVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  scaleUp: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
} as const;

export type PageTransitionVariant = keyof typeof pageVariants;

// ============================================
// PageTransition 컴포넌트
// ============================================

interface PageTransitionProps {
  children: ReactNode;
  variant?: PageTransitionVariant;
  duration?: number;
  delay?: number;
  className?: string;
}

/**
 * 페이지 전환 애니메이션 래퍼
 *
 * @example
 * ```tsx
 * <PageTransition variant="slideUp">
 *   <div>페이지 콘텐츠</div>
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  variant = "fade",
  duration = 0.3,
  delay = 0,
  className,
}: PageTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const variantConfig = pageVariants[variant];

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        initial: variantConfig.initial,
        animate: {
          ...variantConfig.animate,
          transition: { duration, delay, ease: [0.4, 0, 0.2, 1] },
        },
        exit: {
          ...variantConfig.exit,
          transition: { duration: duration * 0.7, ease: [0.4, 0, 1, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// RouteTransition 컴포넌트 (App Router용)
// ============================================

interface RouteTransitionProps {
  children: ReactNode;
  variant?: PageTransitionVariant;
  duration?: number;
  mode?: "wait" | "sync" | "popLayout";
  className?: string;
}

/**
 * Next.js App Router용 라우트 전환 래퍼
 * 경로 변경 시 자동으로 애니메이션 적용
 *
 * @example
 * ```tsx
 * // layout.tsx
 * <RouteTransition variant="slideUp">
 *   {children}
 * </RouteTransition>
 * ```
 */
export function RouteTransition({
  children,
  variant = "fade",
  duration = 0.3,
  mode = "wait",
  className,
}: RouteTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode={mode}>
      <PageTransition
        key={pathname}
        variant={variant}
        duration={duration}
        className={className}
      >
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}

// ============================================
// LayoutTransition 컴포넌트
// ============================================

interface LayoutTransitionProps {
  children: ReactNode;
  layoutId?: string;
  className?: string;
}

/**
 * 레이아웃 애니메이션 래퍼
 * 같은 layoutId를 가진 요소 간 부드러운 전환
 *
 * @example
 * ```tsx
 * // 리스트 아이템
 * <LayoutTransition layoutId={`item-${id}`}>
 *   <Card />
 * </LayoutTransition>
 *
 * // 상세 페이지
 * <LayoutTransition layoutId={`item-${id}`}>
 *   <DetailCard />
 * </LayoutTransition>
 * ```
 */
export function LayoutTransition({
  children,
  layoutId,
  className,
}: LayoutTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      layoutId={layoutId}
      layout
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// SharedElementTransition 컴포넌트
// ============================================

interface SharedElementProps {
  children: ReactNode;
  id: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 공유 요소 전환
 * 다른 페이지/뷰 간에 같은 id를 가진 요소가 부드럽게 전환됨
 *
 * @example
 * ```tsx
 * // 목록 페이지 이미지
 * <SharedElement id={`pet-image-${pet.id}`}>
 *   <Image src={pet.image} />
 * </SharedElement>
 *
 * // 상세 페이지 이미지 (같은 id)
 * <SharedElement id={`pet-image-${pet.id}`}>
 *   <Image src={pet.image} />
 * </SharedElement>
 * ```
 */
export function SharedElement({
  children,
  id,
  className,
  style,
}: SharedElementProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      layoutId={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
        opacity: { duration: 0.2 },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// PresenceTransition 컴포넌트
// ============================================

interface PresenceTransitionProps {
  children: ReactNode;
  show: boolean;
  variant?: PageTransitionVariant;
  duration?: number;
  className?: string;
  unmountOnExit?: boolean;
}

/**
 * 조건부 렌더링 애니메이션
 * show 상태에 따라 마운트/언마운트 애니메이션 적용
 *
 * @example
 * ```tsx
 * <PresenceTransition show={isOpen} variant="slideUp">
 *   <Dropdown />
 * </PresenceTransition>
 * ```
 */
export function PresenceTransition({
  children,
  show,
  variant = "fade",
  duration = 0.2,
  className,
  unmountOnExit = true,
}: PresenceTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return show ? <div className={className}>{children}</div> : null;
  }

  return (
    <AnimatePresence mode="wait">
      {(show || !unmountOnExit) && (
        <PageTransition
          key="presence"
          variant={variant}
          duration={duration}
          className={className}
        >
          {children}
        </PageTransition>
      )}
    </AnimatePresence>
  );
}

// ============================================
// ViewTransition 컴포넌트
// ============================================

interface ViewTransitionProps {
  children: ReactNode;
  activeView: string;
  views: {
    key: string;
    component: ReactNode;
  }[];
  variant?: PageTransitionVariant;
  duration?: number;
  className?: string;
}

/**
 * 뷰 전환 컴포넌트
 * 탭, 스텝 등 여러 뷰 간 전환에 사용
 *
 * @example
 * ```tsx
 * <ViewTransition
 *   activeView={activeTab}
 *   views={[
 *     { key: "tab1", component: <Tab1 /> },
 *     { key: "tab2", component: <Tab2 /> },
 *   ]}
 *   variant="slideLeft"
 * />
 * ```
 */
export function ViewTransition({
  activeView,
  views,
  variant = "fade",
  duration = 0.2,
  className,
}: ViewTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const activeComponent = views.find((v) => v.key === activeView)?.component;

  if (prefersReducedMotion) {
    return <div className={className}>{activeComponent}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <PageTransition
        key={activeView}
        variant={variant}
        duration={duration}
        className={className}
      >
        {activeComponent}
      </PageTransition>
    </AnimatePresence>
  );
}

// ============================================
// usePageTransition 훅
// ============================================

interface UsePageTransitionOptions {
  onEnter?: () => void;
  onEnterComplete?: () => void;
  onExit?: () => void;
  onExitComplete?: () => void;
}

/**
 * 페이지 전환 상태 감지 훅
 *
 * @example
 * ```tsx
 * const { isTransitioning, direction } = usePageTransition({
 *   onEnterComplete: () => console.log('페이지 진입 완료'),
 * });
 * ```
 */
export function usePageTransition(options: UsePageTransitionOptions = {}) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    if (previousPath && previousPath !== pathname) {
      setIsTransitioning(true);
      options.onExit?.();

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        options.onEnterComplete?.();
      }, 300);

      options.onEnter?.();
      return () => clearTimeout(timer);
    }
    setPreviousPath(pathname);
  }, [pathname, previousPath, options]);

  return {
    isTransitioning,
    currentPath: pathname,
    previousPath,
  };
}
