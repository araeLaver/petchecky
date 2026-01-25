import React, { ReactElement, ReactNode } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ============================================
// Test Query Client
// ============================================

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// ============================================
// All Providers Wrapper
// ============================================

interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

function AllProviders({ children, queryClient }: AllProvidersProps) {
  const client = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

// ============================================
// Custom Render
// ============================================

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

/**
 * 모든 Provider를 포함한 커스텀 렌더
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const { queryClient, ...renderOptions } = options;

  const user = userEvent.setup();

  const result = render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient}>{children}</AllProviders>
    ),
    ...renderOptions,
  });

  return { ...result, user };
}

// ============================================
// Re-export everything
// ============================================

export * from "@testing-library/react";
export { userEvent };

// ============================================
// Wait Utilities
// ============================================

/**
 * 지정된 시간 동안 대기
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 조건이 충족될 때까지 대기
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await wait(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

// ============================================
// Mock Utilities
// ============================================

/**
 * console.error 모킹 (테스트 중 에러 로그 숨기기)
 */
export function mockConsoleError(): jest.SpyInstance {
  return jest.spyOn(console, "error").mockImplementation(() => {});
}

/**
 * console.warn 모킹
 */
export function mockConsoleWarn(): jest.SpyInstance {
  return jest.spyOn(console, "warn").mockImplementation(() => {});
}

/**
 * window.matchMedia 모킹
 */
export function mockMatchMedia(matches: boolean = false): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * IntersectionObserver 모킹
 */
export function mockIntersectionObserver(): void {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
}

/**
 * ResizeObserver 모킹
 */
export function mockResizeObserver(): void {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
}

/**
 * localStorage 모킹
 */
export function mockLocalStorage(): {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
} {
  const store: Record<string, string> = {};
  const mockStorage = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };

  Object.defineProperty(window, "localStorage", {
    value: mockStorage,
    writable: true,
  });

  return mockStorage;
}

/**
 * fetch 모킹
 */
export function mockFetch(response: unknown, options?: { ok?: boolean; status?: number }): jest.Mock {
  const { ok = true, status = 200 } = options || {};

  const mockFn = jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });

  global.fetch = mockFn;

  return mockFn;
}

// ============================================
// Assertion Helpers
// ============================================

/**
 * 요소가 포커스를 가지고 있는지 확인
 */
export function expectToHaveFocus(element: HTMLElement): void {
  expect(document.activeElement).toBe(element);
}

/**
 * 요소가 보이는지 확인
 */
export function expectToBeVisible(element: HTMLElement): void {
  expect(element).toBeVisible();
}

/**
 * 요소가 비활성화되어 있는지 확인
 */
export function expectToBeDisabled(element: HTMLElement): void {
  expect(element).toBeDisabled();
}
