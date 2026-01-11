import { render, screen, fireEvent } from "@testing-library/react";
import LanguageSelector from "../LanguageSelector";

// Mock the useLanguage hook
const mockSetLanguage = jest.fn();
jest.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "ko",
    setLanguage: mockSetLanguage,
    languageFlag: "🇰🇷",
  }),
}));

// Mock the locales
jest.mock("@/locales", () => ({
  languageNames: {
    ko: "한국어",
    en: "English",
    ja: "日本語",
  },
  languageFlags: {
    ko: "🇰🇷",
    en: "🇺🇸",
    ja: "🇯🇵",
  },
}));

describe("LanguageSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("dropdown variant (default)", () => {
    it("should render dropdown button with current language flag", () => {
      render(<LanguageSelector />);

      const button = screen.getByRole("button", { name: /언어 선택/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText("🇰🇷")).toBeInTheDocument();
    });

    it("should not show dropdown options initially", () => {
      render(<LanguageSelector />);

      expect(screen.queryByText("한국어")).not.toBeInTheDocument();
      expect(screen.queryByText("English")).not.toBeInTheDocument();
      expect(screen.queryByText("日本語")).not.toBeInTheDocument();
    });

    it("should show dropdown options when button is clicked", () => {
      render(<LanguageSelector />);

      const button = screen.getByRole("button", { name: /언어 선택/i });
      fireEvent.click(button);

      expect(screen.getByText("한국어")).toBeInTheDocument();
      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("日本語")).toBeInTheDocument();
    });

    it("should call setLanguage when a language option is selected", () => {
      render(<LanguageSelector />);

      const toggleButton = screen.getByRole("button", { name: /언어 선택/i });
      fireEvent.click(toggleButton);

      const englishOption = screen.getByText("English");
      fireEvent.click(englishOption);

      expect(mockSetLanguage).toHaveBeenCalledWith("en");
    });

    it("should close dropdown after selecting a language", () => {
      render(<LanguageSelector />);

      const toggleButton = screen.getByRole("button", { name: /언어 선택/i });
      fireEvent.click(toggleButton);

      expect(screen.getByText("English")).toBeInTheDocument();

      fireEvent.click(screen.getByText("English"));

      // Wait for dropdown to close (state update)
      expect(screen.queryByText("English")).not.toBeInTheDocument();
    });
  });

  describe("buttons variant", () => {
    it("should render all language buttons", () => {
      render(<LanguageSelector variant="buttons" />);

      expect(screen.getByText(/한국어/)).toBeInTheDocument();
      expect(screen.getByText(/English/)).toBeInTheDocument();
      expect(screen.getByText(/日本語/)).toBeInTheDocument();
    });

    it("should render language flags with names", () => {
      render(<LanguageSelector variant="buttons" />);

      expect(screen.getByText(/🇰🇷/)).toBeInTheDocument();
      expect(screen.getByText(/🇺🇸/)).toBeInTheDocument();
      expect(screen.getByText(/🇯🇵/)).toBeInTheDocument();
    });

    it("should call setLanguage when a language button is clicked", () => {
      render(<LanguageSelector variant="buttons" />);

      // Find button containing Japanese flag and name
      const japaneseButton = screen.getByText(/日本語/).closest("button");
      fireEvent.click(japaneseButton!);

      expect(mockSetLanguage).toHaveBeenCalledWith("ja");
    });
  });

  describe("custom className", () => {
    it("should apply custom className to dropdown variant", () => {
      const { container } = render(<LanguageSelector className="custom-class" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("should apply custom className to buttons variant", () => {
      const { container } = render(<LanguageSelector variant="buttons" className="custom-class" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });
  });
});
