"use client";

import type { PetProfile } from "@/types/chat";
import { PET_EMOJI } from "@/lib/constants";

interface ChatHeaderProps {
  petProfile: PetProfile;
  onBack: () => void;
}

export default function ChatHeader({ petProfile, onBack }: ChatHeaderProps) {
  return (
    <div className="border-b border-gray-100 bg-white px-4 py-3">
      <div className="mx-auto max-w-3xl flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="상담 화면 닫기"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">{PET_EMOJI[petProfile.species]}</span>
          <span className="font-medium text-gray-800">{petProfile.name}</span>
        </div>
        <span className="text-xs text-gray-400">건강 상담 중</span>
      </div>
    </div>
  );
}
