import { createStore } from "./createStore";

// ============================================
// Types
// ============================================

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  title?: string;
  content: React.ReactNode;
  onClose?: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export interface ConfirmDialog {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface UIState {
  // Toast State
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modal State
  modals: Modal[];
  openModal: (modal: Omit<Modal, "id">) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Confirm Dialog State
  confirmDialog: ConfirmDialog | null;
  confirm: (dialog: ConfirmDialog) => void;
  closeConfirm: () => void;

  // Loading State
  globalLoading: boolean;
  loadingMessage: string | null;
  setGlobalLoading: (loading: boolean, message?: string) => void;

  // Sidebar State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Mobile Menu State
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

// ============================================
// Utilities
// ============================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// Store
// ============================================

export const useUIStore = createStore<UIState>(
  (set, get) => ({
    // ============================================
    // Toast State & Actions
    // ============================================
    toasts: [],

    addToast: (toast) => {
      const id = generateId();
      set((state) => {
        state.toasts.push({ ...toast, id });
      });

      // 자동 제거 (기본 5초)
      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      }

      return id;
    },

    removeToast: (id) =>
      set((state) => {
        state.toasts = state.toasts.filter((t) => t.id !== id);
      }),

    clearToasts: () =>
      set((state) => {
        state.toasts = [];
      }),

    // ============================================
    // Modal State & Actions
    // ============================================
    modals: [],

    openModal: (modal) => {
      const id = generateId();
      set((state) => {
        state.modals.push({ ...modal, id });
      });
      return id;
    },

    closeModal: (id) =>
      set((state) => {
        const modal = state.modals.find((m) => m.id === id);
        modal?.onClose?.();
        state.modals = state.modals.filter((m) => m.id !== id);
      }),

    closeAllModals: () =>
      set((state) => {
        state.modals.forEach((m) => m.onClose?.());
        state.modals = [];
      }),

    // ============================================
    // Confirm Dialog State & Actions
    // ============================================
    confirmDialog: null,

    confirm: (dialog) =>
      set((state) => {
        state.confirmDialog = dialog;
      }),

    closeConfirm: () =>
      set((state) => {
        state.confirmDialog = null;
      }),

    // ============================================
    // Loading State & Actions
    // ============================================
    globalLoading: false,
    loadingMessage: null,

    setGlobalLoading: (loading, message) =>
      set((state) => {
        state.globalLoading = loading;
        state.loadingMessage = loading ? (message || null) : null;
      }),

    // ============================================
    // Sidebar State & Actions
    // ============================================
    sidebarOpen: true,

    toggleSidebar: () =>
      set((state) => {
        state.sidebarOpen = !state.sidebarOpen;
      }),

    setSidebarOpen: (open) =>
      set((state) => {
        state.sidebarOpen = open;
      }),

    // ============================================
    // Mobile Menu State & Actions
    // ============================================
    mobileMenuOpen: false,

    toggleMobileMenu: () =>
      set((state) => {
        state.mobileMenuOpen = !state.mobileMenuOpen;
      }),

    setMobileMenuOpen: (open) =>
      set((state) => {
        state.mobileMenuOpen = open;
      }),
  }),
  {
    name: "ui",
    persist: false, // UI 상태는 영속화하지 않음
    devtools: true,
  }
);

// ============================================
// Toast Helpers
// ============================================

export const toast = {
  success: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "success", title, message }),

  error: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "error", title, message }),

  warning: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "warning", title, message }),

  info: (title: string, message?: string) =>
    useUIStore.getState().addToast({ type: "info", title, message }),

  custom: (toast: Omit<Toast, "id">) => useUIStore.getState().addToast(toast),

  dismiss: (id: string) => useUIStore.getState().removeToast(id),

  clear: () => useUIStore.getState().clearToasts(),
};

// ============================================
// Selectors
// ============================================

export const uiSelectors = {
  toasts: (state: UIState) => state.toasts,
  modals: (state: UIState) => state.modals,
  confirmDialog: (state: UIState) => state.confirmDialog,
  globalLoading: (state: UIState) => state.globalLoading,
  loadingMessage: (state: UIState) => state.loadingMessage,
  sidebarOpen: (state: UIState) => state.sidebarOpen,
  mobileMenuOpen: (state: UIState) => state.mobileMenuOpen,
};
