import { createStore, createResetters } from "./createStore";
import type { ChildProfile } from "@/types/baby";

// ============================================
// Types
// ============================================

export interface ChildState {
  children: ChildProfile[];
  selectedChildId: string | null;
  isLoading: boolean;
  error: string | null;

  selectedChild: ChildProfile | null;

  setChildren: (children: ChildProfile[]) => void;
  addChild: (child: ChildProfile) => void;
  updateChild: (id: string, updates: Partial<ChildProfile>) => void;
  removeChild: (id: string) => void;
  selectChild: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
  children: [] as ChildProfile[],
  selectedChildId: null as string | null,
  isLoading: false,
  error: null as string | null,
};

// ============================================
// Store
// ============================================

export const useChildStore = createStore<ChildState>(
  (set, get) => ({
    ...initialState,

    get selectedChild() {
      const { children, selectedChildId } = get();
      return children.find((child) => child.id === selectedChildId) || null;
    },

    setChildren: (children) =>
      set((state) => {
        state.children = children;
        state.error = null;
      }),

    addChild: (child) =>
      set((state) => {
        state.children.push(child);
      }),

    updateChild: (id, updates) =>
      set((state) => {
        const index = state.children.findIndex((child) => child.id === id);
        if (index !== -1) {
          state.children[index] = { ...state.children[index], ...updates, updatedAt: new Date().toISOString() };
        }
      }),

    removeChild: (id) =>
      set((state) => {
        state.children = state.children.filter((child) => child.id !== id);
        if (state.selectedChildId === id) {
          state.selectedChildId = state.children[0]?.id || null;
        }
      }),

    selectChild: (id) =>
      set((state) => {
        state.selectedChildId = id;
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

    ...createResetters(initialState, set),
  }),
  {
    name: "child",
    persist: true,
    devtools: true,
  }
);

// ============================================
// Selectors
// ============================================

export const childSelectors = {
  children: (state: ChildState) => state.children,
  selectedChild: (state: ChildState) => state.selectedChild,
  isLoading: (state: ChildState) => state.isLoading,
  error: (state: ChildState) => state.error,
  childById: (id: string) => (state: ChildState) => state.children.find((child) => child.id === id),
};
