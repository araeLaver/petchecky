"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  createFocusTrap,
  getFocusableElements,
  focusFirstElement,
  announce,
  announceLoading,
  initKeyboardFocusDetection,
} from "@/lib/accessibility";

/**
 * 포커스 트랩 훅
 * 모달, 드로어 등에서 포커스가 컨테이너 내에만 유지되도록 함
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // 현재 포커스된 요소 저장
    previousActiveElement.current = document.activeElement;

    // 첫 번째 포커스 가능한 요소로 포커스 이동
    focusFirstElement(containerRef.current);

    // 포커스 트랩 설정
    const cleanup = createFocusTrap(containerRef.current);

    return () => {
      cleanup();
      // 이전 포커스 복원
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * 포커스 관리 훅
 * 특정 요소로 포커스를 이동하거나 복원
 */
export function useFocusManagement() {
  const savedFocus = useRef<Element | null>(null);

  const saveFocus = useCallback(() => {
    savedFocus.current = document.activeElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (savedFocus.current instanceof HTMLElement) {
      savedFocus.current.focus();
    }
  }, []);

  const moveFocusTo = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  }, []);

  return { saveFocus, restoreFocus, moveFocusTo };
}

/**
 * 키보드 네비게이션 훅
 * 리스트나 그리드에서 방향키로 네비게이션
 */
interface UseArrowNavigationOptions {
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
  onSelect?: (index: number) => void;
}

export function useArrowNavigation<T extends HTMLElement>(
  itemCount: number,
  options: UseArrowNavigationOptions = {}
) {
  const { orientation = "vertical", loop = true, onSelect } = options;
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<T>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isHorizontal = orientation === "horizontal" || orientation === "both";
      const isVertical = orientation === "vertical" || orientation === "both";

      let newIndex = activeIndex;

      switch (e.key) {
        case "ArrowUp":
          if (isVertical) {
            e.preventDefault();
            newIndex = loop
              ? (activeIndex - 1 + itemCount) % itemCount
              : Math.max(0, activeIndex - 1);
          }
          break;
        case "ArrowDown":
          if (isVertical) {
            e.preventDefault();
            newIndex = loop
              ? (activeIndex + 1) % itemCount
              : Math.min(itemCount - 1, activeIndex + 1);
          }
          break;
        case "ArrowLeft":
          if (isHorizontal) {
            e.preventDefault();
            newIndex = loop
              ? (activeIndex - 1 + itemCount) % itemCount
              : Math.max(0, activeIndex - 1);
          }
          break;
        case "ArrowRight":
          if (isHorizontal) {
            e.preventDefault();
            newIndex = loop
              ? (activeIndex + 1) % itemCount
              : Math.min(itemCount - 1, activeIndex + 1);
          }
          break;
        case "Home":
          e.preventDefault();
          newIndex = 0;
          break;
        case "End":
          e.preventDefault();
          newIndex = itemCount - 1;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onSelect?.(activeIndex);
          break;
      }

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        // 해당 인덱스의 요소에 포커스
        if (containerRef.current) {
          const elements = getFocusableElements(containerRef.current);
          if (elements[newIndex]) {
            elements[newIndex].focus();
          }
        }
      }
    },
    [activeIndex, itemCount, loop, orientation, onSelect]
  );

  return {
    containerRef,
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getItemProps: (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      "aria-selected": index === activeIndex,
    }),
  };
}

/**
 * 로딩 상태 공지 훅
 */
export function useLoadingAnnouncement(isLoading: boolean, context = "") {
  const prevLoadingRef = useRef(isLoading);

  useEffect(() => {
    if (prevLoadingRef.current !== isLoading) {
      announceLoading(isLoading, context);
      prevLoadingRef.current = isLoading;
    }
  }, [isLoading, context]);
}

/**
 * 스크린 리더 공지 훅
 */
export function useAnnounce() {
  return useCallback((message: string, urgent = false) => {
    announce(message, urgent);
  }, []);
}

/**
 * 키보드 포커스 감지 훅
 * 키보드 사용자에게만 포커스 링 표시
 */
export function useKeyboardFocusDetection() {
  useEffect(() => {
    const cleanup = initKeyboardFocusDetection();
    return cleanup;
  }, []);
}

/**
 * 감소된 모션 선호 감지 훅
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * 고대비 모드 감지 훅
 */
export function usePrefersHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: more)");
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersHighContrast;
}

/**
 * 스크린 리더 활성 여부 감지 훅 (휴리스틱)
 * 완벽하지 않지만 일부 스크린 리더 감지 가능
 */
export function useScreenReaderActive() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // 휴리스틱: forced-colors가 활성화되어 있으면 스크린 리더 사용 가능성 높음
    const mediaQuery = window.matchMedia("(forced-colors: active)");
    setIsActive(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsActive(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isActive;
}

/**
 * 문서 제목 동적 업데이트 훅
 */
export function useDocumentTitle(title: string, announceChange = true) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | 펫체키`;

    if (announceChange) {
      announce(`${title} 페이지`);
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, announceChange]);
}

/**
 * 에러 공지 훅
 */
export function useErrorAnnouncement(error: Error | string | null) {
  useEffect(() => {
    if (error) {
      const message = typeof error === "string" ? error : error.message;
      announce(`오류가 발생했습니다: ${message}`, true);
    }
  }, [error]);
}

/**
 * Escape 키 핸들러 훅
 */
export function useEscapeKey(onEscape: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onEscape, enabled]);
}
