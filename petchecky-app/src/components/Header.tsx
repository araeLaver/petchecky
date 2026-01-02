"use client";

import Link from "next/link";
import { PetProfile } from "@/app/page";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { MONTHLY_FREE_LIMIT } from "@/lib/supabase";

interface HeaderProps {
  petProfile: PetProfile | null;
  onProfileClick: () => void;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  usageCount?: number;
}

export default function Header({ petProfile, onProfileClick, onLogoClick, onLoginClick, usageCount }: HeaderProps) {
  const { user, signOut, loading } = useAuth();
  const { isPremium, currentPlan, isLoading: subLoading } = useSubscription();
  const remainingCount = MONTHLY_FREE_LIMIT - (usageCount || 0);

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

          {!loading && !subLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  {isPremium ? (
                    /* 프리미엄 구독자 배지 */
                    <Link
                      href="/subscription"
                      className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
                        currentPlan === "premium_plus"
                          ? "bg-purple-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {currentPlan === "premium_plus" ? "프리미엄+" : "프리미엄"}
                    </Link>
                  ) : (
                    /* 무료 사용자: 남은 횟수 + 업그레이드 버튼 */
                    <div className="hidden sm:flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          remainingCount <= 3
                            ? "bg-red-100 text-red-700"
                            : remainingCount <= 10
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                        title="이번 달 남은 무료 상담 횟수"
                      >
                        {remainingCount}/{MONTHLY_FREE_LIMIT}회
                      </span>
                      <Link
                        href="/subscription"
                        className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                      >
                        업그레이드
                      </Link>
                    </div>
                  )}
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
