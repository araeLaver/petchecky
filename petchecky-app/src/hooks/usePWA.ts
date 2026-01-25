"use client";

import { useState, useEffect, useCallback } from "react";

// ============================================
// Types
// ============================================

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

interface UsePWAReturn extends PWAStatus {
  promptInstall: () => Promise<boolean>;
  updateServiceWorker: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
}

// ============================================
// usePWA Hook
// ============================================

/**
 * PWA 상태 및 기능 관리 훅
 *
 * @example
 * ```tsx
 * const {
 *   isInstalled,
 *   isInstallable,
 *   promptInstall,
 *   isUpdateAvailable,
 *   updateServiceWorker,
 * } = usePWA();
 *
 * if (isInstallable && !isInstalled) {
 *   return <Button onClick={promptInstall}>앱 설치</Button>;
 * }
 * ```
 */
export function usePWA(): UsePWAReturn {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // 설치 여부 확인
  useEffect(() => {
    if (typeof window === "undefined") return;

    // standalone 모드 확인
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsInstalled(isStandalone);

    // display-mode 변경 감지
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // 설치 프롬프트 이벤트 캡처
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    if (typeof window === "undefined") return;

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

  // Service Worker 등록 및 업데이트 감지
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        setRegistration(reg);

        // 업데이트 감지
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true);
            }
          });
        });

        // 주기적 업데이트 확인 (1시간마다)
        setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000);
      } catch (error) {
        console.error("[PWA] Service Worker 등록 실패:", error);
      }
    };

    registerSW();
  }, []);

  // 설치 프롬프트 표시
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        setInstallPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("[PWA] 설치 프롬프트 오류:", error);
      return false;
    }
  }, [installPrompt]);

  // Service Worker 업데이트
  const updateServiceWorker = useCallback(async () => {
    if (!registration?.waiting) return;

    // 새 SW에 SKIP_WAITING 메시지 전송
    registration.waiting.postMessage({ type: "SKIP_WAITING" });

    // 페이지 새로고침
    window.location.reload();
  }, [registration]);

  // 수동 업데이트 확인
  const checkForUpdates = useCallback(async () => {
    if (!registration) return;
    await registration.update();
  }, [registration]);

  return {
    isInstalled,
    isInstallable: !!installPrompt && !isInstalled,
    isOnline,
    isUpdateAvailable,
    registration,
    promptInstall,
    updateServiceWorker,
    checkForUpdates,
  };
}

// ============================================
// useServiceWorkerMessage Hook
// ============================================

/**
 * Service Worker 메시지 리스너 훅
 *
 * @example
 * ```tsx
 * useServiceWorkerMessage((message) => {
 *   if (message.type === 'SYNC_COMPLETE') {
 *     console.log('동기화 완료');
 *   }
 * });
 * ```
 */
export function useServiceWorkerMessage(
  handler: (message: MessageEvent["data"]) => void
): void {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      handler(event.data);
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [handler]);
}

// ============================================
// usePushNotification Hook
// ============================================

interface PushNotificationStatus {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
}

interface UsePushNotificationReturn extends PushNotificationStatus {
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
}

/**
 * Push Notification 관리 훅
 */
export function usePushNotification(): UsePushNotificationReturn {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  // 현재 구독 상태 확인
  useEffect(() => {
    if (!isSupported) return;

    setPermission(Notification.permission);

    const checkSubscription = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error("[Push] 구독 상태 확인 실패:", error);
      }
    };

    checkSubscription();
  }, [isSupported]);

  // 권한 요청
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return "denied";

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("[Push] 권한 요청 실패:", error);
      return "denied";
    }
  }, [isSupported]);

  // 구독
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || permission !== "granted") return null;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      setSubscription(sub);

      // 서버에 구독 정보 전송
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      return sub;
    } catch (error) {
      console.error("[Push] 구독 실패:", error);
      return null;
    }
  }, [isSupported, permission]);

  // 구독 취소
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();

      // 서버에서 구독 정보 삭제
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      setSubscription(null);
      return true;
    } catch (error) {
      console.error("[Push] 구독 취소 실패:", error);
      return false;
    }
  }, [subscription]);

  return {
    isSupported,
    permission,
    isSubscribed: !!subscription,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
