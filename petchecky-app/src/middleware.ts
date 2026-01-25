/**
 * Next.js Security Middleware
 *
 * 보안 관련 미들웨어:
 * - 요청 크기 제한
 * - 보안 로깅
 * - 의심스러운 요청 감지
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 보안 설정
const SECURITY_CONFIG = {
  // 최대 요청 본문 크기 (10MB)
  MAX_BODY_SIZE: 10 * 1024 * 1024,
  // Rate limiting은 별도 구현 (src/lib/rateLimit.ts)
  // 차단할 User-Agent 패턴 (봇, 스캐너 등)
  BLOCKED_USER_AGENTS: [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /nmap/i,
    /masscan/i,
    /zgrab/i,
  ],
  // 의심스러운 경로 패턴
  SUSPICIOUS_PATHS: [
    /\.env/i,
    /\.git/i,
    /wp-admin/i,
    /wp-login/i,
    /phpmyadmin/i,
    /admin\.php/i,
    /shell\.php/i,
    /eval-stdin/i,
  ],
  // 보호할 API 경로
  PROTECTED_API_PATHS: ["/api/chat", "/api/reservation", "/api/community"],
};

// 보안 로그 기록
function logSecurityEvent(
  type: "blocked" | "suspicious" | "warning",
  request: NextRequest,
  details: string
) {
  const logData = {
    timestamp: new Date().toISOString(),
    type,
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get("user-agent") || "unknown",
    details,
  };

  // 프로덕션에서는 외부 로깅 서비스로 전송
  if (process.env.NODE_ENV === "production") {
    // Sentry나 다른 로깅 서비스로 전송 가능
    console.warn("[SECURITY]", JSON.stringify(logData));
  } else {
    console.log("[SECURITY]", logData);
  }
}

// User-Agent 검사
function isBlockedUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return SECURITY_CONFIG.BLOCKED_USER_AGENTS.some((pattern) =>
    pattern.test(userAgent)
  );
}

// 의심스러운 경로 검사
function isSuspiciousPath(pathname: string): boolean {
  return SECURITY_CONFIG.SUSPICIOUS_PATHS.some((pattern) =>
    pattern.test(pathname)
  );
}

// SQL Injection 패턴 감지
function hasSqlInjectionPattern(url: string): boolean {
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /UNION(\s+)ALL(\s+)SELECT/i,
  ];
  return sqlPatterns.some((pattern) => pattern.test(url));
}

// XSS 패턴 감지
function hasXssPattern(url: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+onerror/gi,
    /<svg[^>]+onload/gi,
  ];
  return xssPatterns.some((pattern) => pattern.test(decodeURIComponent(url)));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent");

  // 1. User-Agent 차단
  if (isBlockedUserAgent(userAgent)) {
    logSecurityEvent("blocked", request, "Blocked user agent detected");
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. 의심스러운 경로 차단
  if (isSuspiciousPath(pathname)) {
    logSecurityEvent("blocked", request, "Suspicious path access attempt");
    return new NextResponse("Not Found", { status: 404 });
  }

  // 3. SQL Injection 감지
  const fullUrl = request.nextUrl.toString();
  if (hasSqlInjectionPattern(fullUrl)) {
    logSecurityEvent("blocked", request, "SQL injection pattern detected");
    return new NextResponse("Bad Request", { status: 400 });
  }

  // 4. XSS 감지
  if (hasXssPattern(fullUrl)) {
    logSecurityEvent("blocked", request, "XSS pattern detected");
    return new NextResponse("Bad Request", { status: 400 });
  }

  // 5. API 요청 추가 검증
  if (pathname.startsWith("/api/")) {
    // Content-Length 검사 (POST, PUT, PATCH)
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      const contentLength = request.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > SECURITY_CONFIG.MAX_BODY_SIZE) {
        logSecurityEvent("blocked", request, "Request body too large");
        return new NextResponse("Payload Too Large", { status: 413 });
      }
    }

    // CSRF 검증 (state-changing 요청)
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");

      // Origin 헤더 검증 (CSRF 방지)
      if (origin && host) {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          logSecurityEvent("blocked", request, "CSRF: Origin mismatch");
          return new NextResponse("Forbidden", { status: 403 });
        }
      }
    }
  }

  // 6. 응답 헤더 추가
  const response = NextResponse.next();

  // 추가 보안 헤더 (next.config.ts와 중복되지 않는 것들)
  response.headers.set("X-DNS-Prefetch-Control", "on");

  return response;
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
