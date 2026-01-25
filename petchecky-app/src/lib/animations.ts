/**
 * Animation Utilities
 *
 * Framer Motion 재사용 가능한 애니메이션 variants 및 유틸리티
 */

import { Variants, Transition } from "framer-motion";

// ============================================
// 기본 트랜지션
// ============================================

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const smoothTransition: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

export const bounceTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 10,
};

export const gentleTransition: Transition = {
  type: "tween",
  ease: [0.4, 0, 0.2, 1],
  duration: 0.4,
};

// ============================================
// Fade 애니메이션
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: smoothTransition,
  },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, y: -10 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, y: 10 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, x: -20 },
};

// ============================================
// Scale 애니메이션
// ============================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  exit: { opacity: 0, scale: 0.9 },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: bounceTransition,
  },
  exit: { opacity: 0, scale: 0.5 },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
  exit: { opacity: 0, scale: 0 },
};

// ============================================
// Slide 애니메이션
// ============================================

export const slideInFromBottom: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: smoothTransition,
  },
  exit: { y: "100%" },
};

export const slideInFromTop: Variants = {
  hidden: { y: "-100%" },
  visible: {
    y: 0,
    transition: smoothTransition,
  },
  exit: { y: "-100%" },
};

export const slideInFromLeft: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: smoothTransition,
  },
  exit: { x: "-100%" },
};

export const slideInFromRight: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: smoothTransition,
  },
  exit: { x: "100%" },
};

// ============================================
// 컨테이너 (Stagger) 애니메이션
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// ============================================
// 리스트 아이템 애니메이션
// ============================================

export const listItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export const listItemFromLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, x: 20 },
};

// ============================================
// 버튼/인터랙션 애니메이션
// ============================================

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export const buttonTap = {
  scale: 0.98,
};

export const cardHover = {
  y: -4,
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
  transition: { duration: 0.2 },
};

export const iconSpin = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear",
  },
};

export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const shake: Variants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

// ============================================
// 모달/오버레이 애니메이션
// ============================================

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, delay: 0.1 },
  },
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const drawerFromRight: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: gentleTransition,
  },
  exit: {
    x: "100%",
    transition: { duration: 0.3 },
  },
};

export const drawerFromLeft: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: gentleTransition,
  },
  exit: {
    x: "-100%",
    transition: { duration: 0.3 },
  },
};

export const drawerFromBottom: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: gentleTransition,
  },
  exit: {
    y: "100%",
    transition: { duration: 0.3 },
  },
};

// ============================================
// 토스트/알림 애니메이션
// ============================================

export const toastSlideIn: Variants = {
  hidden: { opacity: 0, x: 100, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

export const toastSlideDown: Variants = {
  hidden: { opacity: 0, y: -50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

// ============================================
// 스켈레톤/로딩 애니메이션
// ============================================

export const skeletonPulse = {
  opacity: [0.5, 1, 0.5],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const shimmer = {
  x: ["-100%", "100%"],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "linear",
  },
};

// ============================================
// 페이지 전환 애니메이션
// ============================================

export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const pageSlide: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 지연된 애니메이션 variants 생성
 */
export function withDelay(variants: Variants, delay: number): Variants {
  return {
    ...variants,
    visible: {
      ...(typeof variants.visible === "object" ? variants.visible : {}),
      transition: {
        ...(typeof variants.visible === "object" && variants.visible.transition
          ? variants.visible.transition
          : {}),
        delay,
      },
    },
  };
}

/**
 * 커스텀 duration으로 variants 생성
 */
export function withDuration(variants: Variants, duration: number): Variants {
  return {
    ...variants,
    visible: {
      ...(typeof variants.visible === "object" ? variants.visible : {}),
      transition: {
        ...(typeof variants.visible === "object" && variants.visible.transition
          ? variants.visible.transition
          : {}),
        duration,
      },
    },
  };
}

/**
 * Stagger children variants 생성
 */
export function createStaggerVariants(
  staggerDelay = 0.1,
  childDelay = 0.1
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay,
      },
    },
  };
}

/**
 * 감소된 모션 사용자를 위한 variants
 */
export function getReducedMotionVariants(
  variants: Variants,
  prefersReducedMotion: boolean
): Variants {
  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    };
  }
  return variants;
}
