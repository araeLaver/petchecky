"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeJsonParse } from "@/lib/safeJson";

export default function OfflineIndicator() {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Check for pending sync items
    const checkPendingSync = () => {
      const pendingItems = localStorage.getItem("petchecky_pending_sync");
      const items = safeJsonParse<unknown[]>(pendingItems, []);
      setPendingSync(items.length);
    };

    checkPendingSync();

    // Event listeners
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Try to sync pending items
      syncPendingItems();
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check pending sync periodically
    const interval = setInterval(checkPendingSync, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const syncPendingItems = async () => {
    const pendingItems = localStorage.getItem("petchecky_pending_sync");
    if (!pendingItems) return;

    const items = safeJsonParse<unknown[]>(pendingItems, []);
    if (items.length === 0) return;

    // In a real app, this would sync to a backend
    // For now, just clear the pending items
    localStorage.removeItem("petchecky_pending_sync");
    setPendingSync(0);
  };

  if (!showBanner && isOnline && pendingSync === 0) {
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
      {pendingSync > 0 && isOnline && (
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={syncPendingItems}
            className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm text-white shadow-lg"
          >
            <span className="animate-spin">↻</span>
            {t.offline.pendingSync.replace("{count}", String(pendingSync))}
          </button>
        </div>
      )}
    </>
  );
}

// Utility function to add items to pending sync queue
export function addToPendingSync(type: string, data: Record<string, unknown>) {
  const pendingItems = localStorage.getItem("petchecky_pending_sync");
  const items = safeJsonParse<unknown[]>(pendingItems, []);

  items.push({
    id: Date.now().toString(),
    type,
    data,
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem("petchecky_pending_sync", JSON.stringify(items));
}

// Hook for checking online status
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
