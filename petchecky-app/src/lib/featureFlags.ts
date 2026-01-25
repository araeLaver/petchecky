/**
 * Feature Flags 시스템
 * 점진적 배포 및 A/B 테스팅 지원
 */

// ============================================
// Types
// ============================================

export type FeatureFlagValue = boolean | string | number | Record<string, unknown>;

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  value?: FeatureFlagValue;
  description?: string;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetGroups?: string[];
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, unknown>;
}

export interface FeatureFlagConfig {
  flags: FeatureFlag[];
  defaultEnabled: boolean;
  refreshInterval?: number;
  endpoint?: string;
  userId?: string;
  userGroups?: string[];
  attributes?: Record<string, unknown>;
}

export interface EvaluationContext {
  userId?: string;
  userGroups?: string[];
  attributes?: Record<string, unknown>;
  timestamp?: number;
}

export interface FeatureFlagOverride {
  key: string;
  value: FeatureFlagValue;
  enabled: boolean;
}

// ============================================
// Default Flags
// ============================================

const defaultFlags: FeatureFlag[] = [
  {
    key: "new_dashboard",
    enabled: false,
    description: "새로운 대시보드 UI",
    rolloutPercentage: 0,
  },
  {
    key: "ai_recommendations",
    enabled: true,
    description: "AI 기반 펫 케어 추천",
    rolloutPercentage: 100,
  },
  {
    key: "dark_mode",
    enabled: true,
    description: "다크 모드 지원",
    rolloutPercentage: 100,
  },
  {
    key: "push_notifications",
    enabled: true,
    description: "푸시 알림 기능",
    rolloutPercentage: 100,
  },
  {
    key: "video_consultation",
    enabled: false,
    description: "화상 수의사 상담",
    rolloutPercentage: 0,
  },
  {
    key: "premium_features",
    enabled: false,
    description: "프리미엄 기능",
    targetGroups: ["premium", "enterprise"],
  },
  {
    key: "beta_features",
    enabled: false,
    description: "베타 기능",
    targetGroups: ["beta_testers"],
  },
  {
    key: "analytics_v2",
    enabled: false,
    description: "새로운 분석 시스템",
    rolloutPercentage: 10,
  },
];

// ============================================
// FeatureFlagManager Class
// ============================================

