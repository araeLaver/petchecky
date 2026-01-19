"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { FILE_LIMITS } from "@/lib/constants";
import QuickSymptoms from "./QuickSymptoms";
import HospitalRecommendation from "./hospital/HospitalRecommendation";
import { MessageList, ChatForm, ChatHeader } from "./chat";
import type { PetProfile, Message } from "@/types/chat";
import type { Severity } from "@/lib/constants";

interface ChatInterfaceProps {
  petProfile: PetProfile;
  onBack: () => void;
  onSaveChat: (messages: Message[], severity?: Severity) => void;
  initialMessages?: Message[];
  userId?: string;
  onUsageUpdate?: () => void;
}

export default function ChatInterface({
  petProfile,
  onBack,
  onSaveChat,
  initialMessages,
  userId,
  onUsageUpdate,
}: ChatInterfaceProps) {
  const { getAccessToken } = useAuth();
  const { isPremiumPlus } = useSubscription();

  // 상태 관리
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
  const [lastSeverity, setLastSeverity] = useState<Severity | undefined>();
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [showHospitalRecommendation, setShowHospitalRecommendation] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    mimeType: string;
    preview: string;
  } | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 스크롤 핸들러
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 채팅 종료 시 저장
  useEffect(() => {
    return () => {
      if (messages.length > 1) {
        onSaveChat(messages, lastSeverity);
      }
    };
  }, [messages, lastSeverity, onSaveChat]);

  // 이미지 선택 핸들러
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 파일 크기 제한
      if (file.size > FILE_LIMITS.MAX_IMAGE_SIZE) {
        alert(
          `이미지 크기는 ${FILE_LIMITS.MAX_IMAGE_SIZE / 1024 / 1024}MB 이하로 업로드해주세요.`
        );
        return;
      }

      // 지원 형식 확인
      if (
        !FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(
          file.type as (typeof FILE_LIMITS.ALLOWED_IMAGE_TYPES)[number]
        )
      ) {
        alert("지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP만 가능)");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const base64Data = dataUrl.split(",")[1];
        setSelectedImage({
          data: base64Data,
          mimeType: file.type,
          preview: dataUrl,
        });
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  // 이미지 제거
  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  // 빠른 증상 선택
  const handleQuickSymptom = useCallback((symptom: string) => {
    setInput(symptom);
  }, []);

  // 메시지 전송
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      image: selectedImage?.preview,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const token = await getAccessToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userMessage.content,
          petProfile,
          history: messages.slice(-6),
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

      // 응답 처리
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
          content:
            "네트워크 연결을 확인해주세요. 인터넷이 연결되어 있다면 잠시 후 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Chat Header */}
      <ChatHeader petProfile={petProfile} onBack={onBack} />

      {/* Quick Symptoms */}
      <QuickSymptoms onSelect={handleQuickSymptom} disabled={isLoading} />

      {/* Message List */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        onFindHospital={() => setShowHospitalRecommendation(true)}
      />

      {/* Chat Form */}
      <div className="border-t border-gray-100 bg-white p-4">
        <ChatForm
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          limitExceeded={limitExceeded}
          isPremiumPlus={isPremiumPlus}
          selectedImage={selectedImage}
          fileInputRef={fileInputRef}
          onSubmit={handleSubmit}
          onImageSelect={handleImageSelect}
          onRemoveImage={handleRemoveImage}
          onBack={onBack}
        />
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
