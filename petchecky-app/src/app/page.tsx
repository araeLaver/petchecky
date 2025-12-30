"use client";

import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import PetProfileModal from "@/components/PetProfileModal";
import Header from "@/components/Header";

export interface PetProfile {
  name: string;
  species: "dog" | "cat";
  breed: string;
  age: number;
  weight: number;
}

const STORAGE_KEY = "petchecky_pet_profile";

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

export default function Home() {
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 클라이언트에서 로컬스토리지 프로필 로드 (hydration 시 필요)
  useEffect(() => {
    const saved = getInitialProfile();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPetProfile(saved);
    }
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
      />

      <main className="flex flex-1 flex-col">
        {!petProfile ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
            <div className="mb-8 text-6xl">🐾</div>
            <h1 className="mb-4 text-center text-3xl font-bold text-gray-800">
              펫체키
            </h1>
            <p className="mb-2 text-center text-lg text-gray-600">
              AI가 체크하는 우리 아이 건강
            </p>
            <p className="mb-8 max-w-md text-center text-gray-500">
              반려동물이 아파 보일 때, AI가 증상을 분석하고
              <br />
              적절한 대응 방법을 알려드립니다.
            </p>
            <button
              onClick={() => setShowProfileModal(true)}
              className="rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl active:scale-95"
            >
              우리 아이 등록하기
            </button>
          </div>
        ) : (
          <ChatInterface petProfile={petProfile} />
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
    </div>
  );
}
