"use client";

import { useState, useCallback } from "react";
import type { DiaperRecord, DiaperType } from "@/types/baby";

interface DiaperTrackerProps {
  childId: string;
  records: DiaperRecord[];
  onAdd: (record: DiaperRecord) => void;
  onDelete: (id: string) => void;
}

export default function DiaperTracker({ childId, records, onAdd, onDelete }: DiaperTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [diaperType, setDiaperType] = useState<DiaperType>("wet");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const now = new Date().toISOString();
      const record: DiaperRecord = {
        id: crypto.randomUUID(),
        childId,
        time: now,
        type: diaperType,
        color: color || undefined,
        notes: notes || undefined,
        createdAt: now,
      };
      onAdd(record);
      setShowForm(false);
      setColor("");
      setNotes("");
    },
    [childId, diaperType, color, notes, onAdd]
  );

  const todayRecords = records.filter((r) => {
    const d = new Date(r.time);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const typeIcon = (type: DiaperType) => {
    switch (type) {
      case "wet": return "💧";
      case "dirty": return "💩";
      case "mixed": return "💧💩";
      case "dry": return "✅";
    }
  };

  const typeLabel = (type: DiaperType) => {
    switch (type) {
      case "wet": return "소변";
      case "dirty": return "대변";
      case "mixed": return "혼합";
      case "dry": return "깨끗";
    }
  };

  return (
    <div className="space-y-4">
      {/* 오늘 요약 */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">오늘의 기저귀</h3>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600"
          >
            + 기록 추가
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {(["wet", "dirty", "mixed", "dry"] as DiaperType[]).map((type) => (
            <div key={type} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div className="text-xl">{typeIcon(type)}</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{typeLabel(type)}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {todayRecords.filter((r) => r.type === type).length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick add buttons */}
      {!showForm && (
        <div className="flex gap-2">
          {(["wet", "dirty", "mixed"] as DiaperType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                const now = new Date().toISOString();
                onAdd({
                  id: crypto.randomUUID(),
                  childId,
                  time: now,
                  type,
                  createdAt: now,
                });
              }}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-3 text-center shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <div className="text-xl">{typeIcon(type)}</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{typeLabel(type)} 빠른 기록</div>
            </button>
          ))}
        </div>
      )}

      {/* 상세 기록 폼 */}
      {showForm && (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">종류</label>
              <div className="flex gap-2">
                {(["wet", "dirty", "mixed", "dry"] as DiaperType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDiaperType(type)}
                    className={`flex-1 rounded-lg border px-2 py-2 text-sm ${
                      diaperType === type
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30"
                        : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {typeIcon(type)}
                    <div className="text-xs">{typeLabel(type)}</div>
                  </button>
                ))}
              </div>
            </div>

            {(diaperType === "dirty" || diaperType === "mixed") && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">색상</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="예: 노란색, 녹색"
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
                className="flex-1 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600"
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
            오늘의 기저귀 기록이 없습니다
          </p>
        ) : (
          todayRecords
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{typeIcon(record.type)}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {typeLabel(record.type)}
                      {record.color && ` (${record.color})`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(record.time).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
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
