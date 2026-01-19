// API 클라이언트 - 공통 에러 처리 및 요청 로직

import { ERROR_CODES, ErrorCode } from "@/lib/errors";

// API 응답 타입
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  status: number;
  details?: unknown;
}

// API 요청 옵션
export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
  retries?: number;
  retryDelay?: number;
}

// 기본 설정
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000;
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * HTTP 상태 코드를 에러 코드로 변환
 */
function statusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ERROR_CODES.INVALID_INPUT;
    case 401:
      return ERROR_CODES.AUTH_REQUIRED;
    case 403:
      return ERROR_CODES.UNAUTHORIZED;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 429:
      return ERROR_CODES.LIMIT_EXCEEDED;
    default:
      return status >= 500 ? ERROR_CODES.SERVER_ERROR : ERROR_CODES.NETWORK_ERROR;
  }
}

/**
 * 에러 응답 생성
 */
function createApiError(status: number, message: string, details?: unknown): ApiError {
  return {
    code: statusToErrorCode(status),
    message,
    status,
    details,
  };
}

/**
 * 재시도 대기
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API 요청 실행
 */
async function executeRequest<T>(
  url: string,
  options: RequestOptions,
  attempt: number = 0
): Promise<ApiResponse<T>> {
  const {
    body,
    token,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchOptions
  } = options;

  // 헤더 설정
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type") && body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // JSON 응답 파싱
    let data: Record<string, unknown> | undefined;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        // JSON 파싱 실패 시 빈 객체
        data = {};
      }
    }

    // 성공 응답
    if (response.ok) {
      return { data: data as T };
    }

    // 재시도 가능한 에러인지 확인
    if (RETRYABLE_STATUS_CODES.includes(response.status) && attempt < retries) {
      // 지수 백오프 적용
      const backoffDelay = retryDelay * Math.pow(2, attempt);
      await delay(backoffDelay);
      return executeRequest<T>(url, options, attempt + 1);
    }

    // 에러 응답
    const errorMessage = (data?.error as string) || (data?.message as string) || "요청 처리에 실패했습니다.";
    return {
      error: createApiError(response.status, errorMessage, data?.details),
    };
  } catch (error) {
    // 네트워크 에러
    if (attempt < retries) {
      const backoffDelay = retryDelay * Math.pow(2, attempt);
      await delay(backoffDelay);
      return executeRequest<T>(url, options, attempt + 1);
    }

    const message = error instanceof Error ? error.message : "네트워크 연결을 확인해주세요.";
    return {
      error: createApiError(0, message),
    };
  }
}

/**
 * API 클라이언트
 */
export const apiClient = {
  /**
   * GET 요청
   */
  async get<T>(url: string, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<ApiResponse<T>> {
    return executeRequest<T>(url, { ...options, method: "GET" });
  },

  /**
   * POST 요청
   */
  async post<T>(url: string, body?: unknown, options: Omit<RequestOptions, "method"> = {}): Promise<ApiResponse<T>> {
    return executeRequest<T>(url, { ...options, method: "POST", body });
  },

  /**
   * PUT 요청
   */
  async put<T>(url: string, body?: unknown, options: Omit<RequestOptions, "method"> = {}): Promise<ApiResponse<T>> {
    return executeRequest<T>(url, { ...options, method: "PUT", body });
  },

  /**
   * PATCH 요청
   */
  async patch<T>(url: string, body?: unknown, options: Omit<RequestOptions, "method"> = {}): Promise<ApiResponse<T>> {
    return executeRequest<T>(url, { ...options, method: "PATCH", body });
  },

  /**
   * DELETE 요청
   */
  async delete<T>(url: string, options: Omit<RequestOptions, "method" | "body"> = {}): Promise<ApiResponse<T>> {
    return executeRequest<T>(url, { ...options, method: "DELETE" });
  },
};

export default apiClient;
