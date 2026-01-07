"use client";

import { WalkRecord } from "@/app/walk/page";

interface WalkHistoryProps {
  records: WalkRecord[];
  onEdit: (record: WalkRecord) => void;
  onDelete: (id: string) => void;
}

export default function WalkHistory({
  records,
  onEdit,
  onDelete,
}: WalkHistoryProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "오늘";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "어제";
    }

    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const getWeatherEmoji = (weather?: string) => {
    switch (weather) {
      case "sunny":
        return "☀️";
      case "cloudy":
        return "☁️";
      case "rainy":
        return "🌧️";
      case "snowy":
        return "❄️";
      default:
        return "";
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case "happy":
        return "😆";
      case "normal":
        return "🙂";
      case "tired":
        return "😴";
      default:
        return "";
    }
  };

  // 날짜별로 그룹핑
  const groupedRecords: { [key: string]: WalkRecord[] } = {};
  records.forEach((record) => {
    const dateKey = record.date;
    if (!groupedRecords[dateKey]) {
      groupedRecords[dateKey] = [];
    }
    groupedRecords[dateKey].push(record);
  });

  return (
    <div className="space-y-4">
      {Object.entries(groupedRecords).map(([date, dateRecords]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            {formatDate(date)}
          </h3>
          <div className="space-y-2">
            {dateRecords.map((record) => (
              <div
                key={record.id}
                className="rounded-xl bg-white border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🐾</span>
                      <span className="font-bold text-gray-800">
                        {formatDuration(record.duration)}
                      </span>
                      {record.distance && (
                        <span className="text-sm text-green-600 font-medium">
                          · {record.distance.toFixed(1)}km
                        </span>
                      )}
                      {record.weather && (
                        <span className="text-lg">{getWeatherEmoji(record.weather)}</span>
                      )}
                      {record.mood && (
                        <span className="text-lg">{getMoodEmoji(record.mood)}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      {record.startTime && (
                        <span>
                          ⏰ {record.startTime}
                          {record.endTime && ` ~ ${record.endTime}`}
                        </span>
                      )}
                      {record.location && (
                        <span>📍 {record.location}</span>
                      )}
                    </div>

                    {record.notes && (
                      <p className="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">
                        {record.notes}
                      </p>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-1 ml-2">
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
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
