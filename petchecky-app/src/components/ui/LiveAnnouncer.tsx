"use client";

import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from "react";

interface Announcement {
  id: string;
  message: string;
  priority: "polite" | "assertive";
  timestamp: number;
}

interface LiveAnnouncerContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
  clear: () => void;
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextType | null>(null);

/**
 * 스크린 리더 공지를 위한 Context Hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { announce } = useLiveAnnouncer();
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       announce("저장되었습니다.");
 *     } catch {
 *       announce("저장에 실패했습니다.", "assertive");
 *     }
 *   };
 * }
 * ```
 */
export function useLiveAnnouncer(): LiveAnnouncerContextType {
  const context = useContext(LiveAnnouncerContext);
  if (!context) {
    throw new Error("useLiveAnnouncer must be used within a LiveAnnouncerProvider");
  }
  return context;
}

interface LiveAnnouncerProviderProps {
  children: ReactNode;
  debounceTime?: number;
}

/**
 * 스크린 리더 공지를 관리하는 Provider
 *
 * Features:
 * - aria-live="polite" - 현재 읽는 내용 완료 후 공지
 * - aria-live="assertive" - 즉시 공지 (에러, 긴급)
 * - 중복 공지 방지 (debounce)
 * - 자동 정리
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * <LiveAnnouncerProvider>
 *   {children}
 * </LiveAnnouncerProvider>
 * ```
 */
export function LiveAnnouncerProvider({
  children,
  debounceTime = 100,
}: LiveAnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // 메시지 정리
  useEffect(() => {
    if (announcements.length === 0) return;

    const timeoutId = setTimeout(() => {
      setPoliteMessage("");
      setAssertiveMessage("");
      setAnnouncements([]);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [announcements]);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      const id = `${Date.now()}-${Math.random()}`;
      const announcement: Announcement = {
        id,
        message,
        priority,
        timestamp: Date.now(),
      };

      // debounce를 위해 기존 메시지 지우고 새 메시지 설정
      if (priority === "assertive") {
        setAssertiveMessage("");
        setTimeout(() => setAssertiveMessage(message), debounceTime);
      } else {
        setPoliteMessage("");
        setTimeout(() => setPoliteMessage(message), debounceTime);
      }

      setAnnouncements((prev) => [...prev, announcement]);
    },
    [debounceTime]
  );

  const announcePolite = useCallback(
    (message: string) => announce(message, "polite"),
    [announce]
  );

  const announceAssertive = useCallback(
    (message: string) => announce(message, "assertive"),
    [announce]
  );

  const clear = useCallback(() => {
    setPoliteMessage("");
    setAssertiveMessage("");
    setAnnouncements([]);
  }, []);

  return (
    <LiveAnnouncerContext.Provider
      value={{ announce, announcePolite, announceAssertive, clear }}
    >
      {children}

      {/* Polite Live Region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>

      {/* Assertive Live Region */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveAnnouncerContext.Provider>
  );
}

/**
 * 로딩 상태를 스크린 리더에 알리는 컴포넌트
 */
interface LoadingAnnouncerProps {
  isLoading: boolean;
  loadingMessage?: string;
  loadedMessage?: string;
  context?: string;
}

export function LoadingAnnouncer({
  isLoading,
  loadingMessage = "로딩 중입니다",
  loadedMessage = "로딩이 완료되었습니다",
  context = "",
}: LoadingAnnouncerProps) {
  const [announced, setAnnounced] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fullContext = context ? `${context} ` : "";

    if (isLoading && !announced) {
      setMessage(`${fullContext}${loadingMessage}`);
      setAnnounced(true);
    } else if (!isLoading && announced) {
      setMessage(`${fullContext}${loadedMessage}`);
      setAnnounced(false);
    }
  }, [isLoading, announced, context, loadingMessage, loadedMessage]);

  // 메시지 정리
  useEffect(() => {
    if (!message) return;

    const timeoutId = setTimeout(() => {
      setMessage("");
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [message]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

/**
 * 결과 수를 스크린 리더에 알리는 컴포넌트
 */
interface ResultAnnouncerProps {
  count: number;
  singular?: string;
  plural?: string;
  zeroMessage?: string;
}

export function ResultAnnouncer({
  count,
  singular = "개 결과",
  plural = "개 결과",
  zeroMessage = "결과가 없습니다",
}: ResultAnnouncerProps) {
  const message =
    count === 0 ? zeroMessage : `${count}${count === 1 ? singular : plural}를 찾았습니다`;

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}

export default LiveAnnouncerProvider;
