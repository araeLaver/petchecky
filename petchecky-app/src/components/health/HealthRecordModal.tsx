"use client";

import { useState } from "react";
import { HealthRecord } from "@/app/health-tracking/page";
import { PetProfile } from "@/app/page";

interface HealthRecordModalProps {
  pet: PetProfile;
  record: HealthRecord | null;
  onSave: (record: Omit<HealthRecord, "id" | "petId">) => void;
  onClose: () => void;
}

export default function HealthRecordModal({
  pet,
  record,
  onSave,
  onClose,
}: HealthRecordModalProps) {
  const [date, setDate] = useState(record?.date || new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState(record?.weight?.toString() || "");
  const [bodyCondition, setBodyCondition] = useState<"underweight" | "ideal" | "overweight" | undefined>(
    record?.bodyCondition
  );
  const [appetite, setAppetite] = useState<"poor" | "normal" | "good" | undefined>(
    record?.appetite
  );
  const [energy, setEnergy] = useState<"low" | "normal" | "high" | undefined>(
    record?.energy
  );
  const [notes, setNotes] = useState(record?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      date,
      weight: weight ? parseFloat(weight) : undefined,
      bodyCondition,
      appetite,
      energy,
      notes: notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {record ? "기록 수정" : "건강 기록 추가"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 펫 정보 */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
            <span className="text-2xl">{pet.species === "dog" ? "🐕" : "🐈"}</span>
            <span className="font-medium text-gray-800">{pet.name}</span>
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              날짜 *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          {/* 체중 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              체중 (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="예: 4.5"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* 체형 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              체형 상태
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "underweight", label: "저체중", emoji: "🦴" },
                { value: "ideal", label: "이상적", emoji: "✨" },
                { value: "overweight", label: "과체중", emoji: "🍔" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setBodyCondition(
                      bodyCondition === option.value
                        ? undefined
                        : (option.value as "underweight" | "ideal" | "overweight")
                    )
                  }
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                    bodyCondition === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 식욕 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              식욕
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "poor", label: "없음", emoji: "😔" },
                { value: "normal", label: "보통", emoji: "😊" },
                { value: "good", label: "왕성", emoji: "😋" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setAppetite(
                      appetite === option.value
                        ? undefined
                        : (option.value as "poor" | "normal" | "good")
                    )
                  }
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                    appetite === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 활력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              활력/에너지
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "low", label: "낮음", emoji: "😴" },
                { value: "normal", label: "보통", emoji: "🙂" },
                { value: "high", label: "높음", emoji: "🤸" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setEnergy(
                      energy === option.value
                        ? undefined
                        : (option.value as "low" | "normal" | "high")
                    )
                  }
                  className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                    energy === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모 (선택)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="특이사항, 증상, 음식 등"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!date}
              className="flex-1 rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {record ? "수정하기" : "저장하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
