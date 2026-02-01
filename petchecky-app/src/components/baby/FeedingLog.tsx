"use client";

import { useState, useCallback } from "react";
import type { FeedingRecord, FeedingType, BreastSide } from "@/types/baby";

interface FeedingLogProps {
  childId: string;
  records: FeedingRecord[];
  onAdd: (record: FeedingRecord) => void;
  onDelete: (id: string) => void;
}

export default function FeedingLog({ childId, records, onAdd, onDelete }: FeedingLogProps) {
  const [showForm, setShowForm] = useState(false);
  const [feedingType, setFeedingType] = useState<FeedingType>("breast");
  const [side, setSide] = useState<BreastSide>("left");
  const [duration, setDuration] = useState("");
  const [amount, setAmount] = useState("");
  const [foodDesc, setFoodDesc] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const now = new Date().toISOString();
      const record: FeedingRecord = {
        id: crypto.randomUUID(),
        childId,
        type: feedingType,
        startTime: now,
        side: feedingType === "breast" ? side : undefined,
        durationMinutes: duration ? parseInt(duration) : undefined,
        amountMl: amount ? parseInt(amount) : undefined,
        foodDescription: feedingType === "baby_food" ? foodDesc : undefined,
        notes: notes || undefined,
        createdAt: now,
      };
      onAdd(record);
      setShowForm(false);
      setDuration("");
      setAmount("");
      setFoodDesc("");
      setNotes("");
    },
    [childId, feedingType, side, duration, amount, foodDesc, notes, onAdd]
  );

  const todayRecords = records.filter((r) => {
    const d = new Date(r.startTime);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const typeIcon = (type: FeedingType) => {
    switch (type) {
      case "breast": return "🤱";
      case "formula": return "🍼";
      case "baby_food": return "🥣";
    }
  };

  const typeLabel = (type: FeedingType) => {
    switch (type) {
      case "breast": return "모유";
      case "formula": return "분유";
      case "baby_food": return "이유식";
    }
  };

  return (
    <div className="space-y-4">
      {/* 오늘 요약 */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">오늘의 수유</h3>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-pink-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-pink-600"
          >
            + 기록 추가
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-pink-50 p-3 dark:bg-pink-900/20">
            <div className="text-2xl">🤱</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">모유</div>
            <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
              {todayRecords.filter((r) => r.type === "breast").length}회
            </div>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="text-2xl">🍼</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">분유</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {todayRecords.filter((r) => r.type === "formula").reduce((sum, r) => sum + (r.amountMl || 0), 0)}ml
            </div>
          </div>
          <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
            <div className="text-2xl">🥣</div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">이유식</div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {todayRecords.filter((r) => r.type === "baby_food").length}회
            </div>
          </div>
        </div>
      </div>

      {/* 기록 추가 폼 */}
      {showForm && (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 수유 타입 */}
            <div className="flex gap-2">
              {(["breast", "formula", "baby_food"] as FeedingType[]).map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setFeedingType(ft)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    feedingType === ft
                      ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                      : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                  }`}
                >
                  {typeIcon(ft)} {typeLabel(ft)}
                </button>
              ))}
            </div>

            {/* 모유 옵션 */}
            {feedingType === "breast" && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">방향</label>
                  <div className="flex gap-2">
                    {(["left", "right", "both"] as BreastSide[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSide(s)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                          side === s
                            ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/30"
                            : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {s === "left" ? "왼쪽" : s === "right" ? "오른쪽" : "양쪽"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">시간 (분)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="15"
                  />
                </div>
              </>
            )}

            {/* 분유 옵션 */}
            {feedingType === "formula" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">용량 (ml)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="120"
                />
              </div>
            )}

            {/* 이유식 옵션 */}
            {feedingType === "baby_food" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">음식 설명</label>
                <input
                  type="text"
                  value={foodDesc}
                  onChange={(e) => setFoodDesc(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="쌀미음, 고구마퓨레..."
                />
              </div>
            )}

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
                className="flex-1 rounded-lg bg-pink-500 px-3 py-2 text-sm font-medium text-white hover:bg-pink-600"
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
            오늘의 수유 기록이 없습니다
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
                  <span className="text-2xl">{typeIcon(record.type)}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {typeLabel(record.type)}
                      {record.side && ` (${record.side === "left" ? "왼쪽" : record.side === "right" ? "오른쪽" : "양쪽"})`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(record.startTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                      {record.durationMinutes && ` · ${record.durationMinutes}분`}
                      {record.amountMl && ` · ${record.amountMl}ml`}
                      {record.foodDescription && ` · ${record.foodDescription}`}
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
