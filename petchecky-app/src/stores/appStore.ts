import { createStore, createResetters } from "./createStore";

// ============================================
// Types
// ============================================

export interface AppState {
  // App Status
  isInitialized: boolean;
  isOnline: boolean;
  version: string;

  // Feature Flags
  features: Record<string, boolean>;

  // Cache & Sync
  lastSyncAt: string | null;
  isSyncing: boolean;

  // Actions
  initialize: () => void;
  setOnlineStatus: (online: boolean) => void;
  setFeatureFlag: (feature: string, enabled: boolean) => void;
  isFeatureEnabled: (feature: string) => boolean;
  startSync: () => void;
  finishSync: () => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
  isInitialized: false,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  features: {} as Record<string, boolean>,
  lastSyncAt: null as string | null,
  isSyncing: false,
};

// ============================================
// Store
// ============================================

export const useAppStore = createStore<AppState>(
  (set, get) => ({
    // Initial state
    ...initialState,

    // Actions
    initialize: () =>
      set((state) => {
        state.isInitialized = true;
      }),

    setOnlineStatus: (online) =>
      set((state) => {
        state.isOnline = online;
      }),

    setFeatureFlag: (feature, enabled) =>
      set((state) => {
        state.features[feature] = enabled;
      }),

    isFeatureEnabled: (feature) => {
      return get().features[feature] ?? false;
    },

    startSync: () =>
      set((state) => {
        state.isSyncing = true;
      }),

    finishSync: () =>
      set((state) => {
        state.isSyncing = false;
        state.lastSyncAt = new Date().toISOString();
      }),

    ...createResetters(initialState, set),
  }),
  {
    name: "app",
    persist: true,
    devtools: true,
  }
);

// ============================================
// Online Status Hook
// ============================================

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    useAppStore.getState().setOnlineStatus(true);
  });

  window.addEventListener("offline", () => {
    useAppStore.getState().setOnlineStatus(false);
  });
}

// ============================================
// Selectors
// ============================================

export const appSelectors = {
  isInitialized: (state: AppState) => state.isInitialized,
  isOnline: (state: AppState) => state.isOnline,
  version: (state: AppState) => state.version,
  features: (state: AppState) => state.features,
  lastSyncAt: (state: AppState) => state.lastSyncAt,
  isSyncing: (state: AppState) => state.isSyncing,
};
