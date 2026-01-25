"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  featureFlags,
  getFeatureFlags,
  type FeatureFlag,
  type FeatureFlagValue,
  type FeatureFlagConfig,
  type EvaluationContext,
} from "@/lib/featureFlags";

// ============================================
// useFeatureFlag Hook
// ============================================

interface UseFeatureFlagReturn<T = boolean> {
  enabled: boolean;
  value: T;
  flag: FeatureFlag | undefined;
}

export function useFeatureFlag<T = boolean>(
  key: string,
  defaultValue?: T
): UseFeatureFlagReturn<T> {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = featureFlags.subscribe(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const enabled = featureFlags.isEnabled(key);
  const value = featureFlags.getValue<T>(key, defaultValue ?? (enabled as unknown as T));
  const flag = featureFlags.getFlag(key);

  return { enabled, value, flag };
}

// ============================================
// useFeatureEnabled Hook
// ============================================

/**
 * 특정 기능이 활성화되어 있는지 확인하는 훅
 */
export function useFeatureEnabled(key: string): boolean {
  const { enabled } = useFeatureFlag(key);
  return enabled;
}

// ============================================
// useFeatureValue Hook
// ============================================

/**
 * 기능 플래그 값을 가져오는 훅
 */
export function useFeatureValue<T = FeatureFlagValue>(
  key: string,
  defaultValue?: T
): T {
  const { value } = useFeatureFlag<T>(key, defaultValue);
  return value;
}

// ============================================
// useFeatureVariant Hook
// ============================================

/**
 * A/B 테스트용 변형 훅
 */
export function useFeatureVariant<T extends string = string>(
  key: string,
  variants: readonly T[],
  defaultVariant: T
): T {
  const { value } = useFeatureFlag<T>(key);

  if (variants.includes(value)) {
    return value;
  }

  return defaultVariant;
}

// ============================================
// useAllFeatureFlags Hook
// ============================================

/**
 * 모든 기능 플래그를 가져오는 훅
 */
export function useAllFeatureFlags(): FeatureFlag[] {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    setFlags(featureFlags.getAllFlags());

    const unsubscribe = featureFlags.subscribe(() => {
      setFlags(featureFlags.getAllFlags());
    });

    return unsubscribe;
  }, []);

  return flags;
}

// ============================================
// useFeatureFlagOverrides Hook
// ============================================

interface UseFeatureFlagOverridesReturn {
  setOverride: (key: string, enabled: boolean, value?: FeatureFlagValue) => void;
  removeOverride: (key: string) => void;
  clearOverrides: () => void;
  hasOverride: (key: string) => boolean;
}

/**
 * 기능 플래그 오버라이드 관리 훅 (개발/테스트용)
 */
export function useFeatureFlagOverrides(): UseFeatureFlagOverridesReturn {
  const [overrideKeys, setOverrideKeys] = useState<Set<string>>(new Set());

  const setOverride = useCallback(
    (key: string, enabled: boolean, value?: FeatureFlagValue) => {
      featureFlags.setOverride(key, enabled, value);
      setOverrideKeys((prev) => new Set(prev).add(key));
    },
    []
  );

  const removeOverride = useCallback((key: string) => {
    featureFlags.removeOverride(key);
    setOverrideKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const clearOverrides = useCallback(() => {
    featureFlags.clearOverrides();
    setOverrideKeys(new Set());
  }, []);

  const hasOverride = useCallback(
    (key: string) => overrideKeys.has(key),
    [overrideKeys]
  );

  return { setOverride, removeOverride, clearOverrides, hasOverride };
}

// ============================================
// useFeatureFlagContext Hook
// ============================================

interface UseFeatureFlagContextReturn {
  isEnabled: (key: string) => boolean;
  getValue: <T = FeatureFlagValue>(key: string, defaultValue?: T) => T;
  getFlag: (key: string) => FeatureFlag | undefined;
  getAllFlags: () => FeatureFlag[];
  setContext: (context: EvaluationContext) => void;
  refresh: () => Promise<void>;
}

/**
 * Feature Flag 컨텍스트 훅
 */
export function useFeatureFlagContext(
  config?: Partial<FeatureFlagConfig>
): UseFeatureFlagContextReturn {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (config) {
      getFeatureFlags(config);
    }

    const unsubscribe = featureFlags.subscribe(() => {
      forceUpdate({});
    });

    return unsubscribe;
  }, [config]);

  return useMemo(
    () => ({
      isEnabled: (key: string) => featureFlags.isEnabled(key),
      getValue: <T = FeatureFlagValue>(key: string, defaultValue?: T) =>
        featureFlags.getValue<T>(key, defaultValue),
      getFlag: (key: string) => featureFlags.getFlag(key),
      getAllFlags: () => featureFlags.getAllFlags(),
      setContext: (context: EvaluationContext) => featureFlags.setContext(context),
      refresh: () => featureFlags.refresh(),
    }),
    []
  );
}

// ============================================
// FeatureFlag Component (as function)
// ============================================

interface FeatureFlagProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 선언적 기능 플래그 래퍼 함수
 */
export function renderIfEnabled(
  flag: string,
  content: React.ReactNode,
  fallback: React.ReactNode = null
): React.ReactNode {
  const enabled = featureFlags.isEnabled(flag);
  return enabled ? content : fallback;
}
