/**
 * Color Contrast Utilities
 *
 * WCAG 2.1 색상 대비 검증 및 유틸리티
 */

/**
 * HEX 색상을 RGB로 변환
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // # 제거
  const cleanHex = hex.replace(/^#/, "");

  // 3자리 HEX를 6자리로 변환
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex;

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * RGB를 HEX로 변환
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 상대 휘도(Relative Luminance) 계산
 * WCAG 2.1 공식 사용
 */
export function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const { r, g, b } = rgb;

  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear =
    rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear =
    gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear =
    bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * 색상 대비 비율 계산
 * WCAG 2.1 공식: (L1 + 0.05) / (L2 + 0.05)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const luminance1 = getRelativeLuminance(color1);
  const luminance2 = getRelativeLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG 레벨별 대비 요구사항
 */
export interface ContrastRequirement {
  level: "AA" | "AAA";
  isLargeText: boolean;
  requiredRatio: number;
}

export const CONTRAST_REQUIREMENTS: ContrastRequirement[] = [
  { level: "AA", isLargeText: false, requiredRatio: 4.5 },
  { level: "AA", isLargeText: true, requiredRatio: 3 },
  { level: "AAA", isLargeText: false, requiredRatio: 7 },
  { level: "AAA", isLargeText: true, requiredRatio: 4.5 },
];

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
  const requirement = CONTRAST_REQUIREMENTS.find(
    (r) => r.level === level && r.isLargeText === isLargeText
  );

  return ratio >= (requirement?.requiredRatio ?? 4.5);
}

/**
 * 대비 검증 결과
 */
export interface ContrastResult {
  ratio: number;
  formattedRatio: string;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALargeText: boolean;
  passesAAALargeText: boolean;
  recommendation: string;
}

/**
 * 색상 쌍의 대비 검증
 */
export function validateContrast(
  foreground: string,
  background: string
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);

  const passesAA = ratio >= 4.5;
  const passesAAA = ratio >= 7;
  const passesAALargeText = ratio >= 3;
  const passesAAALargeText = ratio >= 4.5;

  let recommendation: string;
  if (passesAAA) {
    recommendation = "우수: AAA 기준 통과";
  } else if (passesAA) {
    recommendation = "양호: AA 기준 통과, AAA를 위해 대비 증가 권장";
  } else if (passesAALargeText) {
    recommendation = "주의: 큰 텍스트만 사용 권장 (18pt 이상 또는 14pt 굵게)";
  } else {
    recommendation = "실패: 대비가 부족합니다. 색상 조정이 필요합니다";
  }

  return {
    ratio,
    formattedRatio: `${ratio.toFixed(2)}:1`,
    passesAA,
    passesAAA,
    passesAALargeText,
    passesAAALargeText,
    recommendation,
  };
}

/**
 * 색상을 더 밝게 조정
 */
export function lightenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  const amount = (percent / 100) * 255;

  return rgbToHex(r + amount, g + amount, b + amount);
}

/**
 * 색상을 더 어둡게 조정
 */
export function darkenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  const amount = (percent / 100) * 255;

  return rgbToHex(r - amount, g - amount, b - amount);
}

/**
 * 최소 대비를 충족하는 색상 찾기
 */
export function findAccessibleColor(
  color: string,
  background: string,
  targetRatio = 4.5
): string {
  const currentRatio = getContrastRatio(color, background);

  if (currentRatio >= targetRatio) {
    return color;
  }

  const bgLuminance = getRelativeLuminance(background);
  const shouldDarken = bgLuminance > 0.5;

  let adjustedColor = color;
  let step = 5;
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    adjustedColor = shouldDarken
      ? darkenColor(adjustedColor, step)
      : lightenColor(adjustedColor, step);

    const newRatio = getContrastRatio(adjustedColor, background);
    if (newRatio >= targetRatio) {
      return adjustedColor;
    }

    attempts++;
  }

  // 최대 대비 색상 반환 (흑 또는 백)
  return shouldDarken ? "#000000" : "#ffffff";
}

/**
 * 텍스트에 적합한 배경 색상인지 확인하고 적절한 텍스트 색상 반환
 */
export function getAccessibleTextColor(
  background: string,
  preferDark = true
): string {
  const blackContrast = getContrastRatio("#000000", background);
  const whiteContrast = getContrastRatio("#ffffff", background);

  if (preferDark) {
    return blackContrast >= 4.5 ? "#000000" : "#ffffff";
  }

  return whiteContrast >= 4.5 ? "#ffffff" : "#000000";
}

/**
 * 색상이 "밝은" 색인지 확인
 */
export function isLightColor(color: string): boolean {
  const luminance = getRelativeLuminance(color);
  return luminance > 0.5;
}

/**
 * 접근성 있는 색상 팔레트 생성
 */
export interface AccessibleColorPalette {
  primary: string;
  primaryText: string;
  secondary: string;
  secondaryText: string;
  success: string;
  successText: string;
  warning: string;
  warningText: string;
  error: string;
  errorText: string;
}

export function createAccessiblePalette(
  baseColors: Partial<AccessibleColorPalette>,
  background = "#ffffff"
): AccessibleColorPalette {
  const defaults: AccessibleColorPalette = {
    primary: "#3b82f6",
    primaryText: "#ffffff",
    secondary: "#64748b",
    secondaryText: "#ffffff",
    success: "#22c55e",
    successText: "#ffffff",
    warning: "#f59e0b",
    warningText: "#000000",
    error: "#ef4444",
    errorText: "#ffffff",
  };

  const colors = { ...defaults, ...baseColors };

  // 각 색상에 대해 적절한 텍스트 색상 계산
  return {
    primary: findAccessibleColor(colors.primary, background),
    primaryText: getAccessibleTextColor(colors.primary),
    secondary: findAccessibleColor(colors.secondary, background),
    secondaryText: getAccessibleTextColor(colors.secondary),
    success: findAccessibleColor(colors.success, background),
    successText: getAccessibleTextColor(colors.success),
    warning: findAccessibleColor(colors.warning, background),
    warningText: getAccessibleTextColor(colors.warning),
    error: findAccessibleColor(colors.error, background),
    errorText: getAccessibleTextColor(colors.error),
  };
}
