"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useChildStore } from "@/stores/childStore";
import type { GrowthRecord } from "@/types/baby";

const GrowthChart = dynamic(() => import("@/components/baby/GrowthChart"), { ssr: false });

const STORAGE_KEY = "petchecky-baby-growth";

function getRecords(): GrowthRecord[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveRecords(records: GrowthRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export default function GrowthPage() {
  const { children, selectedChildId } = useChildStore();
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const [records, setRecords] = useState<GrowthRecord[]>(() => getRecords().filter((r) => r.childId === selectedChildId));
  const [showForm, setShowForm] = useState(false);
  const [chartType, setChartType] = useState<"weight" | "height">("weight");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [headCirc, setHeadCirc] = useState("");

  const handleAdd = useCallback(() => {
    if (!selectedChildId) return;
    const record: GrowthRecord = {
      id: crypto.randomUUID(),
      childId: selectedChildId,
      date,
      weight: weight ? parseFloat(weight) : undefined,
      height: height ? parseFloat(height) : undefined,
      headCircumference: headCirc ? parseFloat(headCirc) : undefined,
      createdAt: new Date().toISOString(),
    };
    const all = [...getRecords(), record];
    saveRecords(all);
    setRecords(all.filter((r) => r.childId === selectedChildId));
    setShowForm(false);
    setWeight("");
    setHeight("");
    setHeadCirc("");
  }, [selectedChildId, date, weight, height, headCirc]);

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
            <span className="font-bold text-gray-800 dark:text-gray-100">📈 성장 기록</span>
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-pink-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-pink-600"
          >
            + 기록 추가
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-4 space-y-4">
        {/* Chart type toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setChartType("weight")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${chartType === "weight" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}
          >
            체중 (kg)
          </button>
          <button
            onClick={() => setChartType("height")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${chartType === "height" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}
          >
            신장 (cm)
          </button>
        </div>

        {/* Growth Chart */}
        <GrowthChart
          records={records}
          gender={selectedChild.gender}
          birthDate={selectedChild.birthDate}
          type={chartType}
        />

        {/* Add form */}
        {showForm && (
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <h3 className="mb-3 font-bold text-gray-900 dark:text-gray-100">성장 기록 추가</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">날짜</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">체중 (kg)</label>
                  <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" placeholder="5.5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">신장 (cm)</label>
                  <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" placeholder="60" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">머리둘레 (cm)</label>
                  <input type="number" step="0.1" value={headCirc} onChange={(e) => setHeadCirc(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" placeholder="38" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300">취소</button>
                <button onClick={handleAdd} className="flex-1 rounded-lg bg-pink-500 px-3 py-2 text-sm font-medium text-white hover:bg-pink-600">저장</button>
              </div>
            </div>
          </div>
        )}

        {/* Records list */}
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 className="mb-3 font-bold text-gray-900 dark:text-gray-100">기록 목록</h3>
          {records.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">성장 기록이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.date}</span>
                  <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                    {r.weight && <span>{r.weight}kg</span>}
                    {r.height && <span>{r.height}cm</span>}
                    {r.headCircumference && <span>머리 {r.headCircumference}cm</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
