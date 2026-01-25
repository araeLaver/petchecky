import { create, StateCreator, StoreApi as ZustandStoreApi } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

// ============================================
// Types
// ============================================

export type StoreApi<T> = ZustandStoreApi<T>;

type Middleware<T> = (
  config: StateCreator<T, [], []>
) => StateCreator<T, [], []>;

interface CreateStoreOptions<T> {
  name: string;
  persist?: boolean;
  devtools?: boolean;
}

// ============================================
// Store Factory
// ============================================

/**
 * 표준화된 스토어 생성 함수
 *
 * @example
 * ```tsx
 * interface CounterState {
 *   count: number;
 *   increment: () => void;
 * }
 *
 * const useCounterStore = createStore<CounterState>(
 *   (set) => ({
 *     count: 0,
 *     increment: () => set((state) => { state.count += 1 }),
 *   }),
 *   { name: "counter", persist: true }
 * );
 * ```
 */
export function createStore<T extends object>(
  initializer: StateCreator<T, [["zustand/immer", never]], []>,
  options: CreateStoreOptions<T>
) {
  const { name, persist: enablePersist = false, devtools: enableDevtools = true } = options;

  // 미들웨어 체인 구성
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let storeCreator: any = initializer;

  // Immer 미들웨어 (불변성 관리)
  storeCreator = immer(storeCreator);

  // SubscribeWithSelector 미들웨어 (선택적 구독)
  storeCreator = subscribeWithSelector(storeCreator);

  // Persist 미들웨어 (로컬 스토리지 저장)
  if (enablePersist) {
    storeCreator = persist(storeCreator, {
      name: `petchecky-${name}`,
      partialize: (state: T) => {
        // 함수는 저장하지 않음
        const persistedState: Partial<T> = {};
        for (const key in state) {
          if (typeof state[key] !== "function") {
            persistedState[key] = state[key];
          }
        }
        return persistedState;
      },
    });
  }

  // Devtools 미들웨어 (개발 도구)
  if (enableDevtools && process.env.NODE_ENV === "development") {
    storeCreator = devtools(storeCreator, { name });
  }

  return create<T>()(storeCreator);
}

// ============================================
// Selector Hook
// ============================================

/**
 * 얕은 비교를 사용하는 선택적 스토어 훅
 *
 * @example
 * ```tsx
 * const { count, increment } = useStoreWithSelector(
 *   useCounterStore,
 *   (state) => ({ count: state.count, increment: state.increment })
 * );
 * ```
 */
export function useStoreWithSelector<T, U>(
  store: (selector: (state: T) => U) => U,
  selector: (state: T) => U
): U {
  return store(useShallow(selector));
}

// ============================================
// Store Utilities
// ============================================

/**
 * 비동기 액션 래퍼
 */
export function createAsyncAction<T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  options?: {
    onStart?: () => void;
    onSuccess?: (result: R) => void;
    onError?: (error: Error) => void;
    onFinally?: () => void;
  }
) {
  return async (...args: T): Promise<R> => {
    try {
      options?.onStart?.();
      const result = await action(...args);
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      options?.onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      options?.onFinally?.();
    }
  };
}

/**
 * 스토어 리셋 유틸리티
 */
export function createResetters<T extends object>(
  initialState: Partial<T>,
  set: (fn: (state: T) => void) => void
) {
  return {
    reset: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),
    resetField: <K extends keyof T>(field: K) =>
      set((state) => {
        if (field in initialState) {
          state[field] = initialState[field] as T[K];
        }
      }),
  };
}
