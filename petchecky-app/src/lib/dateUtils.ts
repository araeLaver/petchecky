/**
 * Date Utilities
 *
 * Centralized date formatting functions for consistent date display across the app.
 * All functions are localized for Korean (ko-KR).
 */

/**
 * Format date as relative time (오늘, 어제, N일 전, or short date)
 * @param dateString - ISO date string
 * @returns Formatted relative time string
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "방금 전";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24 && isSameDay(date, now)) {
    return `${diffHours}시간 전`;
  } else if (diffDays === 0) {
    return "오늘";
  } else if (diffDays === 1) {
    return "어제";
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return formatShortDate(dateString);
  }
}

/**
 * Format date as short date (1월 15일)
 * @param dateString - ISO date string
 * @returns Short formatted date string
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

/**
 * Format date as full date (2025년 1월 15일)
 * @param dateString - ISO date string
 * @returns Full formatted date string
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date as compact date (2025. 1. 15)
 * @param dateString - ISO date string
 * @returns Compact formatted date string
 */
export function formatCompactDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR");
}

/**
 * Format date with month and year (2025년 1월)
 * @param dateString - ISO date string
 * @returns Month and year formatted string
 */
export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
}

/**
 * Format date as YYYY-MM-DD for input fields
 * @param date - Date object
 * @returns YYYY-MM-DD formatted string
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Check if two dates are on the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Calculate days until a future date
 * @param futureDateString - ISO date string of future date
 * @returns Number of days until the date (negative if in past)
 */
export function daysUntil(futureDateString: string): number {
  const futureDate = new Date(futureDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  futureDate.setHours(0, 0, 0, 0);
  return Math.ceil((futureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is within N days from now
 * @param dateString - ISO date string
 * @param days - Number of days
 * @returns True if within range
 */
export function isWithinDays(dateString: string, days: number): boolean {
  const daysFromNow = daysUntil(dateString);
  return daysFromNow >= 0 && daysFromNow <= days;
}

/**
 * Get today's date as YYYY-MM-DD string
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return formatDateForInput(new Date());
}
