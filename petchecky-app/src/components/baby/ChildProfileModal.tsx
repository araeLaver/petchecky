"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ChildProfile, Gender, BloodType } from "@/types/baby";

interface ChildProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (child: ChildProfile) => void;
  child?: ChildProfile | null;
}

export default function ChildProfileModal({ isOpen, onClose, onSave, child }: ChildProfileModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(child?.name || "");
  const [birthDate, setBirthDate] = useState(child?.birthDate || "");
  const [gender, setGender] = useState<Gender>(child?.gender || "male");
  const [birthWeight, setBirthWeight] = useState(child?.birthWeight?.toString() || "");
  const [birthHeight, setBirthHeight] = useState(child?.birthHeight?.toString() || "");
  const [bloodType, setBloodType] = useState<BloodType>(child?.bloodType || "unknown");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !birthDate) return;

      const profile: ChildProfile = {
        id: child?.id || crypto.randomUUID(),
        name: name.trim(),
        birthDate,
        gender,
        birthWeight: birthWeight ? parseFloat(birthWeight) : undefined,
        birthHeight: birthHeight ? parseFloat(birthHeight) : undefined,
        bloodType: bloodType !== "unknown" ? bloodType : undefined,
        createdAt: child?.createdAt || new Date().toISOString(),
        updatedAt: child ? new Date().toISOString() : undefined,
      };

      onSave(profile);
      onClose();
    },
    [name, birthDate, gender, birthWeight, birthHeight, bloodType, child, onSave, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          {child ? (t.common.edit || "수정") : "👶 " + (t.baby?.addChild || "아이 등록")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.baby?.childName || "이름"} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder={t.baby?.childNamePlaceholder || "아이 이름"}
              required
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.baby?.birthDate || "생년월일"} *
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.baby?.gender || "성별"}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  gender === "male"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                }`}
              >
                👦 {t.baby?.male || "남아"}
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  gender === "female"
                    ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                    : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                }`}
              >
                👧 {t.baby?.female || "여아"}
              </button>
            </div>
          </div>

          {/* 출생 체중/신장 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.baby?.birthWeight || "출생 체중"} (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={birthWeight}
                onChange={(e) => setBirthWeight(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="3.3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.baby?.birthHeight || "출생 신장"} (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={birthHeight}
                onChange={(e) => setBirthHeight(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="50"
              />
            </div>
          </div>

          {/* 혈액형 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.baby?.bloodType || "혈액형"}
            </label>
            <div className="flex gap-2">
              {(["A", "B", "O", "AB", "unknown"] as BloodType[]).map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setBloodType(bt)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-sm font-medium transition-colors ${
                    bloodType === bt
                      ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                      : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                  }`}
                >
                  {bt === "unknown" ? "모름" : bt + "형"}
                </button>
              ))}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-pink-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-pink-600 transition-colors"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
