"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Subscription } from "@/types/subscription";

interface SubscriptionResponse {
  subscription: Subscription | null;
  error?: string;
}

/**
 * 구독 정보를 가져오는 함수
 */
async function fetchSubscription(token: string | null): Promise<Subscription | null> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("/api/subscription", { headers });
  const data: SubscriptionResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "구독 정보를 불러오는데 실패했습니다.");
  }

  return data.subscription;
}

/**
 * 구독 취소 함수
 */
async function cancelSubscription(token: string | null): Promise<void> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("/api/subscription", {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "구독 해지에 실패했습니다.");
  }
}

/**
 * 구독 정보 조회 Query Hook
 *
 * @example
 * ```tsx
 * const { data: subscription, isLoading, error } = useSubscriptionQuery(token);
 * ```
 */
export function useSubscriptionQuery(token: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["subscription", token],
    queryFn: () => fetchSubscription(token),
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 구독 취소 Mutation Hook
 *
 * @example
 * ```tsx
 * const cancelMutation = useCancelSubscription();
 * await cancelMutation.mutateAsync(token);
 * ```
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      // 구독 취소 후 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}
