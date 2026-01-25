"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  WebSocketClient,
  WebSocketStatus,
  WebSocketMessage,
  WebSocketOptions,
  createWebSocketClient,
  MESSAGE_TYPES,
  NotificationPayload,
  ChatMessagePayload,
  PresencePayload,
  TypingPayload,
} from "@/lib/websocket";

// ============================================
// useWebSocket Hook
// ============================================

interface UseWebSocketOptions extends Omit<WebSocketOptions, "url"> {
  url?: string;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  status: WebSocketStatus;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  send: <T>(type: string, payload: T) => boolean;
  subscribe: <T>(type: string, handler: (payload: T) => void) => () => void;
  client: WebSocketClient | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
    autoConnect = true,
    ...restOptions
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const clientRef = useRef<WebSocketClient | null>(null);

  // Initialize client
  useEffect(() => {
    clientRef.current = createWebSocketClient({
      url,
      onStatusChange: setStatus,
      ...restOptions,
    });

    if (autoConnect) {
      clientRef.current.connect();
    }

    return () => {
      clientRef.current?.disconnect();
      clientRef.current = null;
    };
  }, [url, autoConnect]);

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const send = useCallback(<T,>(type: string, payload: T): boolean => {
    if (!clientRef.current) return false;
    return clientRef.current.send({ type, payload });
  }, []);

  const subscribe = useCallback(<T,>(type: string, handler: (payload: T) => void) => {
    if (!clientRef.current) return () => {};
    return clientRef.current.on(type, handler);
  }, []);

  return {
    status,
    isConnected: status === "connected",
    connect,
    disconnect,
    send,
    subscribe,
    client: clientRef.current,
  };
}

// ============================================
// useRealTimeNotifications Hook
// ============================================

interface UseRealTimeNotificationsReturn {
  notifications: NotificationPayload[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  isConnected: boolean;
}

export function useRealTimeNotifications(): UseRealTimeNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const { subscribe, send, isConnected } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe<NotificationPayload>(
      MESSAGE_TYPES.NOTIFICATION,
      (notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 50));
      }
    );

    return unsubscribe;
  }, [subscribe]);

  const markAsRead = useCallback(
    (id: string) => {
      send(MESSAGE_TYPES.NOTIFICATION_READ, { id });
      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );
    },
    [send]
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount: notifications.length,
    markAsRead,
    clearAll,
    isConnected,
  };
}

// ============================================
// useRealTimeChat Hook
// ============================================

interface UseRealTimeChatOptions {
  roomId: string;
  onMessage?: (message: ChatMessagePayload) => void;
}

interface UseRealTimeChatReturn {
  messages: ChatMessagePayload[];
  typingUsers: string[];
  sendMessage: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
  isConnected: boolean;
}

export function useRealTimeChat({
  roomId,
  onMessage,
}: UseRealTimeChatOptions): UseRealTimeChatReturn {
  const [messages, setMessages] = useState<ChatMessagePayload[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { subscribe, send, isConnected } = useWebSocket();
  const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Subscribe to messages
  useEffect(() => {
    const unsubscribe = subscribe<ChatMessagePayload>(
      MESSAGE_TYPES.CHAT_MESSAGE,
      (message) => {
        if (message.roomId === roomId) {
          setMessages((prev) => [...prev, message]);
          onMessage?.(message);
        }
      }
    );

    return unsubscribe;
  }, [roomId, subscribe, onMessage]);

  // Subscribe to typing indicators
  useEffect(() => {
    const unsubscribe = subscribe<TypingPayload>(
      MESSAGE_TYPES.CHAT_TYPING,
      ({ userId, roomId: msgRoomId, isTyping }) => {
        if (msgRoomId !== roomId) return;

        // Clear existing timeout for this user
        const existingTimeout = typingTimeouts.current.get(userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        if (isTyping) {
          setTypingUsers((prev) => [...new Set([...prev, userId])]);

          // Auto-remove after 3 seconds
          const timeout = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((id) => id !== userId));
            typingTimeouts.current.delete(userId);
          }, 3000);

          typingTimeouts.current.set(userId, timeout);
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== userId));
        }
      }
    );

    return () => {
      unsubscribe();
      typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, [roomId, subscribe]);

  const sendMessage = useCallback(
    (content: string) => {
      send(MESSAGE_TYPES.CHAT_MESSAGE, { roomId, content });
    },
    [roomId, send]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      send(MESSAGE_TYPES.CHAT_TYPING, { roomId, isTyping });
    },
    [roomId, send]
  );

  return {
    messages,
    typingUsers,
    sendMessage,
    setTyping,
    isConnected,
  };
}

// ============================================
// usePresence Hook
// ============================================

interface UsePresenceOptions {
  userIds: string[];
}

interface UsePresenceReturn {
  presence: Map<string, PresencePayload>;
  getStatus: (userId: string) => PresencePayload["status"];
  isOnline: (userId: string) => boolean;
}

export function usePresence({ userIds }: UsePresenceOptions): UsePresenceReturn {
  const [presence, setPresence] = useState<Map<string, PresencePayload>>(new Map());
  const { subscribe, send, isConnected } = useWebSocket();

  // Subscribe to presence updates
  useEffect(() => {
    const unsubscribe = subscribe<PresencePayload>(
      MESSAGE_TYPES.PRESENCE_UPDATE,
      (payload) => {
        setPresence((prev) => {
          const next = new Map(prev);
          next.set(payload.userId, payload);
          return next;
        });
      }
    );

    return unsubscribe;
  }, [subscribe]);

  // Subscribe to user presence
  useEffect(() => {
    if (isConnected && userIds.length > 0) {
      send(MESSAGE_TYPES.PRESENCE_SUBSCRIBE, { userIds });
    }
  }, [isConnected, userIds, send]);

  const getStatus = useCallback(
    (userId: string) => {
      return presence.get(userId)?.status || "offline";
    },
    [presence]
  );

  const isOnline = useCallback(
    (userId: string) => {
      return getStatus(userId) === "online";
    },
    [getStatus]
  );

  return {
    presence,
    getStatus,
    isOnline,
  };
}

// ============================================
// useWebSocketHealth Hook
// ============================================

interface UseWebSocketHealthReturn {
  status: WebSocketStatus;
  latency: number | null;
  lastPing: Date | null;
  ping: () => void;
}

export function useWebSocketHealth(): UseWebSocketHealthReturn {
  const [latency, setLatency] = useState<number | null>(null);
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const pingTime = useRef<number | null>(null);
  const { status, subscribe, send } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe(MESSAGE_TYPES.PONG, () => {
      if (pingTime.current) {
        setLatency(Date.now() - pingTime.current);
        setLastPing(new Date());
        pingTime.current = null;
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const ping = useCallback(() => {
    pingTime.current = Date.now();
    send(MESSAGE_TYPES.PING, null);
  }, [send]);

  return {
    status,
    latency,
    lastPing,
    ping,
  };
}
