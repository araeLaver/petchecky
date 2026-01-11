"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import LandingPage from "@/components/LandingPage";
import { ChatRecord } from "@/components/ChatHistory";
import { useAuth } from "@/contexts/AuthContext";

// 모달 컴포넌트 Dynamic Import (초기 번들 크기 최적화)
const PetProfileModal = dynamic(() => import("@/components/PetProfileModal"), {
  loading: () => null,
});
const AuthModal = dynamic(() => import("@/components/AuthModal"), {
  loading: () => null,
});
const HealthReport = dynamic(() => import("@/components/HealthReport"), {
  loading: () => null,
  ssr: false,
});
const NotificationSettings = dynamic(() => import("@/components/NotificationSettings"), {
  loading: () => null,
});
const ChatHistory = dynamic(() => import("@/components/ChatHistory"), {
  loading: () => <div className="p-4 text-center text-gray-500">로딩 중...</div>,
});
import {
  getPets,
  addPet,
  updatePet,
  deletePet,
  getChatRecords,
  addChatRecord,
  deleteChatRecord,
  getUsage,
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

const STORAGE_KEY = "petchecky_pets"; // 다중 펫 지원으로 변경
const SELECTED_PET_KEY = "petchecky_selected_pet";
const HISTORY_KEY = "petchecky_chat_history";

// LocalStorage 헬퍼 함수 (다중 펫 지원)
function getLocalPets(): PetProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 기존 단일 펫 데이터 마이그레이션
      if (!Array.isArray(parsed)) {
        return [{ ...parsed, id: `local_${Date.now()}` }];
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load pets:", e);
  }
  return [];
}

function getSelectedPetId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SELECTED_PET_KEY);
  } catch (e) {
    return null;
  }
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

function saveLocalPets(pets: PetProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
  } catch (e) {
    console.error("Failed to save pets:", e);
  }
}

