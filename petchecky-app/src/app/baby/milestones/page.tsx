"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useChildStore } from "@/stores/childStore";
import MilestoneChecklist from "@/components/baby/MilestoneChecklist";
import type { MilestoneRecord } from "@/types/baby";

const STORAGE_KEY = "petchecky-baby-milestones";

function getRecords(): MilestoneRecord[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveRecords(records: MilestoneRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export default function MilestonesPage() {
  const { children, selectedChildId } = useChildStore();
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const [records, setRecords] = useState<MilestoneRecord[]>(() =>
    getRecords().filter((r) => r.childId === selectedChildId)
  );

  const handleToggle = useCallback(
    (milestoneKey: string, achieved: boolean) => {
      if (!selectedChildId) return;
      const all = getRecords();
      const existing = all.findIndex(
        (r) => r.childId === selectedChildId && r.milestoneKey === milestoneKey
      );

      if (achieved) {
        if (existing >= 0) {
          all[existing].achievedDate = new Date().toISOString().split("T")[0];
        } else {
          all.push({
            id: crypto.randomUUID(),
            childId: selectedChildId,
            milestoneKey,
            achievedDate: new Date().toISOString().split("T")[0],
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        if (existing >= 0) {
          all[existing].achievedDate = undefined;
        }
      }

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
            <span className="font-bold text-gray-800 dark:text-gray-100">🏆 발달 마일스톤</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-4">
        <MilestoneChecklist
          childId={selectedChildId!}
          birthDate={selectedChild.birthDate}
          records={records}
          onToggle={handleToggle}
        />
      </div>
    </div>
  );
}
