"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useWebSocket,
  useRealTimeNotifications,
  usePresence,
  useWebSocketHealth,
} from "@/hooks/useWebSocket";
import { WebSocketStatus, NotificationPayload } from "@/lib/websocket";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// WebSocket Context
// ============================================

interface WebSocketContextValue {
  status: WebSocketStatus;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within WebSocketProvider");
  }
  return context;
}

// ============================================
// WebSocketProvider
// ============================================

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  autoConnect?: boolean;
}

export function WebSocketProvider({
  children,
  url,
  autoConnect = true,
}: WebSocketProviderProps) {
  const { status, isConnected, connect, disconnect } = useWebSocket({
    url,
    autoConnect,
  });

  return (
    <WebSocketContext.Provider value={{ status, isConnected, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
}

// ============================================
// ConnectionStatus Component
// ============================================

interface ConnectionStatusProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ConnectionStatus({ showLabel = true, size = "md" }: ConnectionStatusProps) {
  const { status, isConnected, connect } = useWebSocketContext();

  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const statusColors = {
    connecting: "bg-yellow-500",
    connected: "bg-green-500",
    disconnected: "bg-gray-400",
    error: "bg-red-500",
  };

  const statusLabels = {
    connecting: "Connecting...",
    connected: "Connected",
    disconnected: "Disconnected",
    error: "Connection Error",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`${sizes[size]} ${statusColors[status]} rounded-full ${
          status === "connecting" ? "animate-pulse" : ""
        }`}
      />
      {showLabel && (
        <span className="text-sm text-gray-600">{statusLabels[status]}</span>
      )}
      {status === "disconnected" && (
        <button
          onClick={connect}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Reconnect
        </button>
      )}
    </div>
  );
}

// ============================================
// RealtimeNotificationToast Component
// ============================================

interface NotificationToastProps {
  notification: NotificationPayload;
  onDismiss: () => void;
  duration?: number;
}

function NotificationToast({
  notification,
  onDismiss,
  duration = 5000,
}: NotificationToastProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const typeStyles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  const content = (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm ${
        typeStyles[notification.type]
      }`}
    >
      <div className="flex-1">
        <h4 className="font-medium">{notification.title}</h4>
        <p className="text-sm mt-1 opacity-80">{notification.body}</p>
        {notification.action && (
          <a
            href={notification.action.url}
            className="text-sm font-medium mt-2 inline-block hover:underline"
          >
            {notification.action.label}
          </a>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-black/10 rounded"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  if (prefersReducedMotion) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.2 }}
    >
      {content}
    </motion.div>
  );
}

// ============================================
// RealtimeNotifications Component
// ============================================

export function RealtimeNotifications() {
  const { notifications, markAsRead } = useRealTimeNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationPayload[]>([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (!visibleNotifications.find((n) => n.id === latest.id)) {
        setVisibleNotifications((prev) => [latest, ...prev].slice(0, 3));
      }
    }
  }, [notifications]);

  const handleDismiss = (id: string) => {
    setVisibleNotifications((prev) => prev.filter((n) => n.id !== id));
    markAsRead(id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={() => handleDismiss(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// PresenceIndicator Component
// ============================================

interface PresenceIndicatorProps {
  userId: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PresenceIndicator({
  userId,
  showLabel = false,
  size = "md",
}: PresenceIndicatorProps) {
  const { getStatus, isOnline } = usePresence({ userIds: [userId] });
  const status = getStatus(userId);

  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    offline: "bg-gray-400",
  };

  const statusLabels = {
    online: "Online",
    away: "Away",
    offline: "Offline",
  };

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`${sizes[size]} ${statusColors[status]} rounded-full ${
          status === "online" ? "ring-2 ring-green-200" : ""
        }`}
      />
      {showLabel && (
        <span className="text-xs text-gray-500">{statusLabels[status]}</span>
      )}
    </div>
  );
}

// ============================================
// TypingIndicator Component
// ============================================

interface TypingIndicatorProps {
  users: string[];
  maxDisplay?: number;
}

export function TypingIndicator({ users, maxDisplay = 3 }: TypingIndicatorProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (users.length === 0) return null;

  const displayNames = users.slice(0, maxDisplay);
  const remaining = users.length - maxDisplay;

  let text: string;
  if (displayNames.length === 1) {
    text = `${displayNames[0]} is typing`;
  } else if (remaining > 0) {
    text = `${displayNames.join(", ")} and ${remaining} others are typing`;
  } else {
    text = `${displayNames.join(" and ")} are typing`;
  }

  const dots = (
    <span className="inline-flex gap-0.5 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 bg-gray-400 rounded-full"
          animate={prefersReducedMotion ? {} : { opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </span>
  );

  return (
    <div className="flex items-center text-sm text-gray-500">
      <span>{text}</span>
      {dots}
    </div>
  );
}

// ============================================
// WebSocketHealthIndicator Component
// ============================================

export function WebSocketHealthIndicator() {
  const { status, latency, lastPing, ping } = useWebSocketHealth();

  useEffect(() => {
    // Ping every 30 seconds
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [ping]);

  return (
    <div className="flex items-center gap-3 text-sm">
      <ConnectionStatus size="sm" showLabel={false} />
      {latency !== null && (
        <span className="text-gray-500">
          Latency: <span className="font-medium">{latency}ms</span>
        </span>
      )}
      {lastPing && (
        <span className="text-gray-400 text-xs">
          Last ping: {lastPing.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

// ============================================
// Export
// ============================================

export {
  WebSocketContext,
  type WebSocketContextValue,
};
