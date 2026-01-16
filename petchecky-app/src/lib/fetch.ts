/**
 * 네트워크 요청 재시도 유틸리티
 * - 지수 백오프 적용
 * - 429, 5xx 에러 시 자동 재시도
 * - 최대 3회 재시도
 */

export interface FetchWithRetryOptions extends RequestInit {
  /** 최대 재시도 횟수 (기본값: 3) */
  maxRetries?: number;
  /** 초기 대기 시간 (ms, 기본값: 1000) */
  initialDelay?: number;
  /** 지수 백오프 배수 (기본값: 2) */
  backoffMultiplier?: number;
  /** 최대 대기 시간 (ms, 기본값: 10000) */
  maxDelay?: number;
  /** 타임아웃 (ms, 기본값: 30000) */
  timeout?: number;
}

export interface FetchWithRetryResult<T = unknown> {
  data: T | null;
  error: Error | null;
  status: number;
  retryCount: number;
}

// 재시도 가능한 HTTP 상태 코드
const RETRYABLE_STATUS_CODES = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
];

// 재시도 가능한 네트워크 에러
const RETRYABLE_ERROR_NAMES = [
  'NetworkError',
  'TimeoutError',
  'AbortError',
];

/**
 * 지정된 시간만큼 대기
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 재시도 가능한 에러인지 확인
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    return RETRYABLE_ERROR_NAMES.some(name =>
      error.name.includes(name) || error.message.includes(name)
    );
  }
  return false;
}

/**
 * 재시도 가능한 응답인지 확인
 */
function isRetryableResponse(response: Response): boolean {
  return RETRYABLE_STATUS_CODES.includes(response.status);
}

/**
 * 지수 백오프가 적용된 대기 시간 계산
 */
function calculateDelay(
  retryCount: number,
  initialDelay: number,
  backoffMultiplier: number,
  maxDelay: number
): number {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, retryCount);
  // 지터(jitter) 추가로 thundering herd 방지
  const jitter = Math.random() * 0.3 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * 타임아웃이 적용된 fetch
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number }
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 지수 백오프와 재시도 로직이 적용된 fetch 함수
 *
 * @example
 * ```typescript
 * const result = await fetchWithRetry('/api/data', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ data: 'test' }),
 *   maxRetries: 3,
 * });
 *
 * if (result.error) {
 *   console.error('Failed after retries:', result.error);
 * } else {
 *   console.log('Success:', result.data);
 * }
 * ```
 */
export async function fetchWithRetry<T = unknown>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<FetchWithRetryResult<T>> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 10000,
    timeout = 30000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  let lastStatus = 0;
  let retryCount = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        timeout,
      });

      lastStatus = response.status;

      // 성공 응답
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        let data: T | null = null;

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = (await response.text()) as T;
        }

        return {
          data,
          error: null,
          status: response.status,
          retryCount,
        };
      }

      // 재시도 불가능한 클라이언트 에러 (4xx, 429 제외)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null,
          error: new Error(errorData.message || errorData.error || `HTTP ${response.status}`),
          status: response.status,
          retryCount,
        };
      }

      // 재시도 가능한 응답인 경우
      if (isRetryableResponse(response) && attempt < maxRetries) {
        retryCount++;
        const waitTime = calculateDelay(attempt, initialDelay, backoffMultiplier, maxDelay);

        // Retry-After 헤더가 있으면 해당 값 사용
        const retryAfter = response.headers.get('Retry-After');
        const actualWaitTime = retryAfter
          ? Math.min(parseInt(retryAfter, 10) * 1000, maxDelay)
          : waitTime;

        await delay(actualWaitTime);
        continue;
      }

      // 최대 재시도 횟수 초과
      return {
        data: null,
        error: new Error(`HTTP ${response.status} after ${retryCount} retries`),
        status: response.status,
        retryCount,
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 재시도 가능한 네트워크 에러인 경우
      if (isRetryableError(error) && attempt < maxRetries) {
        retryCount++;
        const waitTime = calculateDelay(attempt, initialDelay, backoffMultiplier, maxDelay);
        await delay(waitTime);
        continue;
      }

      // 재시도 불가능한 에러이거나 최대 재시도 횟수 초과
      return {
        data: null,
        error: lastError,
        status: lastStatus,
        retryCount,
      };
    }
  }

  // 모든 재시도 실패
  return {
    data: null,
    error: lastError || new Error('Max retries exceeded'),
    status: lastStatus,
    retryCount,
  };
}

/**
 * JSON POST 요청을 위한 편의 함수
 */
export async function postJson<T = unknown, D = unknown>(
  url: string,
  data: D,
  options: Omit<FetchWithRetryOptions, 'method' | 'body'> = {}
): Promise<FetchWithRetryResult<T>> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * JSON GET 요청을 위한 편의 함수
 */
export async function getJson<T = unknown>(
  url: string,
  options: Omit<FetchWithRetryOptions, 'method' | 'body'> = {}
): Promise<FetchWithRetryResult<T>> {
  return fetchWithRetry<T>(url, {
    ...options,
    method: 'GET',
  });
}
