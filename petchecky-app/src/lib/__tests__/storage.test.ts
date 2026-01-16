import {
  getStorageUsage,
  getStorageUsageMB,
  getStorageUsagePercent,
  isStorageLow,
  getKeySize,
  getStorageBreakdown,
  cleanupChatHistory,
  cleanupPendingSync,
  cleanupCache,
  autoCleanup,
  safeSetItem,
  getStorageStatus,
} from "../storage";

// Custom localStorage mock that works with Object.keys
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Override Object.keys for localStorage
const originalKeys = Object.keys;
Object.keys = (obj: object) => {
  if (obj === localStorage) {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }
  return originalKeys(obj);
};

describe("Storage Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getStorageUsage", () => {
    it("빈 localStorage에서 0 반환", () => {
      expect(getStorageUsage()).toBe(0);
    });

    it("저장된 데이터의 크기 계산", () => {
      localStorage.setItem("test", "hello");
      const expected = ("test".length + "hello".length) * 2;
      expect(getStorageUsage()).toBe(expected);
    });

    it("여러 키의 총 크기 계산", () => {
      localStorage.setItem("key1", "value1");
      localStorage.setItem("key2", "value2");
      const expected = (("key1".length + "value1".length) + ("key2".length + "value2".length)) * 2;
      expect(getStorageUsage()).toBe(expected);
    });
  });

  describe("getStorageUsageMB", () => {
    it("MB 단위로 변환", () => {
      localStorage.setItem("test", "a".repeat(1024));
      const usage = getStorageUsageMB();
      expect(usage).toBeGreaterThan(0);
    });
  });

  describe("getKeySize", () => {
    it("특정 키의 크기 계산", () => {
      localStorage.setItem("mykey", "myvalue");
      const expected = ("mykey".length + "myvalue".length) * 2;
      expect(getKeySize("mykey")).toBe(expected);
    });

    it("존재하지 않는 키는 0 반환", () => {
      expect(getKeySize("nonexistent")).toBe(0);
    });
  });

  describe("getStorageBreakdown", () => {
    it("크기순으로 정렬된 배열 반환", () => {
      localStorage.setItem("small", "a");
      localStorage.setItem("large", "a".repeat(100));
      localStorage.setItem("medium", "a".repeat(50));

      const breakdown = getStorageBreakdown();
      expect(breakdown.length).toBe(3);
      expect(breakdown[0].key).toBe("large");
      expect(breakdown[1].key).toBe("medium");
      expect(breakdown[2].key).toBe("small");
    });

    it("빈 localStorage에서 빈 배열 반환", () => {
      expect(getStorageBreakdown()).toEqual([]);
    });
  });

  describe("cleanupChatHistory", () => {
    it("채팅 기록이 없으면 0 반환", () => {
      expect(cleanupChatHistory()).toBe(0);
    });

    it("keepCount보다 적으면 정리하지 않음", () => {
      const history = Array(10).fill({ message: "test" });
      localStorage.setItem("chatHistory", JSON.stringify(history));

      const freed = cleanupChatHistory(50);
      expect(freed).toBe(0);
    });

    it("keepCount 초과시 오래된 기록 삭제", () => {
      const history = Array(100).fill({ message: "test message content" });
      localStorage.setItem("chatHistory", JSON.stringify(history));

      const freed = cleanupChatHistory(10);
      expect(freed).toBeGreaterThan(0);

      const remaining = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      expect(remaining.length).toBe(10);
    });
  });

  describe("cleanupPendingSync", () => {
    it("동기화 데이터가 없으면 0 반환", () => {
      expect(cleanupPendingSync()).toBe(0);
    });

    it("오래된 항목만 삭제", () => {
      const oldTimestamp = Date.now() - 48 * 60 * 60 * 1000; // 48시간 전
      const newTimestamp = Date.now() - 1 * 60 * 60 * 1000; // 1시간 전

      const data = [
        { timestamp: oldTimestamp, data: "old" },
        { timestamp: newTimestamp, data: "new" },
      ];
      localStorage.setItem("pendingSync", JSON.stringify(data));

      const freed = cleanupPendingSync();
      expect(freed).toBeGreaterThan(0);

      const remaining = JSON.parse(localStorage.getItem("pendingSync") || "[]");
      expect(remaining.length).toBe(1);
      expect(remaining[0].data).toBe("new");
    });
  });

  describe("cleanupCache", () => {
    it("캐시 키들 삭제", () => {
      localStorage.setItem("imageCache", "data");
      localStorage.setItem("apiCache", "data");
      localStorage.setItem("searchCache", "data");

      const freed = cleanupCache();
      expect(freed).toBeGreaterThan(0);
      expect(localStorage.getItem("imageCache")).toBeNull();
      expect(localStorage.getItem("apiCache")).toBeNull();
      expect(localStorage.getItem("searchCache")).toBeNull();
    });

    it("캐시가 없으면 0 반환", () => {
      expect(cleanupCache()).toBe(0);
    });
  });

  describe("autoCleanup", () => {
    it("용량이 충분하면 정리하지 않음", () => {
      localStorage.setItem("small", "data");
      const result = autoCleanup();
      expect(result.success).toBe(true);
      expect(result.message).toBe("정리가 필요하지 않습니다");
    });
  });

  describe("safeSetItem", () => {
    it("정상적으로 저장", () => {
      const result = safeSetItem("key", "value");
      expect(result).toBe(true);
      expect(localStorage.getItem("key")).toBe("value");
    });
  });

  describe("getStorageStatus", () => {
    it("저장 공간 상태 반환", () => {
      localStorage.setItem("test", "data");
      const status = getStorageStatus();

      expect(status).toHaveProperty("usedMB");
      expect(status).toHaveProperty("limitMB");
      expect(status).toHaveProperty("percent");
      expect(status).toHaveProperty("isLow");
      expect(status).toHaveProperty("breakdown");
      expect(status.limitMB).toBe(5);
    });
  });

  describe("isStorageLow", () => {
    it("용량이 충분하면 false", () => {
      localStorage.setItem("small", "data");
      expect(isStorageLow()).toBe(false);
    });
  });

  describe("getStorageUsagePercent", () => {
    it("사용률 계산", () => {
      localStorage.setItem("test", "data");
      const percent = getStorageUsagePercent();
      expect(percent).toBeGreaterThanOrEqual(0);
      expect(percent).toBeLessThanOrEqual(1);
    });
  });
});
