"use client";

import { useState, useMemo } from "react";
import { MILESTONES, MILESTONE_CATEGORY_LABELS } from "@/lib/constants/milestones";
import type { MilestoneRecord, MilestoneCategory } from "@/types/baby";

interface MilestoneChecklistProps {
  childId: string;
  birthDate: string;
  records: MilestoneRecord[];
  onToggle: (milestoneKey: string, achieved: boolean) => void;
}

export default function MilestoneChecklist({ childId, birthDate, records, onToggle }: MilestoneChecklistProps) {
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory | "all">("all");

  const ageMonths = useMemo(() => {
    const birth = new Date(birthDate);
    const now = new Date();
    return Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  }, [birthDate]);

  const achievedKeys = useMemo(
    () => new Set(records.filter((r) => r.achievedDate).map((r) => r.milestoneKey)),
    [records]
  );

  const filteredMilestones = useMemo(() => {
    let items = MILESTONES.filter((m) => m.ageMonths <= ageMonths + 6);
    if (selectedCategory !== "all") {
      items = items.filter((m) => m.category === selectedCategory);
    }
    return items;
  }, [ageMonths, selectedCategory]);

  const completionRate = useMemo(() => {
    const relevant = MILESTONES.filter((m) => m.ageMonths <= ageMonths);
    if (relevant.length === 0) return 0;
    const achieved = relevant.filter((m) => achievedKeys.has(m.key)).length;
    return Math.round((achieved / relevant.length) * 100);
  }, [ageMonths, achievedKeys]);

  const categories: (MilestoneCategory | "all")[] = ["all", "gross_motor", "fine_motor", "language", "social", "cognitive"];

  const categoryLabel = (cat: MilestoneCategory | "all") => {
    if (cat === "all") return "전체";
    return MILESTONE_CATEGORY_LABELS[cat].ko;
  };

  const categoryIcon = (cat: MilestoneCategory) => {
    switch (cat) {
      case "gross_motor": return "🏃";
      case "fine_motor": return "✋";
      case "language": return "💬";
      case "social": return "👫";
      case "cognitive": return "🧠";
    }
  };

  // Group by age range
  const grouped = useMemo(() => {
    const groups: { label: string; items: typeof filteredMilestones }[] = [];
    const ranges = [
      { label: "0-3개월", min: 0, max: 3 },
      { label: "4-6개월", min: 4, max: 6 },
      { label: "7-9개월", min: 7, max: 9 },
      { label: "10-12개월", min: 10, max: 12 },
      { label: "13-18개월", min: 13, max: 18 },
      { label: "19-24개월", min: 19, max: 24 },
      { label: "25-36개월", min: 25, max: 36 },
    ];

    for (const range of ranges) {
      const items = filteredMilestones.filter(
        (m) => m.ageMonths >= range.min && m.ageMonths <= range.max
      );
      if (items.length > 0) {
        groups.push({ label: range.label, items });
      }
    }
    return groups;
  }, [filteredMilestones]);

  return (
    <div className="space-y-4">
      {/* 진행 현황 */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">발달 체크리스트</h3>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">현재 {ageMonths}개월 기준</span>
          <span className="font-medium text-pink-600 dark:text-pink-400">{completionRate}% 달성</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {cat !== "all" && categoryIcon(cat as MilestoneCategory)} {categoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* 마일스톤 목록 */}
      {grouped.map((group) => (
        <div key={group.label}>
          <h4 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{group.label}</h4>
          <div className="space-y-1.5">
            {group.items.map((milestone) => {
              const isAchieved = achievedKeys.has(milestone.key);
              const isOverdue = milestone.ageMonths <= ageMonths && !isAchieved;

              return (
                <button
                  key={milestone.key}
                  onClick={() => onToggle(milestone.key, !isAchieved)}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                    isAchieved
                      ? "bg-green-50 dark:bg-green-900/20"
                      : isOverdue
                      ? "bg-orange-50 dark:bg-orange-900/10"
                      : "bg-white dark:bg-gray-800"
                  } shadow-sm`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      isAchieved
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isAchieved && (
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{categoryIcon(milestone.category)}</span>
                      <span className={`text-sm font-medium ${isAchieved ? "text-green-700 dark:text-green-300" : "text-gray-900 dark:text-gray-100"}`}>
                        {milestone.title}
                      </span>
                      {isOverdue && (
                        <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-xs text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                          확인 필요
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{milestone.description}</p>
                  </div>
                  <span className="text-xs text-gray-400">{milestone.ageMonths}개월</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
