/**
 * useChat Hook Tests
 *
 * Tests for the chat history management hook that:
 * - Loads chat history from localStorage (guest) or Supabase (authenticated)
 * - Handles CRUD operations for chat records
 * - Manages usage count and record selection
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "../useChat";

// Mock Supabase functions
const mockGetChatRecords = jest.fn();
const mockAddChatRecord = jest.fn();
const mockDeleteChatRecord = jest.fn();
const mockGetUsage = jest.fn();

jest.mock("@/lib/supabase", () => ({
  getChatRecords: (...args: unknown[]) => mockGetChatRecords(...args),
  addChatRecord: (...args: unknown[]) => mockAddChatRecord(...args),
  deleteChatRecord: (...args: unknown[]) => mockDeleteChatRecord(...args),
  getUsage: (...args: unknown[]) => mockGetUsage(...args),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Test data
const mockPetProfile = {
  id: "pet-1",
  name: "멍멍이",
  species: "dog" as const,
  breed: "골든 리트리버",
  age: 3,
  weight: 25,
};

const mockMessages = [
  { id: "1", role: "assistant" as const, content: "안녕하세요!" },
  { id: "2", role: "user" as const, content: "강아지가 아파요" },
  { id: "3", role: "assistant" as const, content: "어떤 증상인가요?" },
];

const mockChatRecord = {
  id: "record-1",
  petName: "멍멍이",
  petSpecies: "dog" as const,
  date: "2024-01-01T00:00:00.000Z",
  preview: "강아지가 아파요",
  severity: "medium" as const,
  messages: [
    { role: "user" as const, content: "강아지가 아파요" },
    { role: "assistant" as const, content: "어떤 증상인가요?" },
  ],
};

const mockDbChatRecord = {
  id: "db-record-1",
  user_id: "user-1",
  pet_id: "pet-1",
  pet_name: "멍멍이",
  pet_species: "dog" as const,
  preview: "강아지가 아파요",
  severity: "medium",
  messages: mockChatRecord.messages,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
};

describe("useChat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockGetChatRecords.mockResolvedValue([]);
    mockAddChatRecord.mockResolvedValue(null);
    mockDeleteChatRecord.mockResolvedValue(false);
    mockGetUsage.mockResolvedValue(0);
  });

  describe("initial state", () => {
    it("should start with empty history", async () => {
      const { result } = renderHook(() => useChat({}));

      // After initial load with empty localStorage
      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.chatHistory).toEqual([]);
      expect(result.current.selectedRecord).toBeNull();
      expect(result.current.usageCount).toBe(0);
    });

    it("should wait for auth loading to complete", async () => {
      const { result, rerender } = renderHook(
        ({ authLoading }) => useChat({ authLoading }),
        { initialProps: { authLoading: true } }
      );

      // When authLoading is true, isLoaded should be false
      expect(result.current.isLoaded).toBe(false);

      rerender({ authLoading: false });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });
    });
  });

  describe("guest mode (no userId)", () => {
    it("should load chat history from localStorage", async () => {
      localStorageMock.setItem(
        "petchecky_chat_history",
        JSON.stringify([mockChatRecord])
      );

      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.chatHistory).toHaveLength(1);
      expect(result.current.chatHistory[0].petName).toBe("멍멍이");
    });

    it("should save new chat record to localStorage", async () => {
      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      await act(async () => {
        await result.current.saveChat(mockMessages, mockPetProfile, "medium");
      });

      expect(result.current.chatHistory).toHaveLength(1);
      expect(result.current.chatHistory[0].petName).toBe("멍멍이");
      expect(result.current.chatHistory[0].preview).toBe("강아지가 아파요");
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should not save chat with 1 or fewer messages", async () => {
      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      await act(async () => {
        await result.current.saveChat([mockMessages[0]], mockPetProfile);
      });

      expect(result.current.chatHistory).toHaveLength(0);
    });

    it("should not save chat without pet profile", async () => {
      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      await act(async () => {
        await result.current.saveChat(mockMessages, null);
      });

      expect(result.current.chatHistory).toHaveLength(0);
    });

    it("should delete chat record from localStorage", async () => {
      localStorageMock.setItem(
        "petchecky_chat_history",
        JSON.stringify([mockChatRecord])
      );

      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      await act(async () => {
        await result.current.deleteRecord(mockChatRecord.id);
      });

      expect(result.current.chatHistory).toHaveLength(0);
    });

    it("should limit chat history to MAX_CHAT_RECORDS", async () => {
      // Create more than MAX_CHAT_RECORDS records
      const manyRecords = Array.from({ length: 60 }, (_, i) => ({
        ...mockChatRecord,
        id: `record-${i}`,
      }));
      localStorageMock.setItem(
        "petchecky_chat_history",
        JSON.stringify(manyRecords)
      );

      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      // Add one more record
      await act(async () => {
        await result.current.saveChat(mockMessages, mockPetProfile);
      });

      // Should be limited to MAX_CHAT_RECORDS (50)
      expect(result.current.chatHistory.length).toBeLessThanOrEqual(50);
    });
  });

  describe("authenticated mode (with userId)", () => {
    const userId = "user-1";

    it("should load chat history from Supabase", async () => {
      mockGetChatRecords.mockResolvedValue([mockDbChatRecord]);
      mockGetUsage.mockResolvedValue(5);

      const { result } = renderHook(() => useChat({ userId }));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(mockGetChatRecords).toHaveBeenCalledWith(userId);
      expect(result.current.chatHistory).toHaveLength(1);
      expect(result.current.usageCount).toBe(5);
    });

    it("should save chat record via Supabase", async () => {
      mockGetChatRecords.mockResolvedValue([]);
      mockAddChatRecord.mockResolvedValue(mockDbChatRecord);

      const { result } = renderHook(() => useChat({ userId }));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      await act(async () => {
        await result.current.saveChat(mockMessages, mockPetProfile, "medium");
      });

      expect(mockAddChatRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          pet_id: mockPetProfile.id,
          pet_name: mockPetProfile.name,
          pet_species: mockPetProfile.species,
          severity: "medium",
        })
      );
    });

    it("should delete chat record via Supabase", async () => {
      mockGetChatRecords.mockResolvedValue([mockDbChatRecord]);
      mockDeleteChatRecord.mockResolvedValue(true);

      const { result } = renderHook(() => useChat({ userId }));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      await act(async () => {
        await result.current.deleteRecord(mockDbChatRecord.id);
      });

      expect(mockDeleteChatRecord).toHaveBeenCalledWith(mockDbChatRecord.id);
      expect(result.current.chatHistory).toHaveLength(0);
    });
  });

  describe("selectRecord", () => {
    it("should set selected record", async () => {
      localStorageMock.setItem(
        "petchecky_chat_history",
        JSON.stringify([mockChatRecord])
      );

      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.selectRecord(mockChatRecord);
      });

      expect(result.current.selectedRecord).toEqual(mockChatRecord);
    });

    it("should clear selected record when set to null", async () => {
      localStorageMock.setItem(
        "petchecky_chat_history",
        JSON.stringify([mockChatRecord])
      );

      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.selectRecord(mockChatRecord);
      });

      expect(result.current.selectedRecord).not.toBeNull();

      act(() => {
        result.current.selectRecord(null);
      });

      expect(result.current.selectedRecord).toBeNull();
    });
  });

  describe("refreshUsage", () => {
    it("should update usage count from Supabase", async () => {
      const userId = "user-1";
      mockGetChatRecords.mockResolvedValue([]);
      mockGetUsage.mockResolvedValue(3);

      const { result } = renderHook(() => useChat({ userId }));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.usageCount).toBe(3);

      mockGetUsage.mockResolvedValue(5);

      await act(async () => {
        await result.current.refreshUsage();
      });

      expect(result.current.usageCount).toBe(5);
    });

    it("should do nothing for guest users", async () => {
      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      await act(async () => {
        await result.current.refreshUsage();
      });

      expect(mockGetUsage).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle empty localStorage gracefully", async () => {
      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.chatHistory).toEqual([]);
    });

    it("should handle invalid JSON in localStorage", async () => {
      localStorageMock.setItem("petchecky_chat_history", "invalid-json");

      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.chatHistory).toEqual([]);
    });

    it("should handle Supabase errors gracefully", async () => {
      // Mock getChatRecords to reject with an error
      mockGetChatRecords.mockImplementation(() => Promise.reject(new Error("Network error")));

      // Suppress console errors for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => useChat({ userId: "user-1" }));

      // The hook should not crash
      await waitFor(
        () => {
          expect(result.current.chatHistory).toBeDefined();
        },
        { timeout: 3000 }
      );

      consoleSpy.mockRestore();
    });

    it("should use first user message as preview", async () => {
      const messagesWithMultipleUser = [
        { id: "1", role: "assistant" as const, content: "안녕하세요!" },
        { id: "2", role: "user" as const, content: "첫 번째 질문" },
        { id: "3", role: "assistant" as const, content: "답변입니다" },
        { id: "4", role: "user" as const, content: "두 번째 질문" },
      ];

      const { result } = renderHook(() => useChat({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      await act(async () => {
        await result.current.saveChat(messagesWithMultipleUser, mockPetProfile);
      });

      expect(result.current.chatHistory[0].preview).toBe("첫 번째 질문");
    });
  });
});
