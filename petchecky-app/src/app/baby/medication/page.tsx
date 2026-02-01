"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useChildStore } from "@/stores/childStore";
import type { ChildMedication } from "@/types/baby";

const STORAGE_KEY = "petchecky-baby-medication";

function getRecords(): ChildMedication[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveRecords(records: ChildMedication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export default function MedicationPage() {
  const { children, selectedChildId } = useChildStore();
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const [records, setRecords] = useState<ChildMedication[]>(() =>
    getRecords().filter((r) => r.childId === selectedChildId)
  );
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleAdd = useCallback(() => {
    if (!selectedChildId || !name) return;
    const record: ChildMedication = {
      id: crypto.randomUUID(),
      childId: selectedChildId,
      name,
      dosage: dosage || undefined,
      frequency: frequency || undefined,
      startDate,
      endDate: endDate || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };
    const all = [...getRecords(), record];
    saveRecords(all);
    setRecords(all.filter((r) => r.childId === selectedChildId));
    setShowForm(false);
    setName("");
    setDosage("");
    setFrequency("");
    setEndDate("");
    setNotes("");
  }, [selectedChildId, name, dosage, frequency, startDate, endDate, notes]);

  const handleDelete = useCallback(
    (id: string) => {
      const all = getRecords().filter((r) => r.id !== id);
      saveRecords(all);
      setRecords(all.filter((r) => r.childId === selectedChildId));
    },
    [selectedChildId]
  );

  if (!selectedChild) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">아이를 먼저 등록해주세요</p>
          <Link href="/baby" className="mt-4 inline-block text-pink-500 hover:underline">← 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/baby" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-bold text-gray-800 dark:text-gray-100">💊 투약 기록</span>
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-pink-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-pink-600"
          >
            + 추가
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-4 space-y-4">
        {showForm && (
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <h3 className="mb-3 font-bold text-gray-900 dark:text-gray-100">투약 기록 추가</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">약 이름 *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" placeholder="예: 타이레놀 시럽" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">용량</label>
                  <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" placeholder="예: 5ml" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">복용 빈도</label>
                  <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" placeholder="예: 하루 3회" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">시작일</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">종료일</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">메모</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" placeholder="선택사항" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300">취소</button>
                <button onClick={handleAdd} className="flex-1 rounded-lg bg-pink-500 px-3 py-2 text-sm font-medium text-white hover:bg-pink-600">저장</button>
              </div>
            </div>
          </div>
        )}

        {records.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
            <div className="text-4xl mb-3">💊</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">투약 기록이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.name}</span>
                    {r.dosage && <span className="text-xs text-gray-500">{r.dosage}</span>}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {r.startDate}{r.endDate && ` ~ ${r.endDate}`}
                    {r.frequency && ` · ${r.frequency}`}
                  </div>
                  {r.notes && <div className="text-xs text-gray-400 mt-1">{r.notes}</div>}
                </div>
                <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="삭제">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
