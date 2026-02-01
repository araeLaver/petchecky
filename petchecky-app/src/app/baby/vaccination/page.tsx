"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useChildStore } from "@/stores/childStore";
import { generateVaccinationSchedule } from "@/lib/constants/baby-vaccinations";
import type { ChildVaccination } from "@/types/baby";

const STORAGE_KEY = "petchecky-baby-vaccinations";

function getCompletedVaccinations(): ChildVaccination[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCompletedVaccinations(records: ChildVaccination[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export default function BabyVaccinationPage() {
  const { children, selectedChildId } = useChildStore();
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const [completed, setCompleted] = useState<ChildVaccination[]>(() =>
    getCompletedVaccinations().filter((r) => r.childId === selectedChildId)
  );
  const [filter, setFilter] = useState<"all" | "upcoming" | "overdue" | "completed">("all");

  const schedule = useMemo(() => {
    if (!selectedChild) return [];
    return generateVaccinationSchedule(selectedChild.birthDate);
  }, [selectedChild]);

  const completedKeys = useMemo(
    () => new Set(completed.map((c) => `${c.vaccineKey}-${c.doseNumber}`)),
    [completed]
  );

  const now = new Date();

  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      const key = `${item.vaccineKey}-${item.doseNumber}`;
      const isCompleted = completedKeys.has(key);
      const isOverdue = new Date(item.rangeEnd) < now && !isCompleted;
      const isUpcoming = new Date(item.scheduledDate) > now && !isCompleted;

      switch (filter) {
        case "completed": return isCompleted;
        case "overdue": return isOverdue;
        case "upcoming": return isUpcoming;
        default: return true;
      }
    });
  }, [schedule, completedKeys, filter, now]);

  const handleToggle = (vaccineKey: string, doseNumber: number, vaccineName: string, scheduledDate: string) => {
    const key = `${vaccineKey}-${doseNumber}`;
    if (completedKeys.has(key)) {
      const updated = completed.filter((c) => !(c.vaccineKey === vaccineKey && c.doseNumber === doseNumber));
      setCompleted(updated);
      saveCompletedVaccinations(updated);
    } else {
      const record: ChildVaccination = {
        id: crypto.randomUUID(),
        childId: selectedChildId!,
        vaccineKey,
        vaccineName,
        doseNumber,
        scheduledDate,
        completedDate: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
      };
      const updated = [...completed, record];
      setCompleted(updated);
      saveCompletedVaccinations(updated);
    }
  };

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

  const overdueCount = schedule.filter(
    (item) => new Date(item.rangeEnd) < now && !completedKeys.has(`${item.vaccineKey}-${item.doseNumber}`)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/baby" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-bold text-gray-800 dark:text-gray-100">💉 예방접종</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-4 space-y-4">
        {/* Summary */}
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{completed.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">접종 완료</div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {schedule.length - completed.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">남은 접종</div>
            </div>
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{overdueCount}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">지연</div>
            </div>
          </div>
        </div>

        {overdueCount > 0 && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            ⚠️ {overdueCount}건의 예방접종이 권장 기간을 지났습니다. 소아과에 문의하세요.
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          {(["all", "upcoming", "overdue", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {f === "all" ? "전체" : f === "upcoming" ? "예정" : f === "overdue" ? "지연" : "완료"}
            </button>
          ))}
        </div>

        {/* Schedule list */}
        <div className="space-y-2">
          {filteredSchedule.map((item) => {
            const key = `${item.vaccineKey}-${item.doseNumber}`;
            const isCompleted = completedKeys.has(key);
            const isOverdue = new Date(item.rangeEnd) < now && !isCompleted;

            return (
              <div
                key={key}
                className={`flex items-center gap-3 rounded-xl p-3 shadow-sm ${
                  isCompleted
                    ? "bg-green-50 dark:bg-green-900/10"
                    : isOverdue
                    ? "bg-red-50 dark:bg-red-900/10"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <button
                  onClick={() => handleToggle(item.vaccineKey, item.doseNumber, item.vaccineName, item.scheduledDate)}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    isCompleted ? "border-green-500 bg-green-500 text-white" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isCompleted && (
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isCompleted ? "text-green-700 dark:text-green-300 line-through" : "text-gray-900 dark:text-gray-100"}`}>
                      {item.vaccineName}
                    </span>
                    <span className="text-xs text-gray-500">{item.doseLabel}</span>
                    {item.required && (
                      <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">필수</span>
                    )}
                    {isOverdue && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">지연</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    권장: {item.scheduledDate} (가능: {item.rangeStart} ~ {item.rangeEnd})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
