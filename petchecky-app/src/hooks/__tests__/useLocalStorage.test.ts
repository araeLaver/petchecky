/**
 * useLocalStorage Hook Tests
 *
 * Tests for localStorage utility functions and hooks:
 * - getStorageItem, setStorageItem, removeStorageItem
 * - useLocalStorage hook
 * - useSelectedId hook
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  useLocalStorage,
  useSelectedId,
} from "../useLocalStorage";

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
    get store() {
      return store;
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Suppress console errors during tests
const originalConsoleError = console.error;

describe("useLocalStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe("STORAGE_KEYS", () => {
    it("should have expected keys", () => {
      expect(STORAGE_KEYS.PETS).toBe("petchecky_pets");
      expect(STORAGE_KEYS.SELECTED_PET).toBe("petchecky_selected_pet");
      expect(STORAGE_KEYS.CHAT_HISTORY).toBe("petchecky_chat_history");
    });
  });

  describe("getStorageItem", () => {
    it("should return parsed value from localStorage", () => {
      const testData = { name: "test", value: 123 };
      localStorageMock.setItem(STORAGE_KEYS.PETS, JSON.stringify(testData));

      const result = getStorageItem(STORAGE_KEYS.PETS, {});

      expect(result).toEqual(testData);
    });

    it("should return default value when key does not exist", () => {
      const defaultValue = { default: true };

      const result = getStorageItem(STORAGE_KEYS.PETS, defaultValue);

      expect(result).toEqual(defaultValue);
    });

    it("should return default value on invalid JSON", () => {
      localStorageMock.setItem(STORAGE_KEYS.PETS, "invalid-json");
      const defaultValue = { default: true };

      const result = getStorageItem(STORAGE_KEYS.PETS, defaultValue);

      expect(result).toEqual(defaultValue);
      expect(console.error).toHaveBeenCalled();
    });

    it("should handle array data", () => {
      const testArray = [1, 2, 3, 4, 5];
      localStorageMock.setItem(STORAGE_KEYS.PETS, JSON.stringify(testArray));

      const result = getStorageItem(STORAGE_KEYS.PETS, []);

      expect(result).toEqual(testArray);
    });

    it("should handle nested objects", () => {
      const nestedData = {
        level1: {
          level2: {
            value: "deep",
          },
        },
      };
      localStorageMock.setItem(STORAGE_KEYS.PETS, JSON.stringify(nestedData));

      const result = getStorageItem(STORAGE_KEYS.PETS, {});

      expect(result).toEqual(nestedData);
    });
  });

  describe("setStorageItem", () => {
    it("should save JSON stringified value", () => {
      const testData = { name: "test", value: 123 };

      const result = setStorageItem(STORAGE_KEYS.PETS, testData);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PETS,
        JSON.stringify(testData)
      );
    });

    it("should return true on success", () => {
      const result = setStorageItem(STORAGE_KEYS.PETS, { test: true });

      expect(result).toBe(true);
    });

    it("should return false on error", () => {
      // Temporarily make setItem throw
      const error = new Error("Storage full");
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw error;
      });

      const result = setStorageItem(STORAGE_KEYS.PETS, { test: true });

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it("should handle array data", () => {
      const testArray = [1, 2, 3];

      const result = setStorageItem(STORAGE_KEYS.PETS, testArray);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PETS,
        JSON.stringify(testArray)
      );
    });
  });

  describe("removeStorageItem", () => {
    it("should remove item from localStorage", () => {
      localStorageMock.setItem(STORAGE_KEYS.PETS, "value");

      const result = removeStorageItem(STORAGE_KEYS.PETS);

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.PETS);
    });

    it("should return true on success", () => {
      const result = removeStorageItem(STORAGE_KEYS.PETS);

      expect(result).toBe(true);
    });

    it("should return false on error", () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error("Error");
      });

      const result = removeStorageItem(STORAGE_KEYS.PETS);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("useLocalStorage hook", () => {
    it("should initialize with value from localStorage", async () => {
      const testData = { name: "test" };
      localStorageMock.setItem(STORAGE_KEYS.PETS, JSON.stringify(testData));

      const { result } = renderHook(() =>
        useLocalStorage(STORAGE_KEYS.PETS, {})
      );

      await waitFor(() => {
        expect(result.current[0]).toEqual(testData);
      });
    });

    it("should use initial value when localStorage is empty", async () => {
      const initialValue = { default: true };

      const { result } = renderHook(() =>
        useLocalStorage(STORAGE_KEYS.PETS, initialValue)
      );

      await waitFor(() => {
        expect(result.current[0]).toEqual(initialValue);
      });
    });

    it("should update value and localStorage when setValue is called", async () => {
      const { result } = renderHook(() =>
        useLocalStorage(STORAGE_KEYS.PETS, { count: 0 })
      );

      await waitFor(() => {
        expect(result.current[0]).toEqual({ count: 0 });
      });

      act(() => {
        result.current[1]({ count: 1 });
      });

      expect(result.current[0]).toEqual({ count: 1 });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PETS,
        JSON.stringify({ count: 1 })
      );
    });

    it("should support function updates", async () => {
      const { result } = renderHook(() =>
        useLocalStorage(STORAGE_KEYS.PETS, { count: 0 })
      );

      await waitFor(() => {
        expect(result.current[0]).toEqual({ count: 0 });
      });

      act(() => {
        result.current[1]((prev) => ({ count: prev.count + 1 }));
      });

      expect(result.current[0]).toEqual({ count: 1 });
    });

    it("should remove value when removeValue is called", async () => {
      localStorageMock.setItem(STORAGE_KEYS.PETS, JSON.stringify({ test: true }));
      const initialValue = { default: true };

      const { result } = renderHook(() =>
        useLocalStorage(STORAGE_KEYS.PETS, initialValue)
      );

      await waitFor(() => {
        expect(result.current[0]).toEqual({ test: true });
      });

      act(() => {
        result.current[2](); // removeValue
      });

      expect(result.current[0]).toEqual(initialValue);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.PETS);
    });
  });

  describe("useSelectedId hook", () => {
    it("should initialize with value from localStorage", async () => {
      localStorageMock.setItem(STORAGE_KEYS.SELECTED_PET, "pet-123");

      const { result } = renderHook(() =>
        useSelectedId(STORAGE_KEYS.SELECTED_PET)
      );

      await waitFor(() => {
        expect(result.current[0]).toBe("pet-123");
      });
    });

    it("should initialize with null when localStorage is empty", async () => {
      const { result } = renderHook(() =>
        useSelectedId(STORAGE_KEYS.SELECTED_PET)
      );

      await waitFor(() => {
        expect(result.current[0]).toBeNull();
      });
    });

    it("should update id and localStorage when setSelectedId is called", async () => {
      const { result } = renderHook(() =>
        useSelectedId(STORAGE_KEYS.SELECTED_PET)
      );

      await waitFor(() => {
        expect(result.current[0]).toBeNull();
      });

      act(() => {
        result.current[1]("new-pet-id");
      });

      expect(result.current[0]).toBe("new-pet-id");
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SELECTED_PET,
        "new-pet-id"
      );
    });

    it("should remove from localStorage when set to null", async () => {
      localStorageMock.setItem(STORAGE_KEYS.SELECTED_PET, "pet-123");

      const { result } = renderHook(() =>
        useSelectedId(STORAGE_KEYS.SELECTED_PET)
      );

      await waitFor(() => {
        expect(result.current[0]).toBe("pet-123");
      });

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SELECTED_PET
      );
    });

    it("should handle localStorage errors gracefully", async () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error("Error");
      });

      const { result } = renderHook(() =>
        useSelectedId(STORAGE_KEYS.SELECTED_PET)
      );

      await waitFor(() => {
        expect(result.current[0]).toBeNull();
      });

      // Should not crash when setting value
      act(() => {
        result.current[1]("test-id");
      });

      expect(console.error).toHaveBeenCalled();
    });
  });
});
