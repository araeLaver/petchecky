import { NextResponse } from 'next/server';
import { ERROR_MESSAGES, Language } from './constants';

// === 에러 타입 정의 ===
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// === 에러 코드 상수 ===
export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
  PREMIUM_PLUS_REQUIRED: 'PREMIUM_PLUS_REQUIRED',
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// === 에러 생성 헬퍼 ===
export function createError(code: ErrorCode, message: string, statusCode: number = 500): AppError {
  return new AppError(code, message, statusCode);
}

// === 에러 응답 생성 (API 라우트용) ===
interface ErrorResponseOptions {
  code?: ErrorCode;
  message: string;
  status?: number;
  details?: unknown;
}

export function createErrorResponse(options: ErrorResponseOptions): NextResponse {
  const { code = ERROR_CODES.SERVER_ERROR, message, status = 500, details } = options;

  console.error(`[${code}] ${message}`, details ? JSON.stringify(details) : '');

  return NextResponse.json(
    {
      error: message,
      code,
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    },
    { status }
  );
}

// === 공통 에러 응답 ===
export const ApiErrors = {
  unauthorized: (lang: Language = 'ko') => createErrorResponse({
    code: ERROR_CODES.AUTH_REQUIRED,
    message: ERROR_MESSAGES[lang].LOGIN_REQUIRED,
    status: 401,
  }),

  forbidden: (lang: Language = 'ko') => createErrorResponse({
    code: ERROR_CODES.UNAUTHORIZED,
    message: ERROR_MESSAGES[lang].PREMIUM_REQUIRED,
    status: 403,
  }),

  premiumPlusRequired: (lang: Language = 'ko') => createErrorResponse({
    code: ERROR_CODES.PREMIUM_PLUS_REQUIRED,
    message: ERROR_MESSAGES[lang].PREMIUM_PLUS_REQUIRED,
    status: 403,
  }),

  limitExceeded: (lang: Language = 'ko') => createErrorResponse({
    code: ERROR_CODES.LIMIT_EXCEEDED,
    message: ERROR_MESSAGES[lang].LIMIT_EXCEEDED,
    status: 429,
  }),

  invalidInput: (lang: Language = 'ko', details?: string) => createErrorResponse({
    code: ERROR_CODES.INVALID_INPUT,
    message: details || ERROR_MESSAGES[lang].INVALID_INPUT,
    status: 400,
  }),

  notFound: (resource: string = 'Resource') => createErrorResponse({
    code: ERROR_CODES.NOT_FOUND,
    message: `${resource} not found`,
    status: 404,
  }),

  serverError: (lang: Language = 'ko', error?: unknown) => createErrorResponse({
    code: ERROR_CODES.SERVER_ERROR,
    message: ERROR_MESSAGES[lang].GENERAL_ERROR,
    status: 500,
    details: error instanceof Error ? error.message : error,
  }),

  databaseError: (lang: Language = 'ko', error?: unknown) => createErrorResponse({
    code: ERROR_CODES.DATABASE_ERROR,
    message: ERROR_MESSAGES[lang].GENERAL_ERROR,
    status: 500,
    details: error,
  }),
};

// === 에러 안전하게 처리하기 ===
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

// === try-catch 래퍼 ===
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => T | Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      return errorHandler(error);
    }
    throw error;
  }
}

// === 타입 가드 ===
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'TypeError' ||
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}
