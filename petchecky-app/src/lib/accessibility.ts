/**
 * Accessibility Utilities
 *
 * WCAG 2.1 AA 준수를 위한 접근성 유틸리티
 */

/**
 * 포커스 가능한 요소 셀렉터
 */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * 요소 내의 모든 포커스 가능한 요소 가져오기
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(elements).filter((el) => {
    // visibility: hidden 또는 display: none 요소 제외
    const style = window.getComputedStyle(el);
    return style.visibility !== "hidden" && style.display !== "none";
  });
}

/**
 * 첫 번째 포커스 가능한 요소로 포커스 이동
 */
export function focusFirstElement(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  if (elements.length > 0) {
    elements[0].focus();
  }
}

/**
 * 마지막 포커스 가능한 요소로 포커스 이동
 */
export function focusLastElement(container: HTMLElement): void {
  const elements = getFocusableElements(container);
  if (elements.length > 0) {
    elements[elements.length - 1].focus();
  }
}

/**
 * 포커스 트랩 생성
 * 모달, 드로어 등에서 포커스가 해당 영역 내에만 유지되도록 함
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);

  // 클린업 함수 반환
  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * ARIA 라이브 리전을 통한 스크린 리더 공지
 */
class AriaAnnouncer {
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initRegions();
    }
  }

  private initRegions() {
    // Polite region
    this.politeRegion = document.getElementById("aria-live-polite");
    if (!this.politeRegion) {
      this.politeRegion = document.createElement("div");
      this.politeRegion.id = "aria-live-polite";
      this.politeRegion.setAttribute("role", "status");
      this.politeRegion.setAttribute("aria-live", "polite");
      this.politeRegion.setAttribute("aria-atomic", "true");
      this.politeRegion.className = "sr-only";
      document.body.appendChild(this.politeRegion);
    }

    // Assertive region
    this.assertiveRegion = document.getElementById("aria-live-assertive");
    if (!this.assertiveRegion) {
      this.assertiveRegion = document.createElement("div");
      this.assertiveRegion.id = "aria-live-assertive";
      this.assertiveRegion.setAttribute("role", "alert");
      this.assertiveRegion.setAttribute("aria-live", "assertive");
      this.assertiveRegion.setAttribute("aria-atomic", "true");
      this.assertiveRegion.className = "sr-only";
      document.body.appendChild(this.assertiveRegion);
    }
  }

  /**
   * 정중한(polite) 공지 - 현재 읽고 있는 내용 완료 후 공지
   */
  announce(message: string) {
    if (!this.politeRegion) {
      this.initRegions();
    }
    if (this.politeRegion) {
      this.politeRegion.textContent = "";
      // 약간의 딜레이 후 메시지 설정 (스크린 리더가 변경 감지하도록)
      setTimeout(() => {
        if (this.politeRegion) {
          this.politeRegion.textContent = message;
        }
      }, 100);
    }
  }

  /**
   * 긴급(assertive) 공지 - 즉시 공지
   */
  announceUrgent(message: string) {
    if (!this.assertiveRegion) {
      this.initRegions();
    }
    if (this.assertiveRegion) {
      this.assertiveRegion.textContent = "";
      setTimeout(() => {
        if (this.assertiveRegion) {
          this.assertiveRegion.textContent = message;
        }
      }, 100);
    }
  }

  /**
   * 공지 내용 지우기
   */
  clear() {
    if (this.politeRegion) {
      this.politeRegion.textContent = "";
    }
    if (this.assertiveRegion) {
      this.assertiveRegion.textContent = "";
    }
  }
}

// 싱글톤 인스턴스
let announcer: AriaAnnouncer | null = null;

export function getAnnouncer(): AriaAnnouncer {
  if (!announcer && typeof window !== "undefined") {
    announcer = new AriaAnnouncer();
  }
  return announcer!;
}

/**
 * 스크린 리더에 메시지 공지
 */
export function announce(message: string, urgent = false): void {
  const ann = getAnnouncer();
  if (ann) {
    if (urgent) {
      ann.announceUrgent(message);
    } else {
      ann.announce(message);
    }
  }
}

/**
 * 색상 대비 비율 계산
 * WCAG AA: 일반 텍스트 4.5:1, 큰 텍스트 3:1
 * WCAG AAA: 일반 텍스트 7:1, 큰 텍스트 4.5:1
 */
export function getContrastRatio(color1: string, color2: string): number {
  const luminance1 = getRelativeLuminance(color1);
  const luminance2 = getRelativeLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const { r, g, b } = rgb;

  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * WCAG 대비 기준 충족 여부 확인
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === "AAA") {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  // AA level
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * 페이지 타이틀 업데이트 (페이지 변경 시 스크린 리더에 알림)
 */
export function updatePageTitle(title: string, suffix = "펫체키"): void {
  document.title = `${title} | ${suffix}`;
  announce(`${title} 페이지로 이동했습니다.`);
}

/**
 * 요소에 포커스 표시 스타일 적용
 * (포커스 링이 표시되도록 키보드 포커스 감지)
 */
export function initKeyboardFocusDetection(): () => void {
  let hadKeyboardEvent = false;
  let isPointerMoving = false;
  let pointerMoveTimer: NodeJS.Timeout | null = null;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab" || e.key === "ArrowUp" || e.key === "ArrowDown") {
      hadKeyboardEvent = true;
    }
  };

  const handlePointerMove = () => {
    isPointerMoving = true;
    if (pointerMoveTimer) {
      clearTimeout(pointerMoveTimer);
    }
    pointerMoveTimer = setTimeout(() => {
      isPointerMoving = false;
    }, 100);
  };

  const handleFocus = () => {
    if (hadKeyboardEvent && !isPointerMoving) {
      document.body.classList.add("keyboard-focus");
    }
  };

  const handleBlur = () => {
    hadKeyboardEvent = false;
    document.body.classList.remove("keyboard-focus");
  };

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("focusin", handleFocus);
  document.addEventListener("focusout", handleBlur);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("focusin", handleFocus);
    document.removeEventListener("focusout", handleBlur);
    if (pointerMoveTimer) {
      clearTimeout(pointerMoveTimer);
    }
  };
}

/**
 * 로딩 상태 공지
 */
export function announceLoading(isLoading: boolean, context = ""): void {
  if (isLoading) {
    announce(`${context ? context + " " : ""}로딩 중입니다. 잠시만 기다려주세요.`);
  } else {
    announce(`${context ? context + " " : ""}로딩이 완료되었습니다.`);
  }
}

/**
 * 에러 공지
 */
export function announceError(message: string): void {
  announce(`오류: ${message}`, true);
}

/**
 * 성공 공지
 */
export function announceSuccess(message: string): void {
  announce(`성공: ${message}`);
}
