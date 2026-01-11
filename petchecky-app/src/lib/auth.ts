import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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
