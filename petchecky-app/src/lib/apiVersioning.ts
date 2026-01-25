/**
 * API 버저닝 시스템
 * v1/v2 API 버전 관리 체계
 */

import { NextRequest, NextResponse } from "next/server";

// ============================================
// Types
// ============================================

export type ApiVersion = "v1" | "v2" | "latest";

export interface ApiVersionConfig {
  currentVersion: ApiVersion;
  supportedVersions: ApiVersion[];
  deprecatedVersions: ApiVersion[];
  defaultVersion: ApiVersion;
  headerName: string;
  queryParamName: string;
  urlPathPrefix: boolean;
  deprecationWarning: boolean;
}

export interface VersionedRequest extends NextRequest {
  apiVersion: ApiVersion;
  resolvedVersion: ApiVersion;
}

export interface ApiEndpointConfig {
  path: string;
  versions: {
    [key in ApiVersion]?: {
      handler: (req: NextRequest) => Promise<NextResponse>;
      deprecated?: boolean;
      deprecationDate?: string;
      successorVersion?: ApiVersion;
    };
  };
}

export interface VersionedResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    apiVersion: ApiVersion;
    requestId: string;
    timestamp: string;
    deprecated?: boolean;
    deprecationDate?: string;
    successorVersion?: ApiVersion;
  };
}

// ============================================
// Default Config
// ============================================

const defaultConfig: ApiVersionConfig = {
  currentVersion: "v2",
  supportedVersions: ["v1", "v2"],
  deprecatedVersions: ["v1"],
  defaultVersion: "v2",
  headerName: "X-API-Version",
  queryParamName: "api_version",
  urlPathPrefix: true,
  deprecationWarning: true,
};

let config: ApiVersionConfig = { ...defaultConfig };

// ============================================
// Configuration
// ============================================

export function configureApiVersioning(options: Partial<ApiVersionConfig>): void {
  config = { ...config, ...options };
}

export function getApiVersionConfig(): ApiVersionConfig {
  return { ...config };
}

// ============================================
// Version Detection
// ============================================

/**
 * 요청에서 API 버전 추출
 */
