"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  initDB,
  getPendingSyncItems,
  removePendingSyncItem,
  incrementRetryCount,
  addToPendingSync,
  setLastSyncTime,
  getLastSyncTime,
  saveOfflinePet,
  getOfflinePets,
  saveOfflineChat,
  getOfflineChats,
  isIndexedDBSupported,
  STORES,
  type PendingSyncItem,
  type StoreName,
} from "@/lib/indexedDB";

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  error: string | null;
}

interface UseOfflineSyncOptions {
  userId?: string;
  autoSync?: boolean;
  syncInterval?: number; // ms
  maxRetries?: number;
}

const MAX_RETRIES = 3;
const SYNC_INTERVAL = 30000; // 30초

export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const {
    userId,
    autoSync = true,
    syncInterval = SYNC_INTERVAL,
    maxRetries = MAX_RETRIES,
  } = options;

  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    error: null,
  });

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSupported = isIndexedDBSupported();

  // 온라인 상태 감지
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateOnlineStatus = () => {
      setStatus((prev) => ({ ...prev, isOnline: navigator.onLine }));
    };

    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // 대기중인 동기화 항목 수 확인
  const checkPendingItems = useCallback(async () => {
    if (!isSupported) return;

    try {
      await initDB();
      const items = await getPendingSyncItems();
      setStatus((prev) => ({ ...prev, pendingCount: items.length }));
    } catch (error) {
      console.error("Failed to check pending items:", error);
    }
  }, [isSupported]);

  // 마지막 동기화 시간 확인
  const checkLastSyncTime = useCallback(async () => {
    if (!isSupported) return;

    try {
      const lastSync = await getLastSyncTime("global");
      setStatus((prev) => ({ ...prev, lastSyncTime: lastSync }));
    } catch (error) {
      console.error("Failed to check last sync time:", error);
    }
  }, [isSupported]);

  // 단일 항목 동기화 처리
  const processSyncItem = async (item: PendingSyncItem): Promise<boolean> => {
    try {
      // 여기서 실제 API 호출을 수행
      // 각 store 타입에 따라 다른 API 호출
      switch (item.store) {
        case STORES.OFFLINE_PETS:
          // TODO: 실제 API 호출 구현
          // await syncPetToServer(item.type, item.data);
          console.log("Syncing pet:", item.type, item.data);
          break;

        case STORES.OFFLINE_CHATS:
          // TODO: 실제 API 호출 구현
          // await syncChatToServer(item.type, item.data);
          console.log("Syncing chat:", item.type, item.data);
          break;

        default:
          console.warn("Unknown store type:", item.store);
      }

      return true;
    } catch (error) {
      console.error("Sync item failed:", error);
      return false;
    }
  };

  // 전체 동기화 수행
  const sync = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !status.isOnline) {
      return false;
    }

    setStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      await initDB();
      const pendingItems = await getPendingSyncItems();

      for (const item of pendingItems) {
        // 최대 재시도 횟수 초과 시 제거
        if (item.retryCount >= maxRetries) {
          console.warn("Max retries exceeded, removing item:", item.id);
          await removePendingSyncItem(item.id);
          continue;
        }

        const success = await processSyncItem(item);

        if (success) {
          await removePendingSyncItem(item.id);
        } else {
          await incrementRetryCount(item.id);
        }
      }

      await setLastSyncTime("global");
      await checkPendingItems();
      await checkLastSyncTime();

      setStatus((prev) => ({ ...prev, isSyncing: false }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "동기화 실패";
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [isSupported, status.isOnline, maxRetries, checkPendingItems, checkLastSyncTime]);

  // 오프라인 작업 추가
  const addOfflineAction = useCallback(
    async (
      type: PendingSyncItem["type"],
      store: StoreName,
      data: Record<string, unknown>
    ) => {
      if (!isSupported) {
        console.warn("IndexedDB not supported");
        return;
      }

      try {
        await initDB();
        await addToPendingSync(type, store, data);
        await checkPendingItems();
      } catch (error) {
        console.error("Failed to add offline action:", error);
      }
    },
    [isSupported, checkPendingItems]
  );

  // 펫 데이터 오프라인 저장
  const savePetOffline = useCallback(
    async (pet: Parameters<typeof saveOfflinePet>[0]) => {
      if (!isSupported) return;

      try {
        await initDB();
        await saveOfflinePet(pet, status.isOnline);

        if (!status.isOnline) {
          await addOfflineAction("create", STORES.OFFLINE_PETS, pet as Record<string, unknown>);
        }
      } catch (error) {
        console.error("Failed to save pet offline:", error);
      }
    },
    [isSupported, status.isOnline, addOfflineAction]
  );

  // 채팅 기록 오프라인 저장
  const saveChatOffline = useCallback(
    async (chat: Parameters<typeof saveOfflineChat>[0]) => {
      if (!isSupported) return;

      try {
        await initDB();
        await saveOfflineChat(chat, status.isOnline);

        if (!status.isOnline) {
          await addOfflineAction("create", STORES.OFFLINE_CHATS, chat as Record<string, unknown>);
        }
      } catch (error) {
        console.error("Failed to save chat offline:", error);
      }
    },
    [isSupported, status.isOnline, addOfflineAction]
  );

  // 오프라인 펫 데이터 조회
  const getOfflinePetsData = useCallback(async () => {
    if (!isSupported || !userId) return [];

    try {
      await initDB();
      return await getOfflinePets(userId);
    } catch (error) {
      console.error("Failed to get offline pets:", error);
      return [];
    }
  }, [isSupported, userId]);

  // 오프라인 채팅 기록 조회
  const getOfflineChatsData = useCallback(async () => {
    if (!isSupported || !userId) return [];

    try {
      await initDB();
      return await getOfflineChats(userId);
    } catch (error) {
      console.error("Failed to get offline chats:", error);
      return [];
    }
  }, [isSupported, userId]);

  // 초기화 및 자동 동기화 설정
  useEffect(() => {
    if (!isSupported) return;

    const init = async () => {
      await initDB();
      await checkPendingItems();
      await checkLastSyncTime();
    };

    init();

    // 온라인 복귀 시 자동 동기화
    const handleOnline = () => {
      if (autoSync) {
        sync();
      }
    };

    window.addEventListener("online", handleOnline);

    // 주기적 동기화
    if (autoSync && syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        if (navigator.onLine) {
          sync();
        }
      }, syncInterval);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isSupported, autoSync, syncInterval, checkPendingItems, checkLastSyncTime, sync]);

  return {
    // 상태
    ...status,
    isSupported,

    // 액션
    sync,
    addOfflineAction,
    savePetOffline,
    saveChatOffline,
    getOfflinePetsData,
    getOfflineChatsData,
    checkPendingItems,
  };
}

export type { SyncStatus, UseOfflineSyncOptions };
