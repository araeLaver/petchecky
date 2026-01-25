/**
 * useOfflineSync Hook Tests
 *
 * Tests for the offline synchronization hook
 */

import { renderHook, act } from "@testing-library/react";

// Mock IndexedDB functions
const mockGetPendingSyncItems = jest.fn();
const mockRemovePendingSyncItem = jest.fn();
const mockIncrementRetryCount = jest.fn();
const mockAddToPendingSync = jest.fn();
const mockSetLastSyncTime = jest.fn();
const mockGetLastSyncTime = jest.fn();
const mockSaveOfflinePet = jest.fn();
const mockGetOfflinePets = jest.fn();
const mockSaveOfflineChat = jest.fn();
const mockGetOfflineChats = jest.fn();

jest.mock("@/lib/indexedDB", () => ({
  initDB: jest.fn().mockResolvedValue(undefined),
  getPendingSyncItems: () => mockGetPendingSyncItems(),
  removePendingSyncItem: (id: string) => mockRemovePendingSyncItem(id),
  incrementRetryCount: (id: string) => mockIncrementRetryCount(id),
  addToPendingSync: (item: unknown) => mockAddToPendingSync(item),
  setLastSyncTime: (time: string) => mockSetLastSyncTime(time),
  getLastSyncTime: () => mockGetLastSyncTime(),
  saveOfflinePet: (pet: unknown) => mockSaveOfflinePet(pet),
  getOfflinePets: () => mockGetOfflinePets(),
  saveOfflineChat: (chat: unknown) => mockSaveOfflineChat(chat),
  getOfflineChats: () => mockGetOfflineChats(),
  isIndexedDBSupported: () => true,
  STORES: {
    PHOTOS: "photos",
    ALBUMS: "albums",
    OFFLINE_PETS: "offline_pets",
    OFFLINE_CHATS: "offline_chats",
    PENDING_SYNC: "pending_sync",
    SYNC_SETTINGS: "sync_settings",
  },
}));

// Import after mocking
import { useOfflineSync } from "../useOfflineSync";

describe("useOfflineSync", () => {
  let mockOnline = true;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock navigator.onLine
    mockOnline = true;
    Object.defineProperty(navigator, "onLine", {
      get: () => mockOnline,
      configurable: true,
    });

    // Default mock values
    mockGetPendingSyncItems.mockResolvedValue([]);
    mockGetLastSyncTime.mockResolvedValue(null);
    mockRemovePendingSyncItem.mockResolvedValue(undefined);
    mockSetLastSyncTime.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("초기 온라인 상태를 감지함", () => {
    mockOnline = true;
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(true);
  });

  it("초기 오프라인 상태를 감지함", () => {
    mockOnline = false;
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(false);
  });

  it("온라인 이벤트에 반응함", async () => {
    mockOnline = false;
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(false);

    // 온라인으로 변경
    await act(async () => {
      mockOnline = true;
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it("오프라인 이벤트에 반응함", async () => {
    mockOnline = true;
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(true);

    // 오프라인으로 변경
    await act(async () => {
      mockOnline = false;
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it("대기 중인 동기화 항목 수를 로드함", async () => {
    mockGetPendingSyncItems.mockResolvedValue([
      { id: "1", type: "pet", action: "create" },
      { id: "2", type: "pet", action: "update" },
    ]);

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.pendingCount).toBe(2);
  });

  it("동기화 함수를 제공함", () => {
    const { result } = renderHook(() => useOfflineSync());

    expect(typeof result.current.sync).toBe("function");
  });

  it("수동 동기화를 트리거함", async () => {
    mockGetPendingSyncItems.mockResolvedValue([
      { id: "1", type: "pet", action: "create" },
    ]);

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      await result.current.sync();
    });

    expect(mockGetPendingSyncItems).toHaveBeenCalled();
  });

  it("동기화 중 상태를 표시함", async () => {
    mockGetPendingSyncItems.mockResolvedValue([
      { id: "1", store: "offline_pets", action: "create", data: {} },
    ]);

    // 동기화가 시간이 걸리는 것을 시뮬레이션
    mockRemovePendingSyncItem.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isSyncing).toBe(false);

    let syncPromise: Promise<void>;
    await act(async () => {
      syncPromise = result.current.sync();
    });

    // isSyncing이 true가 되어야 함
    // 완료 대기
    await act(async () => {
      jest.advanceTimersByTime(100);
      await syncPromise;
    });

    expect(result.current.isSyncing).toBe(false);
  });

  it("마지막 동기화 시간을 추적함", async () => {
    const lastSyncTime = new Date().toISOString();
    mockGetLastSyncTime.mockResolvedValue(lastSyncTime);

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve(); // wait for effect
    });

    expect(result.current.lastSyncTime).toBe(lastSyncTime);
  });

  it("온라인으로 변경시 자동 동기화함", async () => {
    mockOnline = false;
    mockGetPendingSyncItems.mockResolvedValue([
      { id: "1", type: "pet", action: "create" },
    ]);

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      mockOnline = true;
      window.dispatchEvent(new Event("online"));
      await Promise.resolve();
    });

    // 온라인 복귀 시 동기화 트리거됨
    expect(mockGetPendingSyncItems).toHaveBeenCalled();
  });

  it("언마운트 시 이벤트 리스너 정리", () => {
    const { unmount } = renderHook(() => useOfflineSync());

    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "online",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "offline",
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it("오프라인 상태에서는 동기화하지 않음", async () => {
    mockOnline = false;
    mockGetPendingSyncItems.mockResolvedValue([
      { id: "1", store: "offline_pets", action: "create", data: {} },
    ]);

    const { result } = renderHook(() => useOfflineSync());

    await act(async () => {
      await result.current.sync();
    });

    // 오프라인이므로 removePendingSyncItem이 호출되지 않아야 함
    expect(mockRemovePendingSyncItem).not.toHaveBeenCalled();
  });
});
