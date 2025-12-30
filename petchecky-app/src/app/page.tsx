"use client";

import { useState, useEffect, useCallback } from "react";
import ChatInterface from "@/components/ChatInterface";
import PetProfileModal from "@/components/PetProfileModal";
import Header from "@/components/Header";
import LandingPage from "@/components/LandingPage";
import ChatHistory, { ChatRecord } from "@/components/ChatHistory";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPets,
  addPet,
  updatePet,
  getChatRecords,
  addChatRecord,
  deleteChatRecord,
  Pet,
  ChatRecord as DBChatRecord,
} from "@/lib/supabase";

export interface PetProfile {
  id?: string; // DB id (로그인 시)
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

// LocalStorage 헬퍼 함수
function getLocalProfile(): PetProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load pet profile:", e);
  }
  return null;
}

function getLocalHistory(): ChatRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load chat history:", e);
  }
  return [];
}

function saveLocalProfile(profile: PetProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save pet profile:", e);
  }
}

function saveLocalHistory(history: ChatRecord[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save chat history:", e);
  }
}

// DB -> UI 변환 함수
function dbPetToProfile(pet: Pet): PetProfile {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    weight: Number(pet.weight),
  };
}

function dbRecordToLocal(record: DBChatRecord): ChatRecord {
  return {
    id: record.id,
    petName: record.pet_name,
    petSpecies: record.pet_species,
    date: record.created_at,
    preview: record.preview,
    severity: record.severity || undefined,
    messages: record.messages,
  };
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("landing");
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ChatRecord | null>(null);

  // 데이터 로드 (로그인 상태에 따라 DB 또는 localStorage)
  useEffect(() => {
    async function loadData() {
      if (authLoading) return;

      if (user) {
        // 로그인: Supabase에서 로드
        const pets = await getPets(user.id);
        if (pets.length > 0) {
          setPetProfile(dbPetToProfile(pets[0]));
        } else {
          // DB에 펫 없으면 localStorage 확인 후 마이그레이션
          const localProfile = getLocalProfile();
          if (localProfile) {
            const newPet = await addPet({
              user_id: user.id,
              name: localProfile.name,
              species: localProfile.species,
              breed: localProfile.breed,
              age: localProfile.age,
              weight: localProfile.weight,
            });
            if (newPet) {
              setPetProfile(dbPetToProfile(newPet));
            }
          }
        }

        const records = await getChatRecords(user.id);
        setChatHistory(records.map(dbRecordToLocal));
      } else {
        // 비로그인: localStorage에서 로드
        const localProfile = getLocalProfile();
        if (localProfile) {
          setPetProfile(localProfile);
        }
        setChatHistory(getLocalHistory());
      }

      setIsLoaded(true);
    }

    loadData();
  }, [user, authLoading]);

  // 펫 프로필 저장
  const savePetProfile = useCallback(async (profile: PetProfile) => {
    if (user) {
      // 로그인: DB에 저장
      if (petProfile?.id) {
        // 수정
        const updated = await updatePet(petProfile.id, {
          name: profile.name,
          species: profile.species,
          breed: profile.breed,
          age: profile.age,
          weight: profile.weight,
        });
        if (updated) {
          setPetProfile(dbPetToProfile(updated));
        }
      } else {
        // 새로 추가
        const newPet = await addPet({
          user_id: user.id,
          name: profile.name,
          species: profile.species,
          breed: profile.breed,
          age: profile.age,
          weight: profile.weight,
        });
        if (newPet) {
          setPetProfile(dbPetToProfile(newPet));
        }
      }
    } else {
      // 비로그인: localStorage에 저장
      setPetProfile(profile);
      saveLocalProfile(profile);
    }
  }, [user, petProfile?.id]);

  // 채팅 저장 핸들러
  const handleSaveChat = useCallback(async (messages: Message[], severity?: "low" | "medium" | "high") => {
    if (!petProfile || messages.length <= 1) return;

    const userMessages = messages.filter(m => m.role === "user");
    const preview = userMessages[0]?.content || "상담 내용 없음";

    if (user && petProfile.id) {
      // 로그인: DB에 저장
      const newRecord = await addChatRecord({
        user_id: user.id,
        pet_id: petProfile.id,
        pet_name: petProfile.name,
        pet_species: petProfile.species,
        preview,
        severity: severity || null,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          severity: m.severity,
        })),
      });

      if (newRecord) {
        setChatHistory(prev => [dbRecordToLocal(newRecord), ...prev].slice(0, 50));
      }
    } else {
      // 비로그인: localStorage에 저장
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

      const updatedHistory = [newRecord, ...chatHistory].slice(0, 50);
      setChatHistory(updatedHistory);
      saveLocalHistory(updatedHistory);
    }
  }, [user, petProfile, chatHistory]);

  // 채팅 기록 삭제
  const handleDeleteRecord = useCallback(async (id: string) => {
    if (user) {
      // 로그인: DB에서 삭제
      const success = await deleteChatRecord(id);
      if (success) {
        setChatHistory(prev => prev.filter(r => r.id !== id));
      }
    } else {
      // 비로그인: localStorage에서 삭제
      const updatedHistory = chatHistory.filter(r => r.id !== id);
      setChatHistory(updatedHistory);
      saveLocalHistory(updatedHistory);
    }
  }, [user, chatHistory]);

  // 채팅 기록 선택
  const handleSelectRecord = (record: ChatRecord) => {
    setSelectedRecord(record);
    setCurrentView("chat");
  };

  // 로딩 중 화면
  if (!isLoaded || authLoading) {
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
