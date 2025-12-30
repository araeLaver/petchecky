"use client";

import { PetProfile } from "@/app/page";

interface HeaderProps {
  petProfile: PetProfile | null;
  onProfileClick: () => void;
}

export default function Header({ petProfile, onProfileClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold text-gray-800">펫체키</span>
        </div>

        {petProfile && (
          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <span>{petProfile.species === "dog" ? "🐕" : "🐈"}</span>
            <span>{petProfile.name}</span>
          </button>
        )}
      </div>
    </header>
  );
}
