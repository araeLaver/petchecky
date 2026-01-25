/**
 * useNotifications Hook Tests
 *
 * Tests for the notification management hook
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotifications } from "../useNotifications";

// Mock the notifications library
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
    createdAt: new Date().toISOString(),
    read: true,
  },
];

const mockSettings = {
  push: false,
  email: true,
  inApp: true,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
  types: {
    reminder: true,
    health: true,
    community: true,
    reservation: true,
    system: true,
  },
};

jest.mock("@/lib/notifications", () => ({
  getNotifications: jest.fn(() => mockNotifications),
  getUnreadCount: jest.fn(() => 1),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  getNotificationSettings: jest.fn(() => mockSettings),
  saveNotificationSettings: jest.fn(),
  requestPushPermission: jest.fn().mockResolvedValue("granted"),
  getPushPermission: jest.fn(() => null),
  isPushSupported: jest.fn(() => true),
}));

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationSettings,
  saveNotificationSettings,
  requestPushPermission,
  getPushPermission,
  isPushSupported,
} from "@/lib/notifications";

describe("useNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("초기 알림 목록을 로드함", () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(1);
    expect(getNotifications).toHaveBeenCalled();
    expect(getUnreadCount).toHaveBeenCalled();
  });

  it("설정을 로드함", () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.settings).toEqual(mockSettings);
    expect(getNotificationSettings).toHaveBeenCalled();
  });

  it("알림을 읽음 처리함", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.markRead("1");
    });

    expect(markAsRead).toHaveBeenCalledWith("1");
    expect(getNotifications).toHaveBeenCalled();
  });

  it("모든 알림을 읽음 처리함", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.markAllRead();
    });

    expect(markAllAsRead).toHaveBeenCalled();
    expect(getNotifications).toHaveBeenCalled();
  });

  it("알림을 삭제함", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.remove("1");
    });

    expect(deleteNotification).toHaveBeenCalledWith("1");
    expect(getNotifications).toHaveBeenCalled();
  });

  it("설정을 업데이트함", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.updateSettings({ push: true });
    });

    expect(saveNotificationSettings).toHaveBeenCalledWith({ push: true });
    expect(getNotificationSettings).toHaveBeenCalled();
  });

  it("푸시 알림 권한을 요청함", async () => {
    const { result } = renderHook(() => useNotifications());

    let success = false;
    await act(async () => {
      success = await result.current.requestPush();
    });

    expect(success).toBe(true);
    expect(requestPushPermission).toHaveBeenCalled();
    expect(saveNotificationSettings).toHaveBeenCalledWith({ push: true });
  });

  it("주기적으로 알림을 새로고침함", () => {
    renderHook(() => useNotifications());

    // 초기 호출
    expect(getNotifications).toHaveBeenCalledTimes(1);

    // 1분 후
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(getNotifications).toHaveBeenCalledTimes(2);
  });

  it("푸시가 지원되지 않으면 false 반환", async () => {
    (isPushSupported as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useNotifications());

    let success = true;
    await act(async () => {
      success = await result.current.requestPush();
    });

    expect(success).toBe(false);
    expect(requestPushPermission).not.toHaveBeenCalled();
  });

  it("푸시 권한이 거부되면 false 반환", async () => {
    (isPushSupported as jest.Mock).mockReturnValue(true);
    (requestPushPermission as jest.Mock).mockResolvedValue("denied");

    const { result } = renderHook(() => useNotifications());

    let success = true;
    await act(async () => {
      success = await result.current.requestPush();
    });

    expect(success).toBe(false);
  });

  it("isPushEnabled 상태 확인", () => {
    (isPushSupported as jest.Mock).mockReturnValue(true);
    (getPushPermission as jest.Mock).mockReturnValue("granted");

    const { result } = renderHook(() => useNotifications());

    expect(result.current.isPushEnabled).toBe(true);
  });

  it("refresh 함수가 알림을 새로고침함", () => {
    const { result } = renderHook(() => useNotifications());

    // 초기 호출 후 리셋
    jest.clearAllMocks();

    act(() => {
      result.current.refresh();
    });

    expect(getNotifications).toHaveBeenCalledTimes(1);
    expect(getUnreadCount).toHaveBeenCalledTimes(1);
  });

  it("언마운트시 인터벌 정리", () => {
    const { unmount } = renderHook(() => useNotifications());

    jest.clearAllMocks();
    unmount();

    // 언마운트 후 타이머 진행해도 호출되지 않음
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(getNotifications).not.toHaveBeenCalled();
  });
});
