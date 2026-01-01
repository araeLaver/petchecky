"use client";

import { useState, useRef, useEffect } from "react";
import { PetProfile } from "@/app/page";
import QuickSymptoms from "./QuickSymptoms";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  severity?: "low" | "medium" | "high";
}

interface ChatInterfaceProps {
  petProfile: PetProfile;
  onBack: () => void;
  onSaveChat: (messages: Message[], severity?: "low" | "medium" | "high") => void;
  initialMessages?: Message[];
  userId?: string;
  onUsageUpdate?: () => void;
}

export default function ChatInterface({ petProfile, onBack, onSaveChat, initialMessages, userId, onUsageUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages || [
      {
        id: "welcome",
        role: "assistant",
        content: `안녕하세요! ${petProfile.name}의 건강을 체크해드릴게요. 🐾\n\n어떤 증상이 있나요? 자세히 말씀해주시면 더 정확한 분석이 가능해요.`,
      },
    ]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSeverity, setLastSeverity] = useState<"low" | "medium" | "high" | undefined>();
  const [limitExceeded, setLimitExceeded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅 종료 시 저장
  useEffect(() => {
    return () => {
      if (messages.length > 1) {
        onSaveChat(messages, lastSeverity);
      }
    };
  }, [messages, lastSeverity, onSaveChat]);

  const handleQuickSymptom = (symptom: string) => {
    setInput(symptom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          petProfile,
          history: messages.slice(-6),
          userId,
        }),
      });

      const data = await response.json();

      // 사용량 초과 체크
      if (response.status === 429 && data.limitExceeded) {
        setLimitExceeded(true);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message,
          },
        ]);
        return;
      }

      // 에러 응답도 메시지로 표시
      const severity = response.ok ? data.severity : undefined;
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        severity,
      };

      if (severity) {
        setLastSeverity(severity);
      }

      setMessages((prev) => [...prev, assistantMessage]);

      // 사용량 업데이트 콜백
      if (response.ok && onUsageUpdate) {
        onUsageUpdate();
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "네트워크 연결을 확인해주세요. 인터넷이 연결되어 있다면 잠시 후 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityStyle = (severity?: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "border-l-4 border-red-500 bg-red-50";
      case "medium":
        return "border-l-4 border-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-4 border-green-500 bg-green-50";
      default:
        return "bg-gray-100";
    }
  };

  const getSeverityBadge = (severity?: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return (
          <span className="mb-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            🚨 위험 - 병원 방문 권장
          </span>
        );
      case "medium":
        return (
          <span className="mb-2 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            ⚠️ 주의 - 경과 관찰 필요
          </span>
        );
      case "low":
        return (
          <span className="mb-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            ✅ 안심 - 일반적인 증상
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Chat Header */}
      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">{petProfile.species === "dog" ? "🐕" : "🐈"}</span>
            <span className="font-medium text-gray-800">{petProfile.name}</span>
          </div>
          <span className="text-xs text-gray-400">건강 상담 중</span>
        </div>
      </div>

      {/* Quick Symptoms */}
      <QuickSymptoms onSelect={handleQuickSymptom} disabled={isLoading} />

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
                {message.role === "assistant" && getSeverityBadge(message.severity)}
                <p className={`whitespace-pre-wrap text-sm leading-relaxed ${
                  message.role === "user" ? "text-white" : "text-gray-800"
                }`}>
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.1s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white p-4">
        {limitExceeded ? (
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 text-center">
              <p className="text-orange-800 font-medium mb-2">
                이번 달 무료 상담 횟수를 모두 사용했어요
              </p>
              <p className="text-sm text-orange-600 mb-3">
                다음 달 1일에 자동으로 초기화됩니다.
              </p>
              <button
                onClick={onBack}
                className="rounded-full bg-orange-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 1000))}
                placeholder="증상을 입력하세요..."
                maxLength={1000}
                className="flex-1 rounded-full border border-gray-300 px-5 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-full bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                전송
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-gray-400">
              * AI 상담은 참고용이며, 정확한 진단은 수의사와 상담하세요
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
