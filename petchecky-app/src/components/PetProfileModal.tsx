"use client";

import { useState } from "react";
import { PetProfile } from "@/app/page";

interface PetProfileModalProps {
  initialProfile: PetProfile | null;
  onSave: (profile: PetProfile) => void;
  onClose: () => void;
  onDelete?: () => void; // 삭제 콜백 (수정 모드에서만)
}

const DOG_BREEDS = [
  "믹스견",
  "말티즈",
  "푸들",
  "포메라니안",
  "치와와",
  "시츄",
  "요크셔테리어",
  "비숑프리제",
  "골든리트리버",
  "래브라도리트리버",
  "진돗개",
  "웰시코기",
  "비글",
  "닥스훈트",
  "기타",
];

const CAT_BREEDS = [
  "믹스묘",
  "코리안숏헤어",
  "페르시안",
  "러시안블루",
  "브리티시숏헤어",
  "스코티시폴드",
  "아메리칸숏헤어",
  "샴",
  "랙돌",
  "메인쿤",
  "벵갈",
  "터키시앙고라",
  "기타",
];

export default function PetProfileModal({
  initialProfile,
  onSave,
  onClose,
  onDelete,
}: PetProfileModalProps) {
  const [name, setName] = useState(initialProfile?.name || "");
  const [species, setSpecies] = useState<"dog" | "cat">(
    initialProfile?.species || "dog"
  );
  const [breed, setBreed] = useState(initialProfile?.breed || "");
  const [age, setAge] = useState(initialProfile?.age?.toString() || "");
  const [weight, setWeight] = useState(initialProfile?.weight?.toString() || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const breeds = species === "dog" ? DOG_BREEDS : CAT_BREEDS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !breed || !age || !weight) return;

    onSave({
      name,
      species,
      breed,
      age: parseInt(age),
      weight: parseFloat(weight),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {initialProfile ? "프로필 수정" : "우리 아이 등록"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="반려동물 이름"
              maxLength={20}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              종류
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSpecies("dog");
                  setBreed("");
                }}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  species === "dog"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">🐕</span>
                강아지
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpecies("cat");
                  setBreed("");
                }}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  species === "cat"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">🐈</span>
                고양이
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              품종
            </label>
            <select
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            >
              <option value="">품종 선택</option>
              {breeds.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                나이 (세)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="나이"
                min="0"
                max="30"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                체중 (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="체중"
                min="0"
                max="100"
                step="0.1"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-blue-500 py-3 font-semibold text-white transition-colors hover:bg-blue-600 active:scale-[0.98]"
          >
            {initialProfile ? "수정 완료" : "등록하기"}
          </button>

          {/* 삭제 버튼 (수정 모드에서만 표시) */}
          {initialProfile && onDelete && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-2 w-full rounded-lg border border-red-300 py-3 font-semibold text-red-500 transition-colors hover:bg-red-50 active:scale-[0.98]"
            >
              반려동물 삭제
            </button>
          )}
        </form>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <svg className="h-7 w-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">정말 삭제하시겠어요?</h3>
              <p className="mb-6 text-sm text-gray-500">
                <strong>{initialProfile?.name}</strong>의 모든 정보가 삭제됩니다.<br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (onDelete) onDelete();
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 rounded-lg bg-red-500 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
