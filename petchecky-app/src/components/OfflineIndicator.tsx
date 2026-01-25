"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  initDB,
  getPendingSyncItems,
  isIndexedDBSupported,
} from "@/lib/indexedDB";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function OfflineIndicator() {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);

  const {
    isOnline,
    isSyncing,
    pendingCount,
    sync,
  } = useOfflineSync({
    autoSync: true,
    syncInterval: 30000, // 30초마다 동기화
  });

  const syncPendingItems = useCallback(async () => {
    if (isSyncing) return;
    await sync();
  }, [isSyncing, sync]);

  useEffect(() => {
    // 온라인/오프라인 상태 변경 시 배너 표시
    const handleOnline = () => {
      setShowBanner(true);
      syncPendingItems();
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncPendingItems]);

  if (!showBanner && isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <>
      {/* Offline/Online Banner */}
      {showBanner && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium transition-all ${
            isOnline
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {isOnline ? t.offline.backOnline : t.offline.youAreOffline}
          {!isOnline && (
            <button
              onClick={() => setShowBanner(false)}
              className="ml-4 text-white/80 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Persistent Offline Indicator (when offline and banner dismissed) */}
      {!isOnline && !showBanner && (
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={() => setShowBanner(true)}
            className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm text-white shadow-lg"
          >
            <span className="animate-pulse">⚫</span>
            {t.offline.offline}
          </button>
        </div>
      )}

      {/* Pending Sync Indicator */}
      {pendingCount > 0 && isOnline && (
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={syncPendingItems}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm text-white shadow-lg disabled:opacity-50"
          >
            <span className={isSyncing ? "animate-spin" : ""}>↻</span>
            {isSyncing
              ? t.offline.syncing || "동기화 중..."
              : t.offline.pendingSync.replace("{count}", String(pendingCount))}
          </button>
        </div>
      )}
    </>
  );
}

// Hook for checking online status (레거시 지원)
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// IndexedDB 기반 오프라인 저장 함수로 내보내기 (레거시 호환)
export { addToPendingSync as addToOfflineQueue } from "@/lib/indexedDB";
