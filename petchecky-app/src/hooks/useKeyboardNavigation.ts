import { useEffect, useCallback, RefObject } from "react";

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyBindings {
  [key: string]: KeyHandler;
}

/**
 * 키보드 단축키 훅
 *
 * @example
 * ```tsx
 * useKeyboardNavigation({
 *   "Escape": () => closeModal(),
 *   "Enter": () => submitForm(),
 *   "ArrowUp": () => selectPrevious(),
 *   "ArrowDown": () => selectNext(),
 * });
 * ```
 */
export function useKeyboardNavigation(
  bindings: KeyBindings,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = bindings[event.key];
      if (handler) {
        handler(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bindings, enabled]);
}

/**
 * 화살표 키로 리스트 탐색
 */
export function useArrowNavigation<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  options: {
    selector?: string;
    loop?: boolean;
    horizontal?: boolean;
    onSelect?: (index: number, element: HTMLElement) => void;
    enabled?: boolean;
  } = {}
) {
  const {
    selector = "[data-navigable]",
    loop = true,
    horizontal = false,
    onSelect,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!containerRef.current) return;

      const items = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(selector)
      );

      if (items.length === 0) return;

      const currentIndex = items.findIndex(
        (item) => item === document.activeElement
      );

      const prevKey = horizontal ? "ArrowLeft" : "ArrowUp";
      const nextKey = horizontal ? "ArrowRight" : "ArrowDown";

      let newIndex = currentIndex;

      if (event.key === prevKey) {
        event.preventDefault();
        if (currentIndex === -1) {
          newIndex = items.length - 1;
        } else if (currentIndex === 0) {
          newIndex = loop ? items.length - 1 : 0;
        } else {
          newIndex = currentIndex - 1;
        }
      } else if (event.key === nextKey) {
        event.preventDefault();
        if (currentIndex === -1) {
          newIndex = 0;
        } else if (currentIndex === items.length - 1) {
          newIndex = loop ? 0 : items.length - 1;
        } else {
          newIndex = currentIndex + 1;
        }
      } else if (event.key === "Home") {
        event.preventDefault();
        newIndex = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        newIndex = items.length - 1;
      } else {
        return;
      }

      const targetItem = items[newIndex];
      if (targetItem) {
        targetItem.focus();
        onSelect?.(newIndex, targetItem);
      }
    },
    [containerRef, selector, loop, horizontal, onSelect]
  );

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    container.addEventListener("keydown", handleKeyDown);

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown, containerRef]);
}

/**
 * 포커스 트래핑 훅
 * 포커스가 특정 컨테이너 내부에만 머물도록 함
 */
export function useFocusTrap<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements =
        container.querySelectorAll<HTMLElement>(focusableSelector);

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, enabled]);
}

/**
 * Escape 키로 닫기 훅
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onEscape, enabled]);
}

export default useKeyboardNavigation;
