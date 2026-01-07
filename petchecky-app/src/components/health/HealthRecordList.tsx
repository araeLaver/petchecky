"use client";

import { HealthRecord } from "@/app/health-tracking/page";

interface HealthRecordListProps {
  records: HealthRecord[];
  onEdit: (record: HealthRecord) => void;
  onDelete: (id: string) => void;
}

export default function HealthRecordList({
  records,
  onEdit,
  onDelete,
}: HealthRecordListProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const getBodyConditionLabel = (condition?: "underweight" | "ideal" | "overweight") => {
    switch (condition) {
      case "underweight":
        return { emoji: "🦴", label: "저체중", color: "text-blue-600" };
      case "ideal":
        return { emoji: "✨", label: "이상적", color: "text-green-600" };
      case "overweight":
        return { emoji: "🍔", label: "과체중", color: "text-orange-600" };
      default:
        return null;
    }
  };

  const getAppetiteLabel = (appetite?: "poor" | "normal" | "good") => {
    switch (appetite) {
      case "poor":
        return { emoji: "😔", label: "식욕 없음" };
      case "normal":
        return { emoji: "😊", label: "식욕 보통" };
      case "good":
        return { emoji: "😋", label: "식욕 왕성" };
      default:
        return null;
    }
  };

  const getEnergyLabel = (energy?: "low" | "normal" | "high") => {
    switch (energy) {
      case "low":
        return { emoji: "😴", label: "활력 낮음" };
      case "normal":
        return { emoji: "🙂", label: "활력 보통" };
      case "high":
        return { emoji: "🤸", label: "활력 높음" };
      default:
        return null;
    }
  };

  // 날짜 역순 정렬
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedRecords.map((record) => {
        const bodyCondition = getBodyConditionLabel(record.bodyCondition);
        const appetite = getAppetiteLabel(record.appetite);
        const energy = getEnergyLabel(record.energy);

        return (
          <div
            key={record.id}
            className="rounded-xl bg-white border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                {record.weight && (
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {record.weight.toFixed(1)}
                    <span className="text-base font-normal text-gray-500 ml-1">kg</span>
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(record)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="수정"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(record.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-100 hover:text-red-600"
                  title="삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* 상태 태그들 */}
            <div className="flex flex-wrap gap-2">
              {bodyCondition && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium ${bodyCondition.color}`}
                >
                  {bodyCondition.emoji} {bodyCondition.label}
                </span>
              )}
              {appetite && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  {appetite.emoji} {appetite.label}
                </span>
              )}
              {energy && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  {energy.emoji} {energy.label}
                </span>
              )}
            </div>

            {/* 메모 */}
            {record.notes && (
              <p className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
                {record.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
