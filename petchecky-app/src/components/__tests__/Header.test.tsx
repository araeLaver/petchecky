import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../Header";

// Mock supabase constants
jest.mock("@/lib/supabase", () => ({
  MONTHLY_FREE_LIMIT: 10,
}));

// Mock contexts
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    signOut: jest.fn(),
    loading: false,
  }),
}));

jest.mock("@/contexts/SubscriptionContext", () => ({
  useSubscription: () => ({
    isPremium: false,
    currentPlan: "free",
    isLoading: false,
  }),
}));

jest.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      common: { appName: "펫체키" },
      pet: { register: "펫 등록", selectPet: "펫 선택", addPet: "새 펫 추가", years: "살" },
      nav: { settings: "설정" },
    },
  }),
}));

// Mock child components
jest.mock("../LanguageSelector", () => {
  const MockLanguageSelector = () => <div data-testid="language-selector">LanguageSelector</div>;
  MockLanguageSelector.displayName = "MockLanguageSelector";
  return MockLanguageSelector;
});

jest.mock("../ThemeToggle", () => {
  const MockThemeToggle = () => <div data-testid="theme-toggle">ThemeToggle</div>;
  MockThemeToggle.displayName = "MockThemeToggle";
  return MockThemeToggle;
});

describe("Header", () => {
  const mockPets = [
    { id: "1", name: "멍멍이", species: "dog" as const, breed: "골든리트리버", age: 3 },
    { id: "2", name: "야옹이", species: "cat" as const, breed: "코숏", age: 2 },
  ];

  const mockOnSelectPet = jest.fn();
  const mockOnEditPet = jest.fn();
  const mockOnAddPet = jest.fn();
  const mockOnLogoClick = jest.fn();
  const mockOnLoginClick = jest.fn();

  const defaultProps = {
    pets: mockPets,
    selectedPet: mockPets[0],
    onSelectPet: mockOnSelectPet,
    onEditPet: mockOnEditPet,
    onAddPet: mockOnAddPet,
    onLogoClick: mockOnLogoClick,
    onLoginClick: mockOnLoginClick,
    usageCount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("앱 이름 렌더링", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("펫체키")).toBeInTheDocument();
  });

  it("로고 클릭시 onLogoClick 호출", () => {
    render(<Header {...defaultProps} />);

    fireEvent.click(screen.getByLabelText("펫체키 홈으로 이동"));
    expect(mockOnLogoClick).toHaveBeenCalled();
  });

  it("선택된 펫 이름 표시", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("멍멍이")).toBeInTheDocument();
  });

  it("펫 드롭다운 토글", () => {
    render(<Header {...defaultProps} />);

    // 드롭다운 열기
    fireEvent.click(screen.getByText("멍멍이"));

    // 다른 펫과 추가 버튼이 보여야 함
    expect(screen.getByText("펫 선택")).toBeInTheDocument();
    expect(screen.getByText("새 펫 추가")).toBeInTheDocument();
  });

  it("펫 선택시 onSelectPet 호출", () => {
    render(<Header {...defaultProps} />);

    // 드롭다운 열기
    fireEvent.click(screen.getByText("멍멍이"));

    // 다른 펫 선택
    fireEvent.click(screen.getByLabelText("야옹이 선택"));

    expect(mockOnSelectPet).toHaveBeenCalledWith("2");
  });

  it("새 펫 추가 클릭시 onAddPet 호출", () => {
    render(<Header {...defaultProps} />);

    // 드롭다운 열기
    fireEvent.click(screen.getByText("멍멍이"));

    // 추가 버튼 클릭
    fireEvent.click(screen.getByLabelText("새 펫 추가하기"));

    expect(mockOnAddPet).toHaveBeenCalled();
  });

  it("펫이 없을 때 등록 버튼 표시", () => {
    render(<Header {...defaultProps} pets={[]} selectedPet={null} />);
    expect(screen.getByText("펫 등록")).toBeInTheDocument();
  });

  it("ThemeToggle 컴포넌트 렌더링", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("LanguageSelector 컴포넌트 렌더링", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByTestId("language-selector")).toBeInTheDocument();
  });

  it("로그인 버튼 표시 (비로그인 상태)", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByLabelText("로그인")).toBeInTheDocument();
  });

  it("로그인 버튼 클릭시 onLoginClick 호출", () => {
    render(<Header {...defaultProps} />);

    fireEvent.click(screen.getByLabelText("로그인"));
    expect(mockOnLoginClick).toHaveBeenCalled();
  });

  it("펫 발바닥 이모지 표시", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("🐾")).toBeInTheDocument();
  });

  it("강아지 아이콘 표시", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("🐕")).toBeInTheDocument();
  });
});
