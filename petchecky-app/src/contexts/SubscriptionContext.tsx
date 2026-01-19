"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { Subscription, PlanType } from "@/types/subscription";

interface SubscriptionContextType {
  subscription: Subscription | null;
  isPremium: boolean;
  isPremiumPlus: boolean;
  currentPlan: PlanType;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  cancelSubscription: () => Promise<boolean>;
  vetConsultationsRemaining: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, getAccessToken } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 인증 토큰을 헤더에 포함하여 요청 (보안 강화)
      const token = await getAccessToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/subscription', { headers });
      const data = await response.json();

      if (response.ok) {
        setSubscription(data.subscription);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
      setError("구독 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [user, getAccessToken]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // 인증 토큰을 헤더에 포함하여 요청 (보안 강화)
      const token = await getAccessToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/subscription', {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        await fetchSubscription();
        return true;
      }

      const data = await response.json();
      setError(data.error);
      return false;
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      setError("구독 해지에 실패했습니다.");
      return false;
    }
  }, [user, getAccessToken, fetchSubscription]);

  // 파생 값들을 memoize
  const isPremium = useMemo(
    () => !!subscription && subscription.status === "active",
    [subscription]
  );

  const isPremiumPlus = useMemo(
    () => isPremium && subscription?.plan_type === "premium_plus",
    [isPremium, subscription?.plan_type]
  );

  const currentPlan: PlanType = useMemo(
    () => isPremiumPlus ? "premium_plus" : isPremium ? "premium" : "free",
    [isPremiumPlus, isPremium]
  );

  const vetConsultationsRemaining = useMemo(
    () => subscription?.vet_consultations_remaining || 0,
    [subscription?.vet_consultations_remaining]
  );

  // Context value를 memoize하여 불필요한 리렌더링 방지
  const value = useMemo(
    () => ({
      subscription,
      isPremium,
      isPremiumPlus,
      currentPlan,
      isLoading,
      error,
      refreshSubscription: fetchSubscription,
      cancelSubscription,
      vetConsultationsRemaining,
    }),
    [
      subscription,
      isPremium,
      isPremiumPlus,
      currentPlan,
      isLoading,
      error,
      fetchSubscription,
      cancelSubscription,
      vetConsultationsRemaining,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
