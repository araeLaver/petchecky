import { supabase } from './client';

export const MONTHLY_FREE_LIMIT = 20;

export interface UsageRecord {
  id: string;
  user_id: string;
  year_month: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// 현재 월 문자열 생성 (예: '2025-01')
function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// 사용량 조회
export async function getUsage(userId: string): Promise<number> {
  const yearMonth = getCurrentYearMonth();

  const { data, error } = await supabase
    .from('usage_records')
    .select('usage_count')
    .eq('user_id', userId)
    .eq('year_month', yearMonth)
    .single();

  if (error) {
    // 레코드가 없는 경우 0 반환
    if (error.code === 'PGRST116') {
      return 0;
    }
    console.error('Error fetching usage:', error);
    return 0;
  }

  return data?.usage_count || 0;
}

// 사용량 증가 (최적화: RPC 함수 사용 시 1쿼리)
export async function incrementUsage(userId: string): Promise<boolean> {
  const yearMonth = getCurrentYearMonth();

  // RPC 함수로 원자적 증가 시도 (1쿼리)
  const { error: rpcError } = await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_year_month: yearMonth
  });

  // RPC 함수가 성공하면 완료
  if (!rpcError) {
    return true;
  }

  // Fallback: RPC 함수가 없는 경우 기존 로직 (2쿼리)
  if (rpcError.code === '42883') {
    const { data: existing } = await supabase
      .from('usage_records')
      .select('id, usage_count')
      .eq('user_id', userId)
      .eq('year_month', yearMonth)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('usage_records')
        .update({
          usage_count: existing.usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating usage:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('usage_records')
        .insert({
          user_id: userId,
          year_month: yearMonth,
          usage_count: 1
        });

      if (error) {
        console.error('Error creating usage record:', error);
        return false;
      }
    }
    return true;
  }

  console.error('Error incrementing usage:', rpcError);
  return false;
}

// 남은 무료 횟수 조회
export async function getRemainingUsage(userId: string): Promise<number> {
  const used = await getUsage(userId);
  return Math.max(0, MONTHLY_FREE_LIMIT - used);
}

// 사용 가능 여부 체크
export async function canUseService(userId: string): Promise<boolean> {
  const used = await getUsage(userId);
  return used < MONTHLY_FREE_LIMIT;
}
