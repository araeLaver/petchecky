import { createStore, createResetters } from "./createStore";

// ============================================
// Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  phone?: string;
  createdAt: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "ko" | "en";
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
}

export interface UserState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  preferences: UserPreferences;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setNotificationPreference: (key: keyof UserPreferences["notifications"], value: boolean) => void;
  logout: () => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialPreferences: UserPreferences = {
  theme: "system",
  language: "ko",
  notifications: {
    email: true,
    push: true,
    reminders: true,
  },
};

const initialState = {
  user: null as User | null,
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  preferences: initialPreferences,
};

// ============================================
// Store
// ============================================

export const useUserStore = createStore<UserState>(
  (set) => ({
    // Initial state
    ...initialState,

    // Actions
    setUser: (user) =>
      set((state) => {
        state.user = user;
        state.isAuthenticated = user !== null;
        state.error = null;
      }),

    updateUser: (updates) =>
      set((state) => {
        if (state.user) {
          Object.assign(state.user, updates);
        }
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
        state.isLoading = false;
      }),

    setPreferences: (preferences) =>
      set((state) => {
        Object.assign(state.preferences, preferences);
      }),

    setNotificationPreference: (key, value) =>
      set((state) => {
        state.preferences.notifications[key] = value;
      }),

    logout: () =>
      set((state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      }),

    ...createResetters(initialState, set),
  }),
  {
    name: "user",
    persist: true,
    devtools: true,
  }
);

// ============================================
// Selectors
// ============================================

export const userSelectors = {
  user: (state: UserState) => state.user,
  isAuthenticated: (state: UserState) => state.isAuthenticated,
  isLoading: (state: UserState) => state.isLoading,
  error: (state: UserState) => state.error,
  preferences: (state: UserState) => state.preferences,
  theme: (state: UserState) => state.preferences.theme,
  language: (state: UserState) => state.preferences.language,
  notifications: (state: UserState) => state.preferences.notifications,
};
