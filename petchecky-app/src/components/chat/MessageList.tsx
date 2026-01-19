"use client";

import { RefObject } from "react";
import type { Message } from "@/types/chat";
import type { Severity } from "@/lib/constants";

// 위험도 스타일 매핑
const SEVERITY_STYLES: Record<string, string> = {
  high: "border-l-4 border-red-500 bg-red-50",
  medium: "border-l-4 border-yellow-500 bg-yellow-50",
  low: "border-l-4 border-green-500 bg-green-50",
  default: "bg-gray-100",
};

const SEVERITY_BADGES: Record<string, { className: string; text: string }> = {
  high: {
    className: "mb-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700",
    text: "🚨 위험 - 병원 방문 권장",
  },
  medium: {
    className: "mb-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700",
    text: "⚠️ 주의 - 경과 관찰 필요",
  },
  low: {
    className: "mb-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700",
    text: "✅ 안심 - 일반적인 증상",
  },
};

function getSeverityStyle(severity?: Severity): string {
  return SEVERITY_STYLES[severity || "default"] || SEVERITY_STYLES.default;
}

function SeverityBadge({ severity }: { severity?: Severity }) {
  const badge = severity ? SEVERITY_BADGES[severity] : null;
  if (!badge) return null;
  return <span className={badge.className}>{badge.text}</span>;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onFindHospital: () => void;
}

export default function MessageList({
  messages,
  isLoading,
  messagesEndRef,
  onFindHospital,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="mx-auto max-w-3xl space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : getSeverityStyle(message.severity)
              }`}
            >
              {message.role === "assistant" && <SeverityBadge severity={message.severity} />}

              {/* 사용자가 첨부한 이미지 표시 */}
              {message.image && (
                <div className="mb-2">
                  <img
                    src={message.image}
                    alt="첨부 이미지"
                    className="rounded-lg max-w-full max-h-48 object-cover"
                  />
                </div>
              )}

              <p className={`whitespace-pre-wrap text-sm leading-relaxed ${
                message.role === "user" ? "text-white" : "text-gray-800"
              }`}>
                {message.content}
              </p>

              {/* 병원 추천 버튼 - medium/high severity일 때 표시 */}
              {message.role === "assistant" &&
                (message.severity === "medium" || message.severity === "high") && (
                <button
                  onClick={onFindHospital}
                  className={`mt-3 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${
                    message.severity === "high"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  }`}
                  aria-label="가까운 동물병원 검색하기"
                >
                  🏥 가까운 동물병원 찾기
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && <LoadingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl bg-gray-100 px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.1s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
        </div>
      </div>
    </div>
  );
}
