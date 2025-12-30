"use client";

import { useState } from "react";
import { PetProfile } from "@/app/page";

interface PetProfileModalProps {
  initialProfile: PetProfile | null;
  onSave: (profile: PetProfile) => void;
  onClose: () => void;
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
}: PetProfileModalProps) {
  const [name, setName] = useState(initialProfile?.name || "");
  const [species, setSpecies] = useState<"dog" | "cat">(
    initialProfile?.species || "dog"
  );
  const [breed, setBreed] = useState(initialProfile?.breed || "");
  const [age, setAge] = useState(initialProfile?.age?.toString() || "");
  const [weight, setWeight] = useState(initialProfile?.weight?.toString() || "");

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
        </form>
      </div>
    </div>
  );
}
