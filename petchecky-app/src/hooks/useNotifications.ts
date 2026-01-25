"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationSettings,
  saveNotificationSettings,
  requestPushPermission,
  getPushPermission,
  isPushSupported,
  type Notification,
  type NotificationSettings,
} from "@/lib/notifications";

interface UseNotificationsReturn {
  // 알림 목록
  notifications: Notification[];
  unreadCount: number;
  // 설정
  settings: NotificationSettings;
  pushPermission: NotificationPermission | null;
  isPushEnabled: boolean;
  // 액션
  refresh: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  requestPush: () => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>(() => getNotificationSettings());
  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null);

  // 알림 목록 새로고침
  const refresh = useCallback(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  }, []);

  // 초기 로드
  useEffect(() => {
    refresh();
    setPushPermission(getPushPermission());

    // 주기적으로 새로고침 (1분마다)
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  // 알림 읽음 처리
  const markRead = useCallback((id: string) => {
    markAsRead(id);
    refresh();
  }, [refresh]);

  // 모든 알림 읽음 처리
  const markAllRead = useCallback(() => {
    markAllAsRead();
    refresh();
  }, [refresh]);

  // 알림 삭제
  const remove = useCallback((id: string) => {
    deleteNotification(id);
    refresh();
  }, [refresh]);

  // 설정 업데이트
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    saveNotificationSettings(newSettings);
    setSettings(getNotificationSettings());
  }, []);

  // 푸시 알림 권한 요청
  const requestPush = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported()) {
      return false;
    }

    const permission = await requestPushPermission();
    setPushPermission(permission);

    if (permission === 'granted') {
      updateSettings({ push: true });
      return true;
    }

    return false;
  }, [updateSettings]);

  return {
    notifications,
    unreadCount,
    settings,
    pushPermission,
    isPushEnabled: isPushSupported() && pushPermission === 'granted',
    refresh,
    markRead,
    markAllRead,
    remove,
    updateSettings,
    requestPush,
  };
}

export type { UseNotificationsReturn };
