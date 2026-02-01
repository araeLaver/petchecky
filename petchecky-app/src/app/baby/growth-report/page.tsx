"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateGrowthReportPDF } from "@/lib/utils/growth-report-pdf";
import type { ChildProfile, GrowthRecord, ChildVaccination, MilestoneRecord } from "@/types/baby";

const STORAGE_KEYS = {
  children: "petchecky-baby-children",
  growth: "petchecky-baby-growth",
  vaccinations: "petchecky-baby-vaccinations",
  milestones: "petchecky-baby-milestones",
};

export default function GrowthReportPage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.children);
    if (stored) {
      const parsed: ChildProfile[] = JSON.parse(stored);
      setChildren(parsed);
      if (parsed.length > 0) setSelectedChildId(parsed[0].id);
    }
  }, []);

  const handleExport = () => {
    const child = children.find((c) => c.id === selectedChildId);
    if (!child) return;

    const growthRecords: GrowthRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.growth) || "[]"
    ).filter((r: GrowthRecord) => r.childId === child.id);

    const vaccinations: ChildVaccination[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.vaccinations) || "[]"
    ).filter((v: ChildVaccination) => v.childId === child.id);

    const milestones: MilestoneRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.milestones) || "[]"
    ).filter((m: MilestoneRecord) => m.childId === child.id);

    generateGrowthReportPDF({ child, growthRecords, vaccinations, milestones });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link href="/baby" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            &larr;
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            성장 리포트 내보내기
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {children.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">등록된 아이가 없습니다.</p>
            <Link
              href="/baby"
              className="mt-4 inline-block rounded-full bg-pink-500 px-6 py-2 text-sm font-medium text-white"
            >
              아이 등록하기
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                리포트 대상 선택
              </h2>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-pink-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                포함 항목
              </h2>
              <ul className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>- 기본 프로필 정보 (이름, 생년월일, 성별)</li>
                <li>- 성장 기록 (체중, 신장, 머리둘레)</li>
                <li>- 예방접종 현황 (완료/예정)</li>
                <li>- 달성한 발달 마일스톤</li>
              </ul>
              <button
                onClick={handleExport}
                disabled={!selectedChildId}
                className="w-full rounded-xl bg-pink-500 py-3 text-sm font-semibold text-white hover:bg-pink-600 disabled:bg-gray-300 transition-colors"
              >
                PDF로 내보내기 (인쇄)
              </button>
              <p className="mt-2 text-xs text-gray-400 text-center">
                브라우저 인쇄 대화상자에서 &quot;PDF로 저장&quot;을 선택하세요
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
