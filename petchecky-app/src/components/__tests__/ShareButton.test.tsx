import { render, screen, fireEvent } from "@testing-library/react";
import ShareButton from "../ShareButton";

// LanguageContext mock
jest.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      share: {
        button: "공유하기",
        viewMore: "자세히 보기",
        copied: "복사됨!",
        copyLink: "링크 복사",
      },
    },
  }),
}));

// window.open mock
const mockWindowOpen = jest.fn();
Object.defineProperty(window, "open", {
  value: mockWindowOpen,
  writable: true,
});

describe("ShareButton", () => {
  const defaultProps = {
    title: "테스트 제목",
    text: "테스트 내용",
    url: "https://example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // navigator.share가 없는 환경 시뮬레이션
    Object.defineProperty(navigator, "share", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("공유 버튼 렌더링", () => {
    render(<ShareButton {...defaultProps} />);
    expect(screen.getByText("공유하기")).toBeInTheDocument();
  });

  it("버튼 클릭시 메뉴 표시 (navigator.share 미지원)", () => {
    render(<ShareButton {...defaultProps} />);

    fireEvent.click(screen.getByText("공유하기"));

    expect(screen.getByText("KakaoTalk")).toBeInTheDocument();
    expect(screen.getByText("X (Twitter)")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("LINE")).toBeInTheDocument();
    expect(screen.getByText("링크 복사")).toBeInTheDocument();
  });

  it("Twitter 공유 클릭시 새 창 열림", () => {
    render(<ShareButton {...defaultProps} />);

    fireEvent.click(screen.getByText("공유하기"));
    fireEvent.click(screen.getByText("X (Twitter)"));

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining("twitter.com/intent/tweet"),
      "_blank"
    );
  });

  it("Facebook 공유 클릭시 새 창 열림", () => {
    render(<ShareButton {...defaultProps} />);

    fireEvent.click(screen.getByText("공유하기"));
    fireEvent.click(screen.getByText("Facebook"));

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining("facebook.com/sharer"),
      "_blank"
    );
  });

  it("LINE 공유 클릭시 새 창 열림", () => {
    render(<ShareButton {...defaultProps} />);

    fireEvent.click(screen.getByText("공유하기"));
    fireEvent.click(screen.getByText("LINE"));

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining("line.me"),
      "_blank"
    );
  });

  it("커스텀 className 적용", () => {
    render(<ShareButton {...defaultProps} className="custom-class" />);
    const button = screen.getByText("공유하기").closest("button");
    expect(button).toHaveClass("custom-class");
  });

  it("메뉴 외부 클릭시 메뉴 닫힘", () => {
    render(<ShareButton {...defaultProps} />);

    // 메뉴 열기
    fireEvent.click(screen.getByText("공유하기"));
    expect(screen.getByText("KakaoTalk")).toBeInTheDocument();

    // 백드롭 클릭
    const backdrop = document.querySelector(".fixed.inset-0");
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    // 메뉴 닫힘 확인
    expect(screen.queryByText("KakaoTalk")).not.toBeInTheDocument();
  });
});
