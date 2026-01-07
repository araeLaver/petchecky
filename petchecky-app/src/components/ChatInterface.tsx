"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PetProfile } from "@/app/page";
import { useSubscription } from "@/contexts/SubscriptionContext";
import QuickSymptoms from "./QuickSymptoms";
import HospitalRecommendation from "./hospital/HospitalRecommendation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  severity?: "low" | "medium" | "high";
  image?: string; // Base64 이미지 URL (미리보기용)
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
  const { isPremium, isPremiumPlus } = useSubscription();
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
  const [showHospitalRecommendation, setShowHospitalRecommendation] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하로 업로드해주세요.");
      return;
    }

    // 지원 형식 확인
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // data:image/jpeg;base64,xxxx 형식에서 base64 데이터만 추출
      const base64Data = dataUrl.split(",")[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        preview: dataUrl,
      });
    };
    reader.readAsDataURL(file);

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

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
      image: selectedImage?.preview, // 미리보기용 이미지
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const imageToSend = selectedImage; // 전송할 이미지 저장
    setSelectedImage(null); // 이미지 초기화
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
          isPremium,
          isPremiumPlus,
          image: imageToSend
            ? { data: imageToSend.data, mimeType: imageToSend.mimeType }
            : undefined,
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
                    onClick={() => setShowHospitalRecommendation(true)}
                    className={`mt-3 w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${
                      message.severity === "high"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    🏥 가까운 동물병원 찾기
                  </button>
                )}
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
            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-5 text-center">
              <p className="text-gray-800 font-bold text-lg mb-2">
                이번 달 무료 상담 횟수를 모두 사용했어요
              </p>
              <p className="text-sm text-gray-600 mb-4">
                프리미엄 구독으로 무제한 AI 상담을 이용해보세요!
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/subscription"
                  className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  프리미엄 둘러보기
                </Link>
                <button
                  onClick={onBack}
                  className="rounded-full bg-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
                >
                  홈으로
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                다음 달 1일에 무료 횟수가 초기화됩니다
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            {/* 선택된 이미지 미리보기 */}
            {selectedImage && (
              <div className="mb-3 relative inline-block">
                <img
                  src={selectedImage.preview}
                  alt="선택된 이미지"
                  className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex gap-2">
              {/* 이미지 업로드 버튼 (프리미엄+ 전용) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => {
                  if (!isPremiumPlus) {
                    alert("이미지 분석은 프리미엄+ 구독자 전용 기능입니다.");
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                disabled={isLoading}
                className={`rounded-full p-3 transition-colors ${
                  isPremiumPlus
                    ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    : "bg-gray-100 text-gray-400"
                }`}
                title={isPremiumPlus ? "이미지 첨부" : "프리미엄+ 전용 기능"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 1000))}
                placeholder={selectedImage ? "사진에 대해 설명해주세요..." : "증상을 입력하세요..."}
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
              {isPremiumPlus && " | 📷 이미지 분석 가능"}
            </p>
          </form>
        )}
      </div>

      {/* 병원 추천 모달 */}
      {lastSeverity && (
        <HospitalRecommendation
          severity={lastSeverity}
          isVisible={showHospitalRecommendation}
          onClose={() => setShowHospitalRecommendation(false)}
          petName={petProfile.name}
          petSpecies={petProfile.species}
        />
      )}
    </div>
  );
}
