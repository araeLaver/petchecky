"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  const { user } = useAuth();
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

      const response = await fetch(`/api/subscription?userId=${user.id}`);
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
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const cancelSubscription = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/subscription?userId=${user.id}`, {
        method: "DELETE",
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
  };

  const isPremium = !!subscription && subscription.status === "active";
  const isPremiumPlus = isPremium && subscription?.plan_type === "premium_plus";
  const currentPlan: PlanType = isPremiumPlus ? "premium_plus" : isPremium ? "premium" : "free";
  const vetConsultationsRemaining = subscription?.vet_consultations_remaining || 0;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isPremium,
        isPremiumPlus,
        currentPlan,
        isLoading,
        error,
        refreshSubscription: fetchSubscription,
        cancelSubscription,
        vetConsultationsRemaining,
      }}
    >
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
