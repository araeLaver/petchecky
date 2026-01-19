"use client";

import { useState, useEffect, useCallback } from "react";

// LocalStorage 키 상수
export const STORAGE_KEYS = {
  PETS: "petchecky_pets",
  SELECTED_PET: "petchecky_selected_pet",
  CHAT_HISTORY: "petchecky_chat_history",
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * LocalStorage에서 데이터를 안전하게 읽기
 */
export function getStorageItem<T>(key: StorageKey, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed as T;
    }
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
  }
  return defaultValue;
}

/**
 * LocalStorage에 데이터를 안전하게 저장
 */
export function setStorageItem<T>(key: StorageKey, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
    return false;
  }
}

/**
 * LocalStorage에서 데이터 삭제
 */
export function removeStorageItem(key: StorageKey): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`Failed to remove ${key}:`, e);
    return false;
  }
}

/**
 * LocalStorage 상태 관리 훅
 */
export function useLocalStorage<T>(
  key: StorageKey,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 로드
  useEffect(() => {
    const value = getStorageItem(key, initialValue);
    setStoredValue(value);
    setIsInitialized(true);
  }, [key, initialValue]);

  // 값 설정
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        setStorageItem(key, newValue);
        return newValue;
      });
    },
    [key]
  );

  // 값 제거
  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    removeStorageItem(key);
  }, [key, initialValue]);

  return [isInitialized ? storedValue : initialValue, setValue, removeValue];
}

/**
 * 선택 ID를 위한 간단한 LocalStorage 헬퍼
 */
export function useSelectedId(key: StorageKey): [string | null, (id: string | null) => void] {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(key);
      setId(saved);
    } catch {
      // ignore
    }
  }, [key]);

  const setSelectedId = useCallback(
    (newId: string | null) => {
      setId(newId);
      try {
        if (newId) {
          localStorage.setItem(key, newId);
        } else {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error(`Failed to save selected id:`, e);
      }
    },
    [key]
  );

  return [id, setSelectedId];
}
