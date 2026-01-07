"use client";

import { useState, useEffect } from "react";
import { WalkRecord } from "@/app/walk/page";
import { PetProfile } from "@/app/page";

interface WalkRecordModalProps {
  pet: PetProfile;
  record: WalkRecord | null;
  onSave: (record: Omit<WalkRecord, "id" | "petId">) => void;
  onClose: () => void;
}

export default function WalkRecordModal({
  pet,
  record,
  onSave,
  onClose,
}: WalkRecordModalProps) {
  const [date, setDate] = useState(record?.date || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState(record?.startTime || "");
  const [endTime, setEndTime] = useState(record?.endTime || "");
  const [duration, setDuration] = useState(record?.duration?.toString() || "");
  const [distance, setDistance] = useState(record?.distance?.toString() || "");
  const [location, setLocation] = useState(record?.location || "");
  const [weather, setWeather] = useState<"sunny" | "cloudy" | "rainy" | "snowy" | undefined>(
    record?.weather
  );
  const [mood, setMood] = useState<"happy" | "normal" | "tired" | undefined>(
    record?.mood
  );
  const [notes, setNotes] = useState(record?.notes || "");

  // 시작/종료 시간으로 시간 자동 계산
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60);
      if (diff > 0) {
        setDuration(Math.round(diff).toString());
      }
    }
  }, [startTime, endTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !duration) return;

    onSave({
      date,
      startTime: startTime || new Date().toTimeString().slice(0, 5),
      endTime: endTime || undefined,
      duration: parseInt(duration),
      distance: distance ? parseFloat(distance) : undefined,
      location: location || undefined,
      weather,
      mood,
      notes: notes || undefined,
    });
  };

  const weatherOptions = [
    { value: "sunny", label: "맑음", emoji: "☀️" },
    { value: "cloudy", label: "흐림", emoji: "☁️" },
    { value: "rainy", label: "비", emoji: "🌧️" },
    { value: "snowy", label: "눈", emoji: "❄️" },
  ];

  const moodOptions = [
    { value: "happy", label: "신나요", emoji: "😆" },
    { value: "normal", label: "보통", emoji: "🙂" },
    { value: "tired", label: "피곤해요", emoji: "😴" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {record ? "산책 기록 수정" : "🐕‍🦺 산책 기록"}
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
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
            <span className="text-2xl">{pet.species === "dog" ? "🐕" : "🐈"}</span>
            <span className="font-medium text-gray-800">{pet.name}와(과) 산책</span>
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              required
            />
          </div>

          {/* 시작/종료 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 시간
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          {/* 산책 시간 (분) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              산책 시간 (분) *
            </label>
            <input
              type="number"
              min="1"
              max="480"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="예: 30"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              required
            />
          </div>

          {/* 거리 (km) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              거리 (km)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="예: 1.5"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          {/* 장소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              장소
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 동네 공원, 한강 산책로"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>

          {/* 날씨 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날씨
            </label>
            <div className="flex gap-2">
              {weatherOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setWeather(
                      weather === option.value
                        ? undefined
                        : (option.value as "sunny" | "cloudy" | "rainy" | "snowy")
                    )
                  }
                  className={`flex-1 flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-colors ${
                    weather === option.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="text-xs text-gray-600">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 기분 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {pet.name}의 기분
            </label>
            <div className="flex gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setMood(
                      mood === option.value
                        ? undefined
                        : (option.value as "happy" | "normal" | "tired")
                    )
                  }
                  className={`flex-1 flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors ${
                    mood === option.value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs text-gray-600">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="특이사항, 만난 친구들, 등"
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
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
              disabled={!date || !duration}
              className="flex-1 rounded-lg bg-green-500 py-3 font-medium text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {record ? "수정하기" : "저장하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
