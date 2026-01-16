import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "../ThemeToggle";

// ThemeContext mock
const mockSetTheme = jest.fn();
let mockTheme = "light";
let mockResolvedTheme = "light";

jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({
    theme: mockTheme,
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme = "light";
    mockResolvedTheme = "light";
  });

  it("렌더링됨", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("aria-label이 있음", () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });

  it("light 모드에서 클릭하면 dark로 변경", () => {
    mockTheme = "light";
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("dark 모드에서 클릭하면 system으로 변경", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("system 모드에서 클릭하면 light로 변경", () => {
    mockTheme = "system";
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("light 테마일 때 올바른 title 표시", () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    expect(screen.getByTitle("Light mode")).toBeInTheDocument();
  });

  it("dark 테마일 때 올바른 title 표시", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    expect(screen.getByTitle("Dark mode")).toBeInTheDocument();
  });

  it("system 테마일 때 올바른 title 표시", () => {
    mockTheme = "system";
    render(<ThemeToggle />);
    expect(screen.getByTitle("System theme")).toBeInTheDocument();
  });
});
