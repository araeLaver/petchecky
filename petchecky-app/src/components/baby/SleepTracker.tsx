"use client";

import { useState, useCallback } from "react";
import type { SleepRecord } from "@/types/baby";

interface SleepTrackerProps {
  childId: string;
  records: SleepRecord[];
  onAdd: (record: SleepRecord) => void;
  onDelete: (id: string) => void;
}

export default function SleepTracker({ childId, records, onAdd, onDelete }: SleepTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [quality, setQuality] = useState<"good" | "fair" | "poor">("good");
  const [notes, setNotes] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!startTime) return;

      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : undefined;
      const duration = end ? Math.round((end.getTime() - start.getTime()) / (1000 * 60)) : undefined;

      const record: SleepRecord = {
        id: crypto.randomUUID(),
        childId,
        startTime: start.toISOString(),
        endTime: end?.toISOString(),
        durationMinutes: duration,
        quality,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
      };
      onAdd(record);
      setShowForm(false);
      setStartTime("");
      setEndTime("");
      setNotes("");
    },
    [childId, startTime, endTime, quality, notes, onAdd]
  );

  const todayRecords = records.filter((r) => {
    const d = new Date(r.startTime);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const totalSleepMinutes = todayRecords.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
  const totalHours = Math.floor(totalSleepMinutes / 60);
  const totalMins = totalSleepMinutes % 60;

  const qualityIcon = (q: string) => {
    switch (q) {
      case "good": return "😴";
      case "fair": return "😐";
      case "poor": return "😫";
      default: return "💤";
    }
  };

  return (
    <div className="space-y-4">
      {/* 오늘 요약 */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">오늘의 수면</h3>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
          >
            + 기록 추가
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
            <div className="text-2xl">💤</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">총 수면 시간</div>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {totalHours}시간 {totalMins}분
            </div>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
            <div className="text-2xl">🌙</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">수면 횟수</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {todayRecords.length}회
            </div>
          </div>
        </div>
      </div>

      {/* 기록 추가 폼 */}
      {showForm && (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">시작 시간 *</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">종료 시간</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">수면 품질</label>
              <div className="flex gap-2">
                {(["good", "fair", "poor"] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                      quality === q
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30"
                        : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {qualityIcon(q)} {q === "good" ? "좋음" : q === "fair" ? "보통" : "나쁨"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">메모</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="선택사항"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 기록 목록 */}
      <div className="space-y-2">
        {todayRecords.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
            오늘의 수면 기록이 없습니다
          </p>
        ) : (
          todayRecords
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{qualityIcon(record.quality || "good")}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(record.startTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                      {record.endTime && (
                        <> ~ {new Date(record.endTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {record.durationMinutes && `${Math.floor(record.durationMinutes / 60)}시간 ${record.durationMinutes % 60}분`}
                      {record.notes && ` · ${record.notes}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(record.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
