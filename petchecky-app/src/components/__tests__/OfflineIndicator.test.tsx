import { render, screen, act } from "@testing-library/react";
import OfflineIndicator, { useOnlineStatus, addToPendingSync } from "../OfflineIndicator";

// LanguageContext mock
jest.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      offline: {
        backOnline: "다시 온라인입니다",
        youAreOffline: "오프라인 상태입니다",
        offline: "오프라인",
        pendingSync: "{count}개 동기화 대기",
      },
    },
  }),
}));

// safeJson mock
jest.mock("@/lib/safeJson", () => ({
  safeJsonParse: <T,>(json: string | null, fallback: T): T => {
    if (!json) return fallback;
    try {
      return JSON.parse(json) as T;
    } catch {
      return fallback;
    }
  },
}));

describe("OfflineIndicator", () => {
  let mockOnline = true;

  beforeEach(() => {
    mockOnline = true;
    Object.defineProperty(navigator, "onLine", {
      get: () => mockOnline,
      configurable: true,
    });
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("온라인 상태에서는 아무것도 렌더링하지 않음", () => {
    mockOnline = true;
    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it("오프라인 이벤트 발생시 배너 표시", () => {
    render(<OfflineIndicator />);

    act(() => {
      mockOnline = false;
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByText("오프라인 상태입니다")).toBeInTheDocument();
  });

  it("온라인 복귀시 복귀 메시지 표시", () => {
    mockOnline = false;
    render(<OfflineIndicator />);

    act(() => {
      mockOnline = true;
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.getByText("다시 온라인입니다")).toBeInTheDocument();
  });
});

describe("useOnlineStatus hook", () => {
  // Hook 테스트는 TestComponent를 통해 간접 테스트
  it("export됨", () => {
    expect(useOnlineStatus).toBeDefined();
    expect(typeof useOnlineStatus).toBe("function");
  });
});

describe("addToPendingSync", () => {
  it("함수가 export됨", () => {
    expect(addToPendingSync).toBeDefined();
    expect(typeof addToPendingSync).toBe("function");
  });
});
