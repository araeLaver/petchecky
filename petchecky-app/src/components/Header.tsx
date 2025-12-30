"use client";

import { PetProfile } from "@/app/page";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  petProfile: PetProfile | null;
  onProfileClick: () => void;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
}

export default function Header({ petProfile, onProfileClick, onLogoClick, onLoginClick }: HeaderProps) {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold text-gray-800">펫체키</span>
        </button>

        <div className="flex items-center gap-3">
          {petProfile && (
            <button
              onClick={onProfileClick}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <span>{petProfile.species === "dog" ? "🐕" : "🐈"}</span>
              <span>{petProfile.name}</span>
            </button>
          )}

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-sm text-gray-600 truncate max-w-[120px]">
                    {user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                >
                  로그인
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
