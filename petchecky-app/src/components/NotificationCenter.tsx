"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification, NotificationType } from "@/lib/notifications";

interface NotificationCenterProps {
  className?: string;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  reminder: "🔔",
  health: "💊",
  community: "💬",
  reservation: "📅",
  system: "⚙️",
};

const TYPE_COLORS: Record<NotificationType, string> = {
  reminder: "bg-yellow-100 text-yellow-800",
  health: "bg-green-100 text-green-800",
  community: "bg-blue-100 text-blue-800",
  reservation: "bg-purple-100 text-purple-800",
  system: "bg-gray-100 text-gray-800",
};

export default function NotificationCenter({ className = "" }: NotificationCenterProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    remove,
  } = useNotifications();

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 알림 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t.notifications?.justNow || "방금 전";
    if (diffMins < 60) return `${diffMins}${t.notifications?.minutesAgo || "분 전"}`;
    if (diffHours < 24) return `${diffHours}${t.notifications?.hoursAgo || "시간 전"}`;
    if (diffDays < 7) return `${diffDays}${t.notifications?.daysAgo || "일 전"}`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    markRead(notification.id);
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* 알림 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={t.notifications?.title || "알림"}
      >
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* 읽지 않은 알림 배지 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.notifications?.title || "알림"}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                {t.notifications?.markAllRead || "모두 읽음"}
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <svg
                  className="w-12 h-12 mx-auto mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p>{t.notifications?.empty || "알림이 없습니다"}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* 읽지 않은 표시 */}
                  {!notification.read && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                  )}

                  <div className="flex items-start gap-3 pl-2">
                    {/* 타입 아이콘 */}
                    <span
                      className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${TYPE_COLORS[notification.type]}`}
                    >
                      {TYPE_ICONS[notification.type]}
                    </span>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {notification.title}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(notification.id);
                      }}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 rounded"
                      aria-label={t.notifications?.delete || "삭제"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 설정 링크 */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
            <a
              href="/settings/notifications"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              {t.notifications?.settings || "알림 설정"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
