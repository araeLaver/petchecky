"use client";

import { ReactNode, forwardRef } from "react";
import { motion, HTMLMotionProps, AnimatePresence } from "framer-motion";
import {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  popIn,
  slideInFromBottom,
  slideInFromRight,
  staggerContainer,
  listItem,
  buttonHover,
  buttonTap,
  cardHover,
} from "@/lib/animations";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// Fade 컴포넌트
// ============================================

interface MotionProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
}

export const FadeIn = forwardRef<HTMLDivElement, MotionProps>(
  ({ children, delay = 0, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeIn.displayName = "FadeIn";

export const FadeInUp = forwardRef<HTMLDivElement, MotionProps>(
  ({ children, delay = 0, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeInUp.displayName = "FadeInUp";

export const FadeInDown = forwardRef<HTMLDivElement, MotionProps>(
  ({ children, delay = 0, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeInDown.displayName = "FadeInDown";

export const FadeInLeft = forwardRef<HTMLDivElement, MotionProps>(
  ({ children, delay = 0, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        variants={fadeInLeft}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeInLeft.displayName = "FadeInLeft";

export const FadeInRight = forwardRef<HTMLDivElement, MotionProps>(
  ({ children, delay = 0, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        variants={fadeInRight}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeInRight.displayName = "FadeInRight";

// ============================================
// Scale 컴포넌트
// ============================================

export const ScaleIn = forwardRef<HTMLDivElement, MotionProps>(
  ({ children, delay = 0, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ScaleIn.displayName = "ScaleIn";

export const PopIn = forwardRef<HTMLDivElement, MotionProps>(
  ({ children, delay = 0, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        variants={popIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ delay }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
PopIn.displayName = "PopIn";

// ============================================
// Slide 컴포넌트
// ============================================

export const SlideInFromBottom = forwardRef<HTMLDivElement, MotionProps>(
  ({ children, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        variants={slideInFromBottom}
        initial="hidden"
        animate="visible"
        exit="exit"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SlideInFromBottom.displayName = "SlideInFromBottom";

export const SlideInFromRight = forwardRef<HTMLDivElement, MotionProps>(
  ({ children, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        variants={slideInFromRight}
        initial="hidden"
        animate="visible"
        exit="exit"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SlideInFromRight.displayName = "SlideInFromRight";

// ============================================
// Stagger 리스트 컴포넌트
// ============================================

interface StaggerListProps extends MotionProps {
  staggerDelay?: number;
}

export const StaggerList = forwardRef<HTMLDivElement, StaggerListProps>(
  ({ children, staggerDelay = 0.1, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        variants={{
          ...staggerContainer,
          visible: {
            ...staggerContainer.visible,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerList.displayName = "StaggerList";

export const StaggerItem = forwardRef<HTMLDivElement, MotionProps>(
  ({ children, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div ref={ref} variants={listItem} {...props}>
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = "StaggerItem";

// ============================================
// 인터랙티브 컴포넌트
// ============================================

interface MotionButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return (
        <button ref={ref} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
          {children}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={buttonHover}
        whileTap={buttonTap}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
MotionButton.displayName = "MotionButton";

interface MotionCardProps extends MotionProps {
  hoverEffect?: boolean;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, hoverEffect = true, ...props }, ref) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
      return <div ref={ref} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? cardHover : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionCard.displayName = "MotionCard";

// ============================================
// 유틸리티 컴포넌트
// ============================================

interface AnimatePresenceWrapperProps {
  children: ReactNode;
  mode?: "sync" | "wait" | "popLayout";
}

export function AnimatePresenceWrapper({
  children,
  mode = "wait",
}: AnimatePresenceWrapperProps) {
  return <AnimatePresence mode={mode}>{children}</AnimatePresence>;
}

// Re-export motion and AnimatePresence for convenience
export { motion, AnimatePresence };

// Re-export page transition components
export {
  PageTransition,
  RouteTransition,
  LayoutTransition,
  SharedElement,
  PresenceTransition,
  ViewTransition,
  usePageTransition,
  pageVariants,
  type PageTransitionVariant,
} from "./PageTransition";

// Re-export micro-interaction components
export {
  useRipple,
  RippleButton,
  Spinner,
  PulseDots,
  ProgressBar,
  AnimatedCounter,
  ToggleSwitch,
  AnimatedCheckbox,
  Shake,
  Bounce,
  Skeleton,
  NotificationBadge,
  HeartLike,
} from "./MicroInteractions";

// Re-export list and card animation components
export {
  AnimatedList,
  AnimatedGrid,
  ReorderList,
  AnimatedCard,
  FlipCard,
  ExpandableCard,
  SwipeableCard,
  MasonryGrid,
  InfiniteScrollList,
  listVariants,
  itemVariants,
  type ListVariant,
  type ItemVariant,
} from "./ListAnimations";
