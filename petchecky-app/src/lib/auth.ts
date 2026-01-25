import { createClient } from '@supabase/supabase-js';
import { extractClientIp, generateRequestFingerprint } from './security';

// ============================================
// 보안 상수
// ============================================

const AUTH_CONFIG = {
  // 토큰 만료 시간 (초)
  TOKEN_EXPIRY: 60 * 60, // 1시간
  // 세션 최대 유효 기간 (일)
  SESSION_MAX_AGE_DAYS: 7,
  // 비활성 세션 타임아웃 (분)
  INACTIVITY_TIMEOUT_MINS: 30,
  // 최대 동시 세션 수
  MAX_CONCURRENT_SESSIONS: 5,
  // 실패한 로그인 시도 제한
  MAX_LOGIN_ATTEMPTS: 5,
  // 로그인 잠금 시간 (분)
  LOGIN_LOCKOUT_MINS: 15,
} as const;

// ============================================
// 역할 정의
// ============================================

export type UserRole = 'user' | 'premium' | 'premium_plus' | 'admin';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  user: ['read:own', 'write:own', 'chat:basic'],
  premium: ['read:own', 'write:own', 'chat:advanced', 'analytics:basic'],
  premium_plus: ['read:own', 'write:own', 'chat:unlimited', 'analytics:advanced', 'export:data'],
  admin: ['read:all', 'write:all', 'delete:all', 'admin:users', 'admin:settings'],
};

// 서버 사이드에서 사용할 Supabase Admin 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
}

// Admin 클라이언트 (RLS 우회)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey || ''
);

// 인증된 사용자 정보
export interface AuthenticatedUser {
  id: string;
  email: string;
}

// 구독 정보
export interface SubscriptionInfo {
  isPremium: boolean;
  isPremiumPlus: boolean;
  planType: string | null;
  currentPeriodEnd: string | null;
}

// 인증 결과
export interface AuthResult {
  user: AuthenticatedUser | null;
  subscription: SubscriptionInfo;
  error: string | null;
}

/**
 * 요청 헤더에서 Authorization 토큰을 추출하여 사용자 인증을 검증합니다.
 * 클라이언트에서 보낸 userId, isPremium 등을 신뢰하지 않고 서버에서 직접 검증합니다.
 */
export async function authenticateRequest(
  authHeader: string | null
): Promise<AuthResult> {
  const defaultSubscription: SubscriptionInfo = {
    isPremium: false,
    isPremiumPlus: false,
    planType: null,
    currentPeriodEnd: null,
  };

  // 인증 헤더가 없으면 비로그인 사용자
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      subscription: defaultSubscription,
      error: null,
    };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // 토큰으로 사용자 정보 조회
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return {
        user: null,
        subscription: defaultSubscription,
        error: '유효하지 않은 인증 토큰입니다.',
      };
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email || '',
    };

    // 구독 정보 조회
    const subscription = await getSubscriptionStatus(user.id);

    return {
      user: authenticatedUser,
      subscription,
      error: null,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      user: null,
      subscription: defaultSubscription,
      error: '인증 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 사용자의 구독 상태를 DB에서 조회합니다.
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionInfo> {
  const defaultSubscription: SubscriptionInfo = {
    isPremium: false,
    isPremiumPlus: false,
    planType: null,
    currentPeriodEnd: null,
  };

  try {
    const now = new Date().toISOString();

    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_type, current_period_end, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('current_period_end', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !subscription) {
      return defaultSubscription;
    }

    return {
      isPremium: true,
      isPremiumPlus: subscription.plan_type === 'premium_plus',
      planType: subscription.plan_type,
      currentPeriodEnd: subscription.current_period_end,
    };
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return defaultSubscription;
  }
}

/**
 * 사용자 입력에서 잠재적으로 위험한 프롬프트 인젝션 패턴을 정제합니다.
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // 최대 길이 제한
  let sanitized = input.slice(0, 2000);

  // 잠재적인 프롬프트 인젝션 패턴 제거/정제
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi,
    /forget\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi,
    /disregard\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi,
    /new\s+instructions?:/gi,
    /system\s*:\s*/gi,
    /assistant\s*:\s*/gi,
    /human\s*:\s*/gi,
    /user\s*:\s*/gi,
    /<\/?system>/gi,
    /<\/?assistant>/gi,
    /<\/?human>/gi,
    /<\/?user>/gi,
    /\[\[.*?\]\]/g, // [[...]] 형태의 특수 마커
    /\{\{.*?\}\}/g, // {{...}} 형태의 템플릿 마커
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '[filtered]');
  }

  return sanitized.trim();
}

/**
 * 펫 정보에서 위험한 문자를 정제합니다.
 */
export function sanitizePetProfile(profile: {
  name?: string;
  breed?: string;
  species?: string;
  age?: number;
  weight?: number;
}): {
  name: string;
  breed: string;
  species: string;
  age: number;
  weight: number;
} {
  return {
    name: sanitizeUserInput(profile.name || '').slice(0, 50),
    breed: sanitizeUserInput(profile.breed || '').slice(0, 50),
    species: profile.species === 'dog' || profile.species === 'cat' ? profile.species : 'dog',
    age: Math.max(0, Math.min(100, Number(profile.age) || 0)),
    weight: Math.max(0, Math.min(200, Number(profile.weight) || 0)),
  };
}