function saveSelectedPetId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(SELECTED_PET_KEY, id);
    } else {
      localStorage.removeItem(SELECTED_PET_KEY);
    }
  } catch (e) {
    console.error("Failed to save selected pet:", e);
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
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>("landing");
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ChatRecord | null>(null);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [showHealthReport, setShowHealthReport] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // 현재 선택된 펫 (computed)
  const selectedPet = pets.find(p => p.id === selectedPetId) || pets[0] || null;

  // 데이터 로드 (로그인 상태에 따라 DB 또는 localStorage)
  useEffect(() => {
    async function loadData() {
      if (authLoading) return;

      if (user) {
        // 로그인: Supabase에서 로드
        const dbPets = await getPets(user.id);
        if (dbPets.length > 0) {
          const loadedPets = dbPets.map(dbPetToProfile);
          setPets(loadedPets);

          // 저장된 선택 펫 ID 복원
          const savedSelectedId = getSelectedPetId();
          if (savedSelectedId && loadedPets.some(p => p.id === savedSelectedId)) {
            setSelectedPetId(savedSelectedId);
          } else {
            setSelectedPetId(loadedPets[0].id || null);
          }
        } else {
          // DB에 펫 없으면 localStorage 확인 후 마이그레이션
          const localPets = getLocalPets();
          if (localPets.length > 0) {
            const migratedPets: PetProfile[] = [];
            for (const localPet of localPets) {
              const newPet = await addPet({
                user_id: user.id,
                name: localPet.name,
                species: localPet.species,
                breed: localPet.breed,
                age: localPet.age,
                weight: localPet.weight,
              });
              if (newPet) {
                migratedPets.push(dbPetToProfile(newPet));
              }
            }
            setPets(migratedPets);
            if (migratedPets.length > 0) {
              setSelectedPetId(migratedPets[0].id || null);
            }
          }
        }

        const records = await getChatRecords(user.id);
        setChatHistory(records.map(dbRecordToLocal));

        // 사용량 조회
        const usage = await getUsage(user.id);
        setUsageCount(usage);
      } else {
        // 비로그인: localStorage에서 로드
        const localPets = getLocalPets();
        setPets(localPets);

        const savedSelectedId = getSelectedPetId();
        if (savedSelectedId && localPets.some(p => p.id === savedSelectedId)) {
          setSelectedPetId(savedSelectedId);
        } else if (localPets.length > 0) {
          setSelectedPetId(localPets[0].id || null);
        }

        setChatHistory(getLocalHistory());
      }

      setIsLoaded(true);
    }

    loadData();
  }, [user, authLoading]);

  // 펫 선택 변경 시 저장
  const handleSelectPet = useCallback((petId: string) => {
    setSelectedPetId(petId);
    saveSelectedPetId(petId);
  }, []);

  // 펫 프로필 저장 (추가/수정)
  const savePetProfile = useCallback(async (profile: PetProfile) => {
    if (user) {
      // 로그인: DB에 저장
      if (editingPet?.id) {
        // 수정
        const updated = await updatePet(editingPet.id, {
          name: profile.name,
          species: profile.species,
          breed: profile.breed,
          age: profile.age,
          weight: profile.weight,
        });
        if (updated) {
          const updatedProfile = dbPetToProfile(updated);
          setPets(prev => prev.map(p => p.id === editingPet.id ? updatedProfile : p));
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
          const newProfile = dbPetToProfile(newPet);
          setPets(prev => [...prev, newProfile]);
          setSelectedPetId(newProfile.id || null);
          saveSelectedPetId(newProfile.id || null);
        }
      }
    } else {
      // 비로그인: localStorage에 저장
      if (editingPet?.id) {
        // 수정
        const updatedPets = pets.map(p =>
          p.id === editingPet.id ? { ...profile, id: editingPet.id } : p
        );
        setPets(updatedPets);
        saveLocalPets(updatedPets);
      } else {
        // 새로 추가
        const newId = `local_${Date.now()}`;
        const newProfile = { ...profile, id: newId };
        const updatedPets = [...pets, newProfile];
        setPets(updatedPets);
        saveLocalPets(updatedPets);
        setSelectedPetId(newId);
        saveSelectedPetId(newId);
      }
    }
    setEditingPet(null);
  }, [user, editingPet, pets]);

  // 펫 삭제
  const handleDeletePet = useCallback(async (petId: string) => {
    if (user) {
      // 로그인: DB에서 삭제
      const success = await deletePet(petId);
      if (success) {
        setPets(prev => {
          const filtered = prev.filter(p => p.id !== petId);
          // 삭제된 펫이 선택된 펫이었다면 첫 번째 펫 선택
          if (selectedPetId === petId && filtered.length > 0) {
            setSelectedPetId(filtered[0].id || null);
            saveSelectedPetId(filtered[0].id || null);
          } else if (filtered.length === 0) {
            setSelectedPetId(null);
            saveSelectedPetId(null);
          }
          return filtered;
        });
      }
    } else {
      // 비로그인: localStorage에서 삭제
      const filtered = pets.filter(p => p.id !== petId);
      setPets(filtered);
      saveLocalPets(filtered);
      if (selectedPetId === petId && filtered.length > 0) {
        setSelectedPetId(filtered[0].id || null);
        saveSelectedPetId(filtered[0].id || null);
      } else if (filtered.length === 0) {
        setSelectedPetId(null);
        saveSelectedPetId(null);
      }
    }
  }, [user, pets, selectedPetId]);

  // 채팅 저장 핸들러
  const handleSaveChat = useCallback(async (messages: Message[], severity?: "low" | "medium" | "high") => {
    if (!selectedPet || messages.length <= 1) return;

    const userMessages = messages.filter(m => m.role === "user");
    const preview = userMessages[0]?.content || "상담 내용 없음";

    if (user && selectedPet.id) {
      // 로그인: DB에 저장
      const newRecord = await addChatRecord({
        user_id: user.id,
        pet_id: selectedPet.id,
        pet_name: selectedPet.name,
        pet_species: selectedPet.species,
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
        petName: selectedPet.name,
        petSpecies: selectedPet.species,
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
  }, [user, selectedPet, chatHistory]);

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

  // 사용량 업데이트
  const refreshUsage = useCallback(async () => {
    if (user) {
      const usage = await getUsage(user.id);
      setUsageCount(usage);
    }
  }, [user]);

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
        pets={pets}
        selectedPet={selectedPet}
        onSelectPet={handleSelectPet}
        onEditPet={(pet) => {
          setEditingPet(pet);
          setShowProfileModal(true);
        }}
        onAddPet={() => {
          setEditingPet(null);
          setShowProfileModal(true);
        }}
        onLogoClick={() => {
          setCurrentView("landing");
          setSelectedRecord(null);
        }}
        onLoginClick={() => setShowAuthModal(true)}
        onNotificationClick={() => setShowNotificationSettings(true)}
        usageCount={usageCount}
      />

      <main className="flex flex-1 flex-col">
        {currentView === "landing" && (
          <LandingPage
            petProfile={selectedPet}
            onStartChat={() => {
              setSelectedRecord(null);
              setCurrentView("chat");
            }}
            onRegisterPet={() => {
              setEditingPet(null);
              setShowProfileModal(true);
            }}
            onViewHistory={() => setCurrentView("history")}
            onViewReport={() => setShowHealthReport(true)}
            historyCount={chatHistory.length}
          />
        )}

        {currentView === "chat" && selectedPet && (
          <ChatInterface
            petProfile={selectedPet}
            onBack={() => {
              setCurrentView("landing");
              setSelectedRecord(null);
            }}
            onSaveChat={handleSaveChat}
            initialMessages={selectedRecord?.messages.map((m, i) => ({
              id: i.toString(),
              ...m,
            }))}
            userId={user?.id}
            onUsageUpdate={refreshUsage}
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
          initialProfile={editingPet}
          onSave={(profile) => {
            savePetProfile(profile);
            setShowProfileModal(false);
          }}
          onClose={() => {
            setShowProfileModal(false);
            setEditingPet(null);
          }}
          onDelete={editingPet?.id ? () => {
            handleDeletePet(editingPet.id!);
            setShowProfileModal(false);
            setEditingPet(null);
          } : undefined}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      {showHealthReport && selectedPet && (
        <HealthReport
          pet={selectedPet}
          records={chatHistory}
          onClose={() => setShowHealthReport(false)}
        />
      )}

      {showNotificationSettings && (
        <NotificationSettings
          onClose={() => setShowNotificationSettings(false)}
        />
      )}
    </div>
  );
}