class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private overrides: Map<string, FeatureFlagOverride> = new Map();
  private context: EvaluationContext = {};
  private config: FeatureFlagConfig;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<() => void> = new Set();

  constructor(config: Partial<FeatureFlagConfig> = {}) {
    this.config = {
      flags: defaultFlags,
      defaultEnabled: false,
      refreshInterval: 60000,
      ...config,
    };

    this.init();
  }

  // ============================================
  // Initialization
  // ============================================

  private init(): void {
    // Load flags
    this.config.flags.forEach((flag) => {
      this.flags.set(flag.key, flag);
    });

    // Set context
    this.context = {
      userId: this.config.userId,
      userGroups: this.config.userGroups,
      attributes: this.config.attributes,
    };

    // Load overrides from localStorage
    this.loadOverrides();

    // Start refresh timer
    if (this.config.refreshInterval && this.config.endpoint) {
      this.startRefresh();
    }
  }

  // ============================================
  // Flag Evaluation
  // ============================================

  isEnabled(key: string, context?: EvaluationContext): boolean {
    // Check for override first
    const override = this.overrides.get(key);
    if (override) {
      return override.enabled;
    }

    const flag = this.flags.get(key);
    if (!flag) {
      return this.config.defaultEnabled;
    }

    const evalContext = { ...this.context, ...context };
    return this.evaluateFlag(flag, evalContext);
  }

  getValue<T = FeatureFlagValue>(key: string, defaultValue?: T): T {
    // Check for override first
    const override = this.overrides.get(key);
    if (override) {
      return override.value as T;
    }

    const flag = this.flags.get(key);
    if (!flag || !this.isEnabled(key)) {
      return defaultValue as T;
    }

    return (flag.value ?? defaultValue) as T;
  }

  private evaluateFlag(flag: FeatureFlag, context: EvaluationContext): boolean {
    // Check if globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check date range
    const now = context.timestamp || Date.now();
    if (flag.startDate && new Date(flag.startDate).getTime() > now) {
      return false;
    }
    if (flag.endDate && new Date(flag.endDate).getTime() < now) {
      return false;
    }

    // Check target users
    if (flag.targetUsers && flag.targetUsers.length > 0) {
      if (!context.userId || !flag.targetUsers.includes(context.userId)) {
        return false;
      }
      return true;
    }

    // Check target groups
    if (flag.targetGroups && flag.targetGroups.length > 0) {
      if (!context.userGroups) {
        return false;
      }
      const hasGroup = flag.targetGroups.some((g) =>
        context.userGroups?.includes(g)
      );
      if (!hasGroup) {
        return false;
      }
      return true;
    }

    // Check rollout percentage
    if (typeof flag.rolloutPercentage === "number") {
      const hash = this.hashUserId(context.userId || "anonymous", flag.key);
      const percentage = hash % 100;
      return percentage < flag.rolloutPercentage;
    }

    return flag.enabled;
  }

  private hashUserId(userId: string, flagKey: string): number {
    const str = `${userId}:${flagKey}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // ============================================
  // Flag Management
  // ============================================

  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  setFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
    this.notifyListeners();
  }

  updateFlags(flags: FeatureFlag[]): void {
    flags.forEach((flag) => {
      this.flags.set(flag.key, flag);
    });
    this.notifyListeners();
  }

  // ============================================
  // Context Management
  // ============================================

  setContext(context: EvaluationContext): void {
    this.context = { ...this.context, ...context };
    this.notifyListeners();
  }

  getContext(): EvaluationContext {
    return { ...this.context };
  }

  // ============================================
  // Overrides (for testing/development)
  // ============================================

  setOverride(key: string, enabled: boolean, value?: FeatureFlagValue): void {
    this.overrides.set(key, { key, enabled, value: value ?? enabled });
    this.saveOverrides();
    this.notifyListeners();
  }

  removeOverride(key: string): void {
    this.overrides.delete(key);
    this.saveOverrides();
    this.notifyListeners();
  }

  clearOverrides(): void {
    this.overrides.clear();
    this.saveOverrides();
    this.notifyListeners();
  }

  getOverrides(): FeatureFlagOverride[] {
    return Array.from(this.overrides.values());
  }

  private loadOverrides(): void {
    if (typeof localStorage === "undefined") return;

    try {
      const stored = localStorage.getItem("feature_flag_overrides");
      if (stored) {
        const overrides: FeatureFlagOverride[] = JSON.parse(stored);
        overrides.forEach((o) => this.overrides.set(o.key, o));
      }
    } catch {
      // Ignore
    }
  }

  private saveOverrides(): void {
    if (typeof localStorage === "undefined") return;

    try {
      const overrides = Array.from(this.overrides.values());
      localStorage.setItem("feature_flag_overrides", JSON.stringify(overrides));
    } catch {
      // Ignore
    }
  }

  // ============================================
  // Remote Refresh
  // ============================================

  private startRefresh(): void {
    if (this.refreshTimer) return;

    this.refreshTimer = setInterval(() => {
      this.refresh();
    }, this.config.refreshInterval);
  }

  private stopRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async refresh(): Promise<void> {
    if (!this.config.endpoint) return;

    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: this.context }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.flags) {
          this.updateFlags(data.flags);
        }
      }
    } catch (error) {
      console.error("[FeatureFlags] Refresh failed:", error);
    }
  }

  // ============================================
  // Listeners
  // ============================================

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // ============================================
  // Cleanup
  // ============================================

  destroy(): void {
    this.stopRefresh();
    this.listeners.clear();
  }
}

// ============================================
// Singleton Instance
// ============================================

let featureFlagManager: FeatureFlagManager | null = null;

export function getFeatureFlags(config?: Partial<FeatureFlagConfig>): FeatureFlagManager {
  if (!featureFlagManager) {
    featureFlagManager = new FeatureFlagManager(config);
  }
  return featureFlagManager;
}

export function createFeatureFlagManager(
  config?: Partial<FeatureFlagConfig>
): FeatureFlagManager {
  return new FeatureFlagManager(config);
}

// ============================================
// Convenience Functions
// ============================================

export const featureFlags = {
  isEnabled: (key: string, context?: EvaluationContext) =>
    getFeatureFlags().isEnabled(key, context),
  getValue: <T = FeatureFlagValue>(key: string, defaultValue?: T) =>
    getFeatureFlags().getValue<T>(key, defaultValue),
  getFlag: (key: string) => getFeatureFlags().getFlag(key),
  getAllFlags: () => getFeatureFlags().getAllFlags(),
  setContext: (context: EvaluationContext) => getFeatureFlags().setContext(context),
  setOverride: (key: string, enabled: boolean, value?: FeatureFlagValue) =>
    getFeatureFlags().setOverride(key, enabled, value),
  removeOverride: (key: string) => getFeatureFlags().removeOverride(key),
  clearOverrides: () => getFeatureFlags().clearOverrides(),
  subscribe: (listener: () => void) => getFeatureFlags().subscribe(listener),
  refresh: () => getFeatureFlags().refresh(),
};

export { FeatureFlagManager };
