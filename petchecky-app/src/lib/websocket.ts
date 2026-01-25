/**
 * WebSocket 클라이언트 라이브러리
 */

// ============================================
// Types
// ============================================

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  id?: string;
}

export interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onStatusChange?: (status: WebSocketStatus) => void;
}

type MessageHandler<T = unknown> = (payload: T) => void;

// ============================================
// WebSocketClient Class
// ============================================

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketOptions>;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectCount = 0;
  private _status: WebSocketStatus = "disconnected";
  private messageQueue: WebSocketMessage[] = [];

  constructor(options: WebSocketOptions) {
    this.options = {
      protocols: [],
      reconnect: true,
      reconnectInterval: 3000,
      reconnectAttempts: 5,
      heartbeatInterval: 30000,
      onOpen: () => {},
      onClose: () => {},
      onError: () => {},
      onMessage: () => {},
      onStatusChange: () => {},
      ...options,
    };
  }

  // ============================================
  // Getters
  // ============================================

  get status(): WebSocketStatus {
    return this._status;
  }

  get isConnected(): boolean {
    return this._status === "connected";
  }

  // ============================================
  // Connection Management
  // ============================================

  connect(): void {
    if (typeof WebSocket === "undefined") {
      console.warn("[WebSocket] WebSocket is not supported in this environment");
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.setStatus("connecting");

    try {
      this.ws = new WebSocket(this.options.url, this.options.protocols);
      this.setupEventListeners();
    } catch (error) {
      console.error("[WebSocket] Connection failed:", error);
      this.setStatus("error");
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.clearTimers();
    this.reconnectCount = 0;

    if (this.ws) {
      this.ws.close(1000, "Client disconnected");
      this.ws = null;
    }

    this.setStatus("disconnected");
  }

  // ============================================
  // Event Listeners
  // ============================================

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.setStatus("connected");
      this.reconnectCount = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      this.options.onOpen();
    };

    this.ws.onclose = (event) => {
      this.setStatus("disconnected");
      this.clearTimers();
      this.options.onClose(event);

      if (!event.wasClean && this.options.reconnect) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.setStatus("error");
      this.options.onError(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.options.onMessage(message);
        this.dispatchMessage(message);
      } catch (error) {
        console.error("[WebSocket] Failed to parse message:", error);
      }
    };
  }

  // ============================================
  // Status Management
  // ============================================

  private setStatus(status: WebSocketStatus): void {
    if (this._status !== status) {
      this._status = status;
      this.options.onStatusChange(status);
    }
  }

  // ============================================
  // Reconnection
  // ============================================

  private scheduleReconnect(): void {
    if (this.reconnectCount >= this.options.reconnectAttempts) {
      console.error("[WebSocket] Max reconnection attempts reached");
      return;
    }

    this.clearTimers();
    this.reconnectCount++;

    const delay = this.options.reconnectInterval * Math.pow(2, this.reconnectCount - 1);
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectCount})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // ============================================
  // Heartbeat
  // ============================================

  private startHeartbeat(): void {
    if (this.options.heartbeatInterval <= 0) return;

    this.heartbeatTimer = setInterval(() => {
      this.send({ type: "ping", payload: null });
    }, this.options.heartbeatInterval);
  }

  // ============================================
  // Timer Cleanup
  // ============================================

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ============================================
  // Message Sending
  // ============================================

  send<T>(message: Omit<WebSocketMessage<T>, "timestamp" | "id">): boolean {
    const fullMessage: WebSocketMessage<T> = {
      ...message,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullMessage));
      return true;
    }

    // Queue message for later
    this.messageQueue.push(fullMessage as WebSocketMessage);
    return false;
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  // ============================================
  // Message Subscription
  // ============================================

  on<T>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    this.handlers.get(type)!.add(handler as MessageHandler);

    return () => {
      this.handlers.get(type)?.delete(handler as MessageHandler);
    };
  }

  off<T>(type: string, handler: MessageHandler<T>): void {
    this.handlers.get(type)?.delete(handler as MessageHandler);
  }

  private dispatchMessage(message: WebSocketMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.payload));
    }

    // Dispatch to wildcard handlers
    const wildcardHandlers = this.handlers.get("*");
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(message));
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let defaultClient: WebSocketClient | null = null;

export function getWebSocketClient(options?: WebSocketOptions): WebSocketClient {
  if (!defaultClient && options) {
    defaultClient = new WebSocketClient(options);
  }
  if (!defaultClient) {
    throw new Error("WebSocket client not initialized. Provide options on first call.");
  }
  return defaultClient;
}

export function createWebSocketClient(options: WebSocketOptions): WebSocketClient {
  return new WebSocketClient(options);
}

// ============================================
// Message Types
// ============================================

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  action?: {
    label: string;
    url: string;
  };
}

export interface ChatMessagePayload {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  roomId: string;
  createdAt: string;
}

export interface PresencePayload {
  userId: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
}

export interface TypingPayload {
  userId: string;
  roomId: string;
  isTyping: boolean;
}

// ============================================
// Message Type Constants
// ============================================

export const MESSAGE_TYPES = {
  // System
  PING: "ping",
  PONG: "pong",
  ERROR: "error",

  // Notifications
  NOTIFICATION: "notification",
  NOTIFICATION_READ: "notification:read",

  // Chat
  CHAT_MESSAGE: "chat:message",
  CHAT_TYPING: "chat:typing",
  CHAT_READ: "chat:read",

  // Presence
  PRESENCE_UPDATE: "presence:update",
  PRESENCE_SUBSCRIBE: "presence:subscribe",

  // Pets
  PET_UPDATE: "pet:update",
  HEALTH_ALERT: "health:alert",

  // Sync
  SYNC_REQUEST: "sync:request",
  SYNC_RESPONSE: "sync:response",
} as const;
