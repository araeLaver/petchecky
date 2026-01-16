import { render, screen } from "@testing-library/react";
import SkipNavigation from "../SkipNavigation";

// LanguageContext mock
jest.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      accessibility: {
        skipToMain: "본문으로 건너뛰기",
      },
    },
  }),
}));

describe("SkipNavigation", () => {
  it("렌더링됨", () => {
    render(<SkipNavigation />);
    expect(screen.getByText("본문으로 건너뛰기")).toBeInTheDocument();
  });

  it("main-content로 연결되는 링크", () => {
    render(<SkipNavigation />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("접근성 포커스 클래스 포함", () => {
    render(<SkipNavigation />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("focus:translate-y-0");
  });

  it("기본적으로 화면 밖에 위치", () => {
    render(<SkipNavigation />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("-translate-y-full");
  });
});