// ============================================
// 역할 기반 접근 제어 (RBAC)
// ============================================

/**
 * 사용자 역할 결정
 */
export function getUserRole(subscription: SubscriptionInfo, isAdmin?: boolean): UserRole {
  if (isAdmin) return 'admin';
  if (subscription.isPremiumPlus) return 'premium_plus';
  if (subscription.isPremium) return 'premium';
  return 'user';
}

/**
 * 권한 확인
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
}

/**
 * 여러 권한 중 하나라도 있는지 확인
 */
export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * 모든 권한이 있는지 확인
 */
export function hasAllPermissions(role: UserRole, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * API 엔드포인트 접근 권한 검증
 */
export async function authorizeApiAccess(
  authHeader: string | null,
  requiredPermissions: string[]
): Promise<{ authorized: boolean; user: AuthenticatedUser | null; error?: string }> {
  const authResult = await authenticateRequest(authHeader);

  if (!authResult.user) {
    return {
      authorized: false,
      user: null,
      error: '인증이 필요합니다.',
    };
  }

  const role = getUserRole(authResult.subscription);
  const hasAccess = hasAllPermissions(role, requiredPermissions);

  if (!hasAccess) {
    return {
      authorized: false,
      user: authResult.user,
      error: '이 작업을 수행할 권한이 없습니다.',
    };
  }

  return {
    authorized: true,
    user: authResult.user,
  };
}

// ============================================
// 세션 관리
// ============================================

// 메모리 기반 세션 추적 (프로덕션에서는 Redis 권장)
const sessionTracker = new Map<string, {
  lastActivity: number;
  fingerprint: string;
  createdAt: number;
}>();

/**
 * 세션 활동 기록
 */
export function trackSessionActivity(userId: string, headers: Headers): void {
  const fingerprint = generateRequestFingerprint(headers, '/session');

  sessionTracker.set(userId, {
    lastActivity: Date.now(),
    fingerprint,
    createdAt: sessionTracker.get(userId)?.createdAt || Date.now(),
  });

  // 오래된 세션 정리 (1시간마다)
  if (Math.random() < 0.01) {
    cleanupOldSessions();
  }
}

/**
 * 세션 유효성 확인
 */
export function isSessionValid(userId: string, headers: Headers): boolean {
  const session = sessionTracker.get(userId);
  if (!session) return true; // 새 세션은 허용

  const now = Date.now();
  const inactivityMs = AUTH_CONFIG.INACTIVITY_TIMEOUT_MINS * 60 * 1000;
  const maxAgeMs = AUTH_CONFIG.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  // 비활성 타임아웃 확인
  if (now - session.lastActivity > inactivityMs) {
    sessionTracker.delete(userId);
    return false;
  }

  // 최대 세션 기간 확인
  if (now - session.createdAt > maxAgeMs) {
    sessionTracker.delete(userId);
    return false;
  }

  // 핑거프린트 변경 감지 (세션 하이재킹 방지)
  const currentFingerprint = generateRequestFingerprint(headers, '/session');
  if (session.fingerprint !== currentFingerprint) {
    // 다른 기기/브라우저에서 접근 - 로깅만 하고 허용
    console.warn(`Session fingerprint mismatch for user ${userId}`);
  }

  return true;
}

/**
 * 세션 무효화
 */
export function invalidateSession(userId: string): void {
  sessionTracker.delete(userId);
}

/**
 * 오래된 세션 정리
 */
function cleanupOldSessions(): void {
  const now = Date.now();
  const maxAgeMs = AUTH_CONFIG.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  for (const [userId, session] of sessionTracker.entries()) {
    if (now - session.createdAt > maxAgeMs) {
      sessionTracker.delete(userId);
    }
  }
}

// ============================================
// 로그인 시도 제한
// ============================================

const loginAttempts = new Map<string, { count: number; lockUntil: number }>();

/**
 * 로그인 시도 기록
 */
export function recordLoginAttempt(identifier: string, success: boolean): void {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (success) {
    // 성공 시 기록 초기화
    loginAttempts.delete(identifier);
    return;
  }

  // 실패 시 카운트 증가
  const count = (attempt?.count || 0) + 1;
  const lockUntil = count >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS
    ? now + AUTH_CONFIG.LOGIN_LOCKOUT_MINS * 60 * 1000
    : 0;

  loginAttempts.set(identifier, { count, lockUntil });
}

/**
 * 로그인 잠금 상태 확인
 */
export function isLoginLocked(identifier: string): { locked: boolean; remainingTime?: number } {
  const attempt = loginAttempts.get(identifier);
  if (!attempt || !attempt.lockUntil) {
    return { locked: false };
  }

  const now = Date.now();
  if (now >= attempt.lockUntil) {
    // 잠금 해제
    loginAttempts.delete(identifier);
    return { locked: false };
  }

  return {
    locked: true,
    remainingTime: Math.ceil((attempt.lockUntil - now) / 1000 / 60), // 분 단위
  };
}

// Export config for use in other modules
export { AUTH_CONFIG };
