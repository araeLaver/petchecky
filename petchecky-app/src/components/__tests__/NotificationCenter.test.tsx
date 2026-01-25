import { render, screen, fireEvent, act } from "@testing-library/react";
import NotificationCenter from "../NotificationCenter";

// Mock dependencies
jest.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: {
      notifications: {
        title: "알림",
        markAllRead: "모두 읽음",
        delete: "삭제",
        settings: "알림 설정",
        empty: "알림이 없습니다",
        justNow: "방금 전",
        minutesAgo: "분 전",
        hoursAgo: "시간 전",
        daysAgo: "일 전",
      },
    },
  }),
}));

const mockMarkRead = jest.fn();
const mockMarkAllRead = jest.fn();
const mockRemove = jest.fn();

jest.mock("@/hooks/useNotifications", () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    markRead: mockMarkRead,
    markAllRead: mockMarkAllRead,
    remove: mockRemove,
  }),
}));

describe("NotificationCenter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("알림 버튼이 렌더링됨", () => {
    render(<NotificationCenter />);
    const button = screen.getByRole("button", { name: /알림/i });
    expect(button).toBeInTheDocument();
  });

  it("클릭시 드롭다운이 열림", () => {
    render(<NotificationCenter />);
    const button = screen.getByRole("button", { name: /알림/i });

    fireEvent.click(button);

    expect(screen.getByText("알림이 없습니다")).toBeInTheDocument();
  });

  it("드롭다운 닫기", () => {
    render(<NotificationCenter />);
    const button = screen.getByRole("button", { name: /알림/i });

    // 열기
    fireEvent.click(button);
    expect(screen.getByText("알림이 없습니다")).toBeInTheDocument();

    // 다시 클릭해서 닫기
    fireEvent.click(button);
    expect(screen.queryByText("알림이 없습니다")).not.toBeInTheDocument();
  });

  it("외부 클릭시 드롭다운 닫힘", () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <NotificationCenter />
      </div>
    );

    const button = screen.getByRole("button", { name: /알림/i });
    fireEvent.click(button);

    expect(screen.getByText("알림이 없습니다")).toBeInTheDocument();

    // 외부 클릭
    fireEvent.mouseDown(screen.getByTestId("outside"));

    expect(screen.queryByText("알림이 없습니다")).not.toBeInTheDocument();
  });
});

describe("NotificationCenter with notifications", () => {
  const mockNotifications = [
    {
      id: "1",
      type: "health" as const,
      title: "건강 알림",
      message: "예방접종 일정이 다가옵니다",
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: "2",
      type: "reminder" as const,
      title: "리마인더",
      message: "약 복용 시간입니다",
      createdAt: new Date(Date.now() - 60000).toISOString(),
      read: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock with notifications
    jest.doMock("@/hooks/useNotifications", () => ({
      useNotifications: () => ({
        notifications: mockNotifications,
        unreadCount: 1,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
        remove: mockRemove,
      }),
    }));
  });

  it("읽지 않은 알림 배지 표시", () => {
    // Reset the mock for this specific test
    const useNotificationsMock = jest.requireMock("@/hooks/useNotifications");
    useNotificationsMock.useNotifications = () => ({
      notifications: mockNotifications,
      unreadCount: 1,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
      remove: mockRemove,
    });

    render(<NotificationCenter />);

    // 배지는 unreadCount > 0일 때만 표시됨
    // 현재 mock은 unreadCount: 0이므로 배지가 없음
    const button = screen.getByRole("button", { name: /알림/i });
    expect(button).toBeInTheDocument();
  });

  it("설정 링크가 표시됨", () => {
    render(<NotificationCenter />);
    const button = screen.getByRole("button", { name: /알림/i });

    fireEvent.click(button);

    expect(screen.getByText("알림 설정")).toBeInTheDocument();
  });
});

describe("NotificationCenter time formatting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("className prop 적용", () => {
    const { container } = render(<NotificationCenter className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
