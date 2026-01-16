/**
 * localStorage 용량 관리 유틸리티
 */

const STORAGE_LIMIT_MB = 5; // 브라우저 기본 제한
const WARNING_THRESHOLD = 0.8; // 80% 사용시 경고

/**
 * localStorage 전체 사용량 계산 (bytes)
 */
export function getStorageUsage(): number {
  if (typeof window === "undefined") return 0;

  let total = 0;
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value !== null) {
      total += (key.length + value.length) * 2; // UTF-16 encoding
    }
  }
  return total;
}

/**
 * localStorage 사용량을 MB 단위로 반환
 */
export function getStorageUsageMB(): number {
  return getStorageUsage() / (1024 * 1024);
}

/**
 * localStorage 사용률 반환 (0-1)
 */
export function getStorageUsagePercent(): number {
  return getStorageUsageMB() / STORAGE_LIMIT_MB;
}

/**
 * 저장 공간 부족 여부 확인
 */
export function isStorageLow(): boolean {
  return getStorageUsagePercent() >= WARNING_THRESHOLD;
}

/**
 * 특정 키의 용량 계산 (bytes)
 */
export function getKeySize(key: string): number {
  if (typeof window === "undefined") return 0;

  const value = localStorage.getItem(key);
  if (!value) return 0;
  return (key.length + value.length) * 2;
}

/**
 * 모든 키의 용량 정보 반환 (가장 큰 것부터 정렬)
 */
export function getStorageBreakdown(): Array<{ key: string; size: number; sizeKB: number }> {
  if (typeof window === "undefined") return [];

  const items: Array<{ key: string; size: number; sizeKB: number }> = [];
  const keys = Object.keys(localStorage);

  for (const key of keys) {
    const size = getKeySize(key);
    if (size > 0) {
      items.push({
        key,
        size,
        sizeKB: Math.round(size / 1024 * 100) / 100,
      });
    }
  }

  return items.sort((a, b) => b.size - a.size);
}

/**
 * 오래된 채팅 기록 정리 (최근 N개 유지)
 */
export function cleanupChatHistory(keepCount: number = 50): number {
  if (typeof window === "undefined") return 0;

  const chatHistory = localStorage.getItem("chatHistory");
  if (!chatHistory) return 0;

  try {
    const history = JSON.parse(chatHistory);
    if (!Array.isArray(history) || history.length <= keepCount) return 0;

    const oldSize = getKeySize("chatHistory");
    const trimmedHistory = history.slice(-keepCount);
    localStorage.setItem("chatHistory", JSON.stringify(trimmedHistory));
    const newSize = getKeySize("chatHistory");

    return oldSize - newSize;
  } catch {
    return 0;
  }
}

/**
 * 오래된 오프라인 동기화 데이터 정리
 */
export function cleanupPendingSync(): number {
  if (typeof window === "undefined") return 0;

  const pendingSync = localStorage.getItem("pendingSync");
  if (!pendingSync) return 0;

  try {
    const data = JSON.parse(pendingSync);
    if (!Array.isArray(data)) return 0;

    const oldSize = getKeySize("pendingSync");
    // 24시간 이상 된 항목 삭제
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const filtered = data.filter((item: { timestamp?: number }) =>
      item.timestamp && item.timestamp > oneDayAgo
    );

    if (filtered.length === data.length) return 0;

    localStorage.setItem("pendingSync", JSON.stringify(filtered));
    const newSize = getKeySize("pendingSync");

    return oldSize - newSize;
  } catch {
    return 0;
  }
}

/**
 * 캐시 데이터 정리
 */
export function cleanupCache(): number {
  if (typeof window === "undefined") return 0;

  let freedBytes = 0;
  const cacheKeys = ["imageCache", "apiCache", "searchCache"];

  for (const key of cacheKeys) {
    if (localStorage.getItem(key)) {
      freedBytes += getKeySize(key);
      localStorage.removeItem(key);
    }
  }

  return freedBytes;
}

/**
 * 자동 정리 실행 (저장 공간 부족시)
 */
export function autoCleanup(): { success: boolean; freedBytes: number; message: string } {
  if (typeof window === "undefined") {
    return { success: false, freedBytes: 0, message: "서버 환경에서는 실행할 수 없습니다" };
  }

  if (!isStorageLow()) {
    return { success: true, freedBytes: 0, message: "정리가 필요하지 않습니다" };
  }

  let totalFreed = 0;

  // 1단계: 캐시 정리
  totalFreed += cleanupCache();

  // 2단계: 오프라인 동기화 데이터 정리
  totalFreed += cleanupPendingSync();

  // 3단계: 오래된 채팅 기록 정리
  if (isStorageLow()) {
    totalFreed += cleanupChatHistory(30);
  }

  // 4단계: 더 적극적인 정리
  if (isStorageLow()) {
    totalFreed += cleanupChatHistory(10);
  }

  const freedKB = Math.round(totalFreed / 1024 * 100) / 100;

  return {
    success: !isStorageLow(),
    freedBytes: totalFreed,
    message: `${freedKB}KB를 정리했습니다`,
  };
}

/**
 * 안전하게 localStorage에 저장 (용량 초과시 자동 정리)
 */
export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    // QuotaExceededError 처리
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      const { success } = autoCleanup();
      if (success) {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch {
          return false;
        }
      }
    }
    return false;
  }
}

/**
 * 저장 공간 상태 요약
 */
export function getStorageStatus(): {
  usedMB: number;
  limitMB: number;
  percent: number;
  isLow: boolean;
  breakdown: Array<{ key: string; sizeKB: number }>;
} {
  const usedMB = Math.round(getStorageUsageMB() * 100) / 100;
  const percent = Math.round(getStorageUsagePercent() * 100);

  return {
    usedMB,
    limitMB: STORAGE_LIMIT_MB,
    percent,
    isLow: isStorageLow(),
    breakdown: getStorageBreakdown().slice(0, 5).map(({ key, sizeKB }) => ({ key, sizeKB })),
  };
}
