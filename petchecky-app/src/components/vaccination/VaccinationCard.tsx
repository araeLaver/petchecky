"use client";

import { memo } from "react";
import { Vaccination } from "@/app/vaccination/page";

interface VaccinationCardProps {
  vaccination: Vaccination;
  onEdit: () => void;
  onDelete: () => void;
}

export default memo(function VaccinationCard({
  vaccination,
  onEdit,
  onDelete,
}: VaccinationCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDate = vaccination.nextDate ? new Date(vaccination.nextDate) : null;
  if (nextDate) nextDate.setHours(0, 0, 0, 0);

  const isOverdue = nextDate && nextDate < today;
  const isUpcoming =
    nextDate &&
    nextDate >= today &&
    nextDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntil = () => {
    if (!nextDate) return null;
    const diff = Math.ceil(
      (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return `${Math.abs(diff)}일 지남`;
    if (diff === 0) return "오늘";
    return `${diff}일 후`;
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isOverdue
          ? "bg-red-50 border-red-200"
          : isUpcoming
          ? "bg-blue-50 border-blue-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                vaccination.type === "required"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {vaccination.type === "required" ? "필수" : "권장"}
            </span>
            {isOverdue && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                지연
              </span>
            )}
            {isUpcoming && !isOverdue && (
              <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                예정
              </span>
            )}
          </div>

          <h3 className="font-bold text-gray-800 text-lg">{vaccination.name}</h3>

          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>접종일: {formatDate(vaccination.date)}</span>
            </div>

            {vaccination.nextDate && (
              <div
                className={`flex items-center gap-2 ${
                  isOverdue ? "text-red-600 font-medium" : "text-gray-600"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  다음 접종: {formatDate(vaccination.nextDate)}
                  {getDaysUntil() && (
                    <span
                      className={`ml-1 ${
                        isOverdue ? "text-red-600" : "text-blue-600"
                      }`}
                    >
                      ({getDaysUntil()})
                    </span>
                  )}
                </span>
              </div>
            )}

            {vaccination.hospital && (
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>{vaccination.hospital}</span>
              </div>
            )}

            {vaccination.notes && (
              <div className="flex items-start gap-2 text-gray-500">
                <svg
                  className="w-4 h-4 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <span>{vaccination.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="수정"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-100 hover:text-red-600"
            title="삭제"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
})
