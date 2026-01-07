"use client";

import { useState, useEffect } from "react";
import { Vaccination } from "@/app/vaccination/page";
import { PetProfile } from "@/app/page";

interface VaccinationModalProps {
  pet: PetProfile;
  vaccination: Vaccination | null;
  vaccineList: { name: string; type: string; interval: number }[];
  onSave: (vaccination: Omit<Vaccination, "id" | "petId">) => void;
  onClose: () => void;
}

export default function VaccinationModal({
  pet,
  vaccination,
  vaccineList,
  onSave,
  onClose,
}: VaccinationModalProps) {
  const [name, setName] = useState(vaccination?.name || "");
  const [customName, setCustomName] = useState("");
  const [date, setDate] = useState(vaccination?.date || "");
  const [nextDate, setNextDate] = useState(vaccination?.nextDate || "");
  const [hospital, setHospital] = useState(vaccination?.hospital || "");
  const [notes, setNotes] = useState(vaccination?.notes || "");
  const [type, setType] = useState<"required" | "optional">(
    vaccination?.type || "required"
  );
  const [autoCalculate, setAutoCalculate] = useState(true);

  const isCustom = name === "기타";

  // 백신 선택 시 자동으로 다음 접종일 계산
  useEffect(() => {
    if (autoCalculate && date && name && name !== "기타") {
      const vaccine = vaccineList.find((v) => v.name === name);
      if (vaccine) {
        const dateObj = new Date(date);
        dateObj.setDate(dateObj.getDate() + vaccine.interval);
        setNextDate(dateObj.toISOString().split("T")[0]);
        setType(vaccine.type as "required" | "optional");
      }
    }
  }, [date, name, vaccineList, autoCalculate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = isCustom ? customName : name;
    if (!finalName || !date) return;

    onSave({
      name: finalName,
      date,
      nextDate: nextDate || undefined,
      hospital: hospital || undefined,
      notes: notes || undefined,
      type,
      completed: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {vaccination ? "접종 기록 수정" : "접종 기록 추가"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 펫 정보 */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
            <span className="text-2xl">{pet.species === "dog" ? "🐕" : "🐈"}</span>
            <span className="font-medium text-gray-800">{pet.name}</span>
          </div>

          {/* 백신 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              백신 종류 *
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            >
              <option value="">백신을 선택하세요</option>
              {vaccineList.map((vaccine, index) => (
                <option key={index} value={vaccine.name}>
                  {vaccine.name} ({vaccine.type === "required" ? "필수" : "권장"})
                </option>
              ))}
              <option value="기타">기타 (직접 입력)</option>
            </select>
          </div>

          {/* 커스텀 백신명 */}
          {isCustom && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                백신명 입력 *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="백신명을 입력하세요"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
          )}

          {/* 접종일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              접종일 *
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

          {/* 다음 접종 예정일 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                다음 접종 예정일
              </label>
              {name && name !== "기타" && (
                <label className="flex items-center gap-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={autoCalculate}
                    onChange={(e) => setAutoCalculate(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  자동 계산
                </label>
              )}
            </div>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => {
                setNextDate(e.target.value);
                setAutoCalculate(false);
              }}
              min={date || undefined}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* 접종 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              접종 유형
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("required")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  type === "required"
                    ? "bg-red-100 text-red-700 border-2 border-red-300"
                    : "bg-gray-100 text-gray-600 border-2 border-transparent"
                }`}
              >
                필수
              </button>
              <button
                type="button"
                onClick={() => setType("optional")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  type === "optional"
                    ? "bg-gray-200 text-gray-800 border-2 border-gray-400"
                    : "bg-gray-100 text-gray-600 border-2 border-transparent"
                }`}
              >
                권장
              </button>
            </div>
          </div>

          {/* 접종 병원 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              접종 병원 (선택)
            </label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="병원명을 입력하세요"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모 (선택)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="접종 후 반응, 특이사항 등"
              rows={2}
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
              disabled={!name || !date || (isCustom && !customName)}
              className="flex-1 rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {vaccination ? "수정하기" : "저장하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
