"use client";

import { useState } from "react";
import { Hospital } from "./HospitalMap";
import { useAuth } from "@/contexts/AuthContext";

interface ReservationModalProps {
  hospital: Hospital;
  onClose: () => void;
  onSuccess: () => void;
  petName?: string;
  petSpecies?: "dog" | "cat";
}

interface ReservationForm {
  petName: string;
  petSpecies: "dog" | "cat";
  symptoms: string;
  preferredDate: string;
  preferredTime: string;
  contactPhone: string;
  notes: string;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

export default function ReservationModal({
  hospital,
  onClose,
  onSuccess,
  petName = "",
  petSpecies = "dog",
}: ReservationModalProps) {
  const { getAccessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const [form, setForm] = useState<ReservationForm>({
    petName,
    petSpecies,
    symptoms: "",
    preferredDate: "",
    preferredTime: "",
    contactPhone: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.petName || !form.preferredDate || !form.preferredTime || !form.contactPhone) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 인증 토큰을 헤더에 포함하여 요청 (보안 강화)
      const token = await getAccessToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch("/api/reservation", {
        method: "POST",
        headers,
        body: JSON.stringify({
          // userId는 서버에서 인증 토큰으로 검증
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          hospitalAddress: hospital.roadAddress || hospital.address,
          hospitalPhone: hospital.phone,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "예약 요청에 실패했습니다.");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "예약 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">예약 요청</h2>
            <p className="text-sm text-gray-500 truncate">{hospital.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 안내 */}
        <div className="bg-blue-50 px-5 py-3 text-sm text-blue-700">
          <p>예약 요청을 보내드립니다. 병원에서 확인 후 연락드릴 예정입니다.</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* 반려동물 정보 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                반려동물 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="petName"
                value={form.petName}
                onChange={handleChange}
                placeholder="이름"
                maxLength={20}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종류 <span className="text-red-500">*</span>
              </label>
              <select
                name="petSpecies"
                value={form.petSpecies}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="dog">강아지</option>
                <option value="cat">고양이</option>
              </select>
            </div>
          </div>

          {/* 증상 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              주요 증상
            </label>
            <textarea
              name="symptoms"
              value={form.symptoms}
              onChange={handleChange}
              placeholder="예: 구토, 식욕 부진 등"
              rows={2}
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* 희망 날짜/시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                희망 날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="preferredDate"
                value={form.preferredDate}
                onChange={handleChange}
                min={today}
                max={maxDateStr}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                희망 시간 <span className="text-red-500">*</span>
              </label>
              <select
                name="preferredTime"
                value={form.preferredTime}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              >
                <option value="">시간 선택</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              placeholder="010-1234-5678"
              maxLength={15}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          {/* 추가 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              추가 요청사항
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="병원에 전달할 내용이 있으면 적어주세요"
              rows={2}
              maxLength={300}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-500 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "요청 중..." : "예약 요청"}
            </button>
          </div>
        </form>

        {/* 하단 안내 */}
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-center">
          <p className="text-xs text-gray-500">
            * 예약은 병원 확인 후 확정됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