export function extractApiVersion(req: NextRequest): ApiVersion {
  // 1. URL 경로에서 추출 (/api/v1/..., /api/v2/...)
  if (config.urlPathPrefix) {
    const pathMatch = req.nextUrl.pathname.match(/\/api\/(v\d+)\//);
    if (pathMatch && isValidVersion(pathMatch[1])) {
      return pathMatch[1] as ApiVersion;
    }
  }

  // 2. 헤더에서 추출
  const headerVersion = req.headers.get(config.headerName);
  if (headerVersion && isValidVersion(headerVersion)) {
    return headerVersion as ApiVersion;
  }

  // 3. 쿼리 파라미터에서 추출
  const queryVersion = req.nextUrl.searchParams.get(config.queryParamName);
  if (queryVersion && isValidVersion(queryVersion)) {
    return queryVersion as ApiVersion;
  }

  // 4. 기본 버전 반환
  return config.defaultVersion;
}

/**
 * 버전 유효성 검사
 */
export function isValidVersion(version: string): boolean {
  return config.supportedVersions.includes(version as ApiVersion);
}

/**
 * 버전 지원 여부 확인
 */
export function isVersionSupported(version: ApiVersion): boolean {
  return config.supportedVersions.includes(version);
}

/**
 * 버전 deprecated 여부 확인
 */
export function isVersionDeprecated(version: ApiVersion): boolean {
  return config.deprecatedVersions.includes(version);
}

/**
 * 최신 버전으로 해결
 */
export function resolveVersion(version: ApiVersion): ApiVersion {
  if (version === "latest") {
    return config.currentVersion;
  }
  return version;
}

// ============================================
// Response Helpers
// ============================================

/**
 * 버전화된 성공 응답 생성
 */
export function createVersionedResponse<T>(
  data: T,
  version: ApiVersion,
  options: {
    status?: number;
    deprecated?: boolean;
    deprecationDate?: string;
    successorVersion?: ApiVersion;
  } = {}
): NextResponse<VersionedResponse<T>> {
  const { status = 200, deprecated, deprecationDate, successorVersion } = options;

  const response: VersionedResponse<T> = {
    success: true,
    data,
    meta: {
      apiVersion: version,
      requestId: generateRequestId(),
      timestamp: new Date().toISOString(),
      ...(deprecated && { deprecated }),
      ...(deprecationDate && { deprecationDate }),
      ...(successorVersion && { successorVersion }),
    },
  };

  const headers: Record<string, string> = {
    "X-API-Version": version,
    "X-Request-Id": response.meta.requestId,
  };

  if (deprecated && config.deprecationWarning) {
    headers["Deprecation"] = "true";
    if (deprecationDate) {
      headers["Sunset"] = deprecationDate;
    }
    headers["X-Deprecated-Message"] = `API ${version} is deprecated. Please migrate to ${successorVersion || config.currentVersion}.`;
  }

  return NextResponse.json(response, { status, headers });
}

/**
 * 버전화된 에러 응답 생성
 */
export function createVersionedErrorResponse(
  error: {
    code: string;
    message: string;
    details?: unknown;
  },
  version: ApiVersion,
  status: number = 400
): NextResponse<VersionedResponse> {
  const response: VersionedResponse = {
    success: false,
    error,
    meta: {
      apiVersion: version,
      requestId: generateRequestId(),
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, {
    status,
    headers: {
      "X-API-Version": version,
      "X-Request-Id": response.meta.requestId,
    },
  });
}

/**
 * 버전 미지원 에러 응답
 */
export function createUnsupportedVersionResponse(
  requestedVersion: string
): NextResponse<VersionedResponse> {
  return createVersionedErrorResponse(
    {
      code: "UNSUPPORTED_API_VERSION",
      message: `API version '${requestedVersion}' is not supported. Supported versions: ${config.supportedVersions.join(", ")}`,
      details: {
        requestedVersion,
        supportedVersions: config.supportedVersions,
        currentVersion: config.currentVersion,
      },
    },
    config.defaultVersion,
    400
  );
}

// ============================================
// Version Router
// ============================================

/**
 * 버전별 핸들러 라우팅
 */
export function createVersionedHandler(
  handlers: {
    [key in ApiVersion]?: (req: NextRequest) => Promise<NextResponse>;
  }
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const requestedVersion = extractApiVersion(req);
    const resolvedVersion = resolveVersion(requestedVersion);

    // 버전 지원 확인
    if (!isVersionSupported(resolvedVersion)) {
      return createUnsupportedVersionResponse(requestedVersion);
    }

    // 핸들러 찾기
    const handler = handlers[resolvedVersion];
    if (!handler) {
      // fallback to latest available handler
      const availableVersions = Object.keys(handlers) as ApiVersion[];
      const fallbackVersion = availableVersions[availableVersions.length - 1];
      const fallbackHandler = handlers[fallbackVersion];

      if (fallbackHandler) {
        return fallbackHandler(req);
      }

      return createVersionedErrorResponse(
        {
          code: "HANDLER_NOT_FOUND",
          message: `No handler available for API version ${resolvedVersion}`,
        },
        resolvedVersion,
        500
      );
    }

    // 핸들러 실행
    const response = await handler(req);

    // deprecated 버전 헤더 추가
    if (isVersionDeprecated(resolvedVersion) && config.deprecationWarning) {
      const headers = new Headers(response.headers);
      headers.set("Deprecation", "true");
      headers.set(
        "X-Deprecated-Message",
        `API ${resolvedVersion} is deprecated. Please migrate to ${config.currentVersion}.`
      );

      return new NextResponse(response.body, {
        status: response.status,
        headers,
      });
    }

    return response;
  };
}

// ============================================
// Middleware
// ============================================

/**
 * API 버저닝 미들웨어
 */
export function apiVersioningMiddleware(
  req: NextRequest
): NextResponse | null {
  // API 경로가 아니면 패스
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return null;
  }

  const version = extractApiVersion(req);
  const resolvedVersion = resolveVersion(version);

  // 버전 미지원 시 에러
  if (!isVersionSupported(resolvedVersion)) {
    return createUnsupportedVersionResponse(version);
  }

  // 버전 정보를 헤더에 추가하고 계속 진행
  const response = NextResponse.next();
  response.headers.set("X-API-Version", resolvedVersion);

  if (isVersionDeprecated(resolvedVersion) && config.deprecationWarning) {
    response.headers.set("Deprecation", "true");
    response.headers.set(
      "X-Deprecated-Message",
      `API ${resolvedVersion} is deprecated. Please migrate to ${config.currentVersion}.`
    );
  }

  return response;
}

// ============================================
// Transform Utilities
// ============================================

/**
 * v1 -> v2 데이터 변환
 */
export function transformV1ToV2<T extends Record<string, unknown>>(
  data: T,
  transformMap: { [key: string]: string | ((value: unknown) => unknown) }
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const transform = transformMap[key];

    if (typeof transform === "string") {
      // 키 이름 변경
      result[transform] = value;
    } else if (typeof transform === "function") {
      // 값 변환
      result[key] = transform(value);
    } else {
      // 그대로 유지
      result[key] = value;
    }
  }

  return result;
}

/**
 * v2 -> v1 데이터 변환 (하위 호환성)
 */
export function transformV2ToV1<T extends Record<string, unknown>>(
  data: T,
  transformMap: { [key: string]: string | ((value: unknown) => unknown) }
): Record<string, unknown> {
  return transformV1ToV2(data, transformMap);
}

// ============================================
// Utilities
// ============================================

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// Exports
// ============================================

export const apiVersioning = {
  configure: configureApiVersioning,
  getConfig: getApiVersionConfig,
  extractVersion: extractApiVersion,
  isValidVersion,
  isVersionSupported,
  isVersionDeprecated,
  resolveVersion,
  createResponse: createVersionedResponse,
  createErrorResponse: createVersionedErrorResponse,
  createHandler: createVersionedHandler,
  middleware: apiVersioningMiddleware,
  transformV1ToV2,
  transformV2ToV1,
};
