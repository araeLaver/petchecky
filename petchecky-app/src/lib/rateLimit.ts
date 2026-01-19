// Rate Limiting 유틸리티
// 메모리 기반 간단한 Rate Limiter (프로덕션에서는 Redis 권장)

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

// 메모리 기반 저장소
const rateLimitStore = new Map<string, RateLimitEntry>();

// 오래된 엔트리 정리 (메모리 누수 방지)
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// 주기적 정리 (5분마다)
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanupInterval(): void {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
  }
}

/**
 * Rate Limit 체크
 * @param identifier - 식별자 (IP 또는 userId)
 * @param maxRequests - 윈도우당 최대 요청 수
 * @param windowMs - 윈도우 크기 (밀리초)
 * @returns 허용 여부, 남은 요청 수, 리셋까지 남은 시간
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): RateLimitResult {
  startCleanupInterval();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // 첫 요청이거나 윈도우 만료된 경우
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: windowMs,
    };
  }

  // 제한 초과
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // 정상 요청
  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Rate Limit 상태 초기화 (테스트용)
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * 특정 식별자의 Rate Limit 초기화
 */
export function resetRateLimitFor(identifier: string): void {
  rateLimitStore.delete(identifier);
}

// Rate Limit 상수는 @/lib/constants에서 가져와서 사용
// import { RATE_LIMITS } from "@/lib/constants";

/**
 * NextRequest에서 클라이언트 IP 추출
 */
export function getClientIdentifier(
  request: { headers: { get: (name: string) => string | null } },
  userId?: string
): string {
  // 인증된 사용자는 userId 사용
  if (userId) {
    return `user:${userId}`;
  }

  // IP 기반 식별
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'anonymous';

  return `ip:${ip}`;
}
