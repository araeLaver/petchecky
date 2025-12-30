"use client";

import { useState, useEffect, useCallback } from "react";
import ChatInterface from "@/components/ChatInterface";
import PetProfileModal from "@/components/PetProfileModal";
import Header from "@/components/Header";
import LandingPage from "@/components/LandingPage";
import ChatHistory, { ChatRecord } from "@/components/ChatHistory";
import AuthModal from "@/components/AuthModal";

export interface PetProfile {
  name: string;
  species: "dog" | "cat";
  breed: string;
  age: number;
  weight: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  severity?: "low" | "medium" | "high";
}

type ViewType = "landing" | "chat" | "history";

const STORAGE_KEY = "petchecky_pet_profile";
const HISTORY_KEY = "petchecky_chat_history";

// 초기 프로필 로드 함수
function getInitialProfile(): PetProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load pet profile:", e);
  }
  return null;
}

// 채팅 기록 로드 함수
function getChatHistory(): ChatRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load chat history:", e);
  }
  return [];
}

export default function Home() {
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("landing");
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ChatRecord | null>(null);

  // 클라이언트에서 로컬스토리지 데이터 로드
  useEffect(() => {
    const savedProfile = getInitialProfile();
    if (savedProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPetProfile(savedProfile);
    }
    const savedHistory = getChatHistory();
    setChatHistory(savedHistory);
    setIsLoaded(true);
  }, []);

  // 펫 프로필 저장 함수
  const savePetProfile = (profile: PetProfile) => {
    setPetProfile(profile);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save pet profile:", e);
    }
  };

  // 채팅 기록 저장 함수
  const saveChatHistory = (history: ChatRecord[]) => {
    setChatHistory(history);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  };

  // 채팅 저장 핸들러
  const handleSaveChat = useCallback((messages: Message[], severity?: "low" | "medium" | "high") => {
    if (!petProfile || messages.length <= 1) return;

    // 사용자의 첫 번째 메시지를 미리보기로 사용
    const userMessages = messages.filter(m => m.role === "user");
    const preview = userMessages[0]?.content || "상담 내용 없음";

    const newRecord: ChatRecord = {
      id: Date.now().toString(),
      petName: petProfile.name,
      petSpecies: petProfile.species,
      date: new Date().toISOString(),
      preview,
      severity,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        severity: m.severity,
      })),
    };

    const updatedHistory = [newRecord, ...chatHistory].slice(0, 50); // 최대 50개 저장
    saveChatHistory(updatedHistory);
  }, [petProfile, chatHistory]);

  // 채팅 기록 삭제
  const handleDeleteRecord = (id: string) => {
    const updatedHistory = chatHistory.filter(r => r.id !== id);
    saveChatHistory(updatedHistory);
  };

  // 채팅 기록 선택
  const handleSelectRecord = (record: ChatRecord) => {
    setSelectedRecord(record);
    setCurrentView("chat");
  };

  // 로딩 중 화면
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="mb-4 text-5xl animate-pulse">🐾</div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <Header
        petProfile={petProfile}
        onProfileClick={() => setShowProfileModal(true)}
        onLogoClick={() => {
          setCurrentView("landing");
          setSelectedRecord(null);
        }}
        onLoginClick={() => setShowAuthModal(true)}
      />

      <main className="flex flex-1 flex-col">
        {currentView === "landing" && (
          <LandingPage
            petProfile={petProfile}
            onStartChat={() => {
              setSelectedRecord(null);
              setCurrentView("chat");
            }}
            onRegisterPet={() => setShowProfileModal(true)}
            onViewHistory={() => setCurrentView("history")}
            historyCount={chatHistory.length}
          />
        )}

        {currentView === "chat" && petProfile && (
          <ChatInterface
            petProfile={petProfile}
            onBack={() => {
              setCurrentView("landing");
              setSelectedRecord(null);
            }}
            onSaveChat={handleSaveChat}
            initialMessages={selectedRecord?.messages.map((m, i) => ({
              id: i.toString(),
              ...m,
            }))}
          />
        )}

        {currentView === "history" && (
          <ChatHistory
            records={chatHistory}
            onSelect={handleSelectRecord}
            onDelete={handleDeleteRecord}
            onBack={() => setCurrentView("landing")}
          />
        )}
      </main>

      {showProfileModal && (
        <PetProfileModal
          initialProfile={petProfile}
          onSave={(profile) => {
            savePetProfile(profile);
            setShowProfileModal(false);
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
