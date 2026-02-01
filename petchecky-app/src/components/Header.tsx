"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { PetProfile } from "@/app/page";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MONTHLY_FREE_LIMIT } from "@/lib/supabase";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  pets: PetProfile[];
  selectedPet: PetProfile | null;
  onSelectPet: (petId: string) => void;
  onEditPet: (pet: PetProfile) => void;
  onAddPet: () => void;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  onNotificationClick?: () => void;
  usageCount?: number;
}

export default function Header({
  pets,
  selectedPet,
  onSelectPet,
  onEditPet,
  onAddPet,
  onLogoClick,
  onLoginClick,
  onNotificationClick,
  usageCount,
}: HeaderProps) {
  const { user, signOut, loading } = useAuth();
  const { isPremium, currentPlan, isLoading: subLoading } = useSubscription();
  const { t } = useLanguage();
  const remainingCount = MONTHLY_FREE_LIMIT - (usageCount || 0);
  const [showPetMenu, setShowPetMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 메뉴 닫기
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowPetMenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handlePetMenuToggle = useCallback(() => {
    setShowPetMenu(prev => !prev);
  }, []);

  const handlePetSelect = useCallback((petId: string) => {
    onSelectPet(petId);
    setShowPetMenu(false);
  }, [onSelectPet]);

  const handlePetEdit = useCallback((pet: PetProfile) => {
    onEditPet(pet);
    setShowPetMenu(false);
  }, [onEditPet]);

  const handleAddPet = useCallback(() => {
    onAddPet();
    setShowPetMenu(false);
  }, [onAddPet]);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="펫체키 홈으로 이동"
        >
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{t.common.appName}</span>
        </button>

        <div className="flex items-center gap-3">
          {/* 모드 전환 */}
          <Link
            href="/baby"
            className="rounded-full bg-pink-100 px-3 py-1.5 text-xs font-medium text-pink-600 hover:bg-pink-200 transition-colors dark:bg-pink-900/30 dark:text-pink-400"
            aria-label="베이비체키로 이동"
          >
            👶 베이비
          </Link>

          {/* 펫 선택 드롭다운 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={handlePetMenuToggle}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label={selectedPet ? `${selectedPet.name} 선택됨, 펫 목록 열기` : "펫 등록하기"}
              aria-expanded={showPetMenu}
              aria-haspopup="menu"
            >
              {selectedPet ? (
                <>
                  <span>{selectedPet.species === "dog" ? "🐕" : "🐈"}</span>
                  <span>{selectedPet.name}</span>
                  {pets.length > 1 && (
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </>
              ) : (
                <>
                  <span>🐾</span>
                  <span>{t.pet.register}</span>
                </>
              )}
            </button>

            {/* 드롭다운 메뉴 */}
            {showPetMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 dark:bg-gray-800 dark:ring-gray-700">
                <div className="py-2">
                  {/* 펫 목록 */}
                  {pets.length > 0 && (
                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase dark:text-gray-500">
                      {t.pet.selectPet}
                    </div>
                  )}
                  {pets.map((pet) => (
                    <div
                      key={pet.id}
                      className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700 ${
                        selectedPet?.id === pet.id ? "bg-blue-50 dark:bg-blue-900/30" : ""
                      }`}
                    >
                      <button
                        onClick={() => pet.id && handlePetSelect(pet.id)}
                        className="flex items-center gap-2 flex-1"
                        aria-label={`${pet.name} 선택`}
                      >
                        <span className="text-lg">{pet.species === "dog" ? "🐕" : "🐈"}</span>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{pet.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{pet.breed} · {pet.age}{t.pet.years}</div>
                        </div>
                        {selectedPet?.id === pet.id && (
                          <svg className="w-4 h-4 text-blue-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePetEdit(pet);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="수정"
                        aria-label={`${pet.name} 정보 수정`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* 구분선 */}
                  {pets.length > 0 && <div className="my-2 border-t border-gray-100 dark:border-gray-700" />}

                  {/* 펫 추가 버튼 */}
                  <button
                    onClick={handleAddPet}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    aria-label="새 펫 추가하기"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{t.pet.addPet}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {!loading && !subLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  {/* 알림 설정 버튼 */}
                  {onNotificationClick && (
                    <button
                      onClick={onNotificationClick}
                      className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                      title="알림 설정"
                      aria-label="알림 설정 열기"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </button>
                  )}
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
                  <ThemeToggle />
                  <LanguageSelector />
                  <button
                    onClick={() => signOut()}
                    className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    aria-label="로그아웃"
                  >
                    {t.nav.settings === "설정" ? "로그아웃" : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSelector />
                  <button
                    onClick={onLoginClick}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                    aria-label="로그인"
                  >
                    {t.nav.settings === "설정" ? "로그인" : "Login"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
