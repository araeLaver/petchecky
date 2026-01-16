/**
 * 안전한 JSON 파싱 유틸리티
 * localStorage 데이터 손상 시에도 앱 크래시 방지
 */

/**
 * JSON을 안전하게 파싱합니다.
 * 파싱 실패 시 기본값을 반환합니다.
 *
 * @param jsonString - 파싱할 JSON 문자열
 * @param fallback - 파싱 실패 시 반환할 기본값
 * @returns 파싱된 객체 또는 기본값
 *
 * @example
 * ```typescript
 * const data = safeJsonParse<Pet[]>(localStorage.getItem('pets'), []);
 * ```
 */
export function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) {
    return fallback;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('JSON parse failed, using fallback:', error);
    return fallback;
  }
}

/**
 * localStorage에서 안전하게 JSON 데이터를 가져옵니다.
 *
 * @param key - localStorage 키
 * @param fallback - 파싱 실패 또는 데이터 없을 시 기본값
 * @returns 파싱된 객체 또는 기본값
 *
 * @example
 * ```typescript
 * const pets = getStorageItem<Pet[]>('petchecky_pets', []);
 * ```
 */
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    // SSR 환경 체크
    if (typeof localStorage === 'undefined') {
      return fallback;
    }

    const item = localStorage.getItem(key);
    if (!item) {
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to get storage item "${key}":`, error);
    return fallback;
  }
}

/**
 * localStorage에 안전하게 JSON 데이터를 저장합니다.
 * 용량 초과 시 false를 반환합니다.
 *
 * @param key - localStorage 키
 * @param value - 저장할 값
 * @returns 저장 성공 여부
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    // SSR 환경 체크
    if (typeof localStorage === 'undefined') {
      return false;
    }

    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // QuotaExceededError 등 처리
    console.error(`Failed to set storage item "${key}":`, error);
    return false;
  }
}
