"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  isPushSupported,
  getNotificationPermission,
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  saveSubscriptionToServer,
  removeSubscriptionFromServer,
} from "@/lib/pushNotification";
import { useAuth } from "./AuthContext";

interface PushNotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<boolean>;
}

const PushNotificationContext = createContext<PushNotificationContextType | null>(null);

export function PushNotificationProvider({ children }: { children: ReactNode }) {
  const { user, getAccessToken } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 상태 확인
  useEffect(() => {
    async function checkPushStatus() {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (!supported) {
        setIsLoading(false);
        return;
      }

      setPermission(getNotificationPermission());

      // Service Worker 등록
      await registerServiceWorker();

      // 현재 구독 상태 확인
      const subscription = await getCurrentSubscription();
      setIsSubscribed(!!subscription);

      setIsLoading(false);
    }

    checkPushStatus();
  }, []);

  // 알림 활성화
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);

    try {
      // 권한 요청
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setIsLoading(false);
        return false;
      }

      // Service Worker 등록
      const registration = await registerServiceWorker();
      if (!registration) {
        setIsLoading(false);
        return false;
      }

      // Push 구독
      const subscription = await subscribeToPush(registration);
      if (!subscription) {
        setIsLoading(false);
        return false;
      }

      // 서버에 구독 정보 저장 (로그인 사용자만)
      if (user) {
        const token = await getAccessToken();
        await saveSubscriptionToServer(subscription, token);
      }

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      setIsLoading(false);
      return false;
    }
  }, [isSupported, user, getAccessToken]);

  // 알림 비활성화
  const disableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);

    try {
      const success = await unsubscribeFromPush();

      // 서버에서 구독 정보 삭제 (로그인 사용자만)
      if (success && user) {
        const token = await getAccessToken();
        await removeSubscriptionFromServer(token);
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return success;
    } catch (error) {
      console.error("Failed to disable notifications:", error);
      setIsLoading(false);
      return false;
    }
  }, [isSupported, user, getAccessToken]);

  return (
    <PushNotificationContext.Provider
      value={{
        isSupported,
        permission,
        isSubscribed,
        isLoading,
        enableNotifications,
        disableNotifications,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotification() {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error("usePushNotification must be used within a PushNotificationProvider");
  }
  return context;
}
