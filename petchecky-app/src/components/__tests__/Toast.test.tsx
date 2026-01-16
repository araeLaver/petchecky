import { render, screen, fireEvent, act } from "@testing-library/react";
import ToastContainer from "../Toast";

// ToastContext mock
const mockRemoveToast = jest.fn();
let mockToasts: Array<{ id: string; type: "success" | "error" | "info" | "warning"; message: string }> = [];

jest.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({
    toasts: mockToasts,
    removeToast: mockRemoveToast,
  }),
}));

describe("ToastContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToasts = [];
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("토스트가 없으면 렌더링하지 않음", () => {
    mockToasts = [];
    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it("success 토스트 렌더링", () => {
    mockToasts = [{ id: "1", type: "success", message: "저장되었습니다" }];
    render(<ToastContainer />);

    expect(screen.getByText("저장되었습니다")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("error 토스트 렌더링", () => {
    mockToasts = [{ id: "2", type: "error", message: "오류가 발생했습니다" }];
    render(<ToastContainer />);

    expect(screen.getByText("오류가 발생했습니다")).toBeInTheDocument();
  });

  it("info 토스트 렌더링", () => {
    mockToasts = [{ id: "3", type: "info", message: "정보입니다" }];
    render(<ToastContainer />);

    expect(screen.getByText("정보입니다")).toBeInTheDocument();
  });

  it("warning 토스트 렌더링", () => {
    mockToasts = [{ id: "4", type: "warning", message: "주의하세요" }];
    render(<ToastContainer />);

    expect(screen.getByText("주의하세요")).toBeInTheDocument();
  });

  it("여러 토스트 동시 렌더링", () => {
    mockToasts = [
      { id: "1", type: "success", message: "성공!" },
      { id: "2", type: "error", message: "실패!" },
    ];
    render(<ToastContainer />);

    expect(screen.getByText("성공!")).toBeInTheDocument();
    expect(screen.getByText("실패!")).toBeInTheDocument();
  });

  it("닫기 버튼 클릭시 removeToast 호출", () => {
    mockToasts = [{ id: "1", type: "success", message: "테스트" }];
    render(<ToastContainer />);

    const closeButton = screen.getByLabelText("토스트 닫기");
    fireEvent.click(closeButton);

    // 애니메이션 대기
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockRemoveToast).toHaveBeenCalledWith("1");
  });

  it("aria-label 접근성", () => {
    mockToasts = [{ id: "1", type: "success", message: "테스트" }];
    render(<ToastContainer />);

    expect(screen.getByLabelText("알림 메시지")).toBeInTheDocument();
  });
});
