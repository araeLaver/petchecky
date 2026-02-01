"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ChildProfile } from "@/types/baby";

interface BabyDashboardProps {
  child: ChildProfile;
}

export default function BabyDashboard({ child }: BabyDashboardProps) {
  const ageInfo = useMemo(() => {
    const birth = new Date(child.birthDate);
    const now = new Date();
    const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return { totalMonths, years, months, totalDays };
  }, [child.birthDate]);

  const menuItems = [
    { href: "/baby", icon: "💬", label: "AI 육아 상담", color: "bg-pink-50 dark:bg-pink-900/20", textColor: "text-pink-600 dark:text-pink-400" },
    { href: "/baby/growth", icon: "📈", label: "성장 기록", color: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-600 dark:text-blue-400" },
    { href: "/baby/feeding", icon: "🍼", label: "수유 기록", color: "bg-orange-50 dark:bg-orange-900/20", textColor: "text-orange-600 dark:text-orange-400" },
    { href: "/baby/sleep", icon: "💤", label: "수면 기록", color: "bg-indigo-50 dark:bg-indigo-900/20", textColor: "text-indigo-600 dark:text-indigo-400" },
    { href: "/baby/diaper", icon: "👶", label: "기저귀 기록", color: "bg-yellow-50 dark:bg-yellow-900/20", textColor: "text-yellow-600 dark:text-yellow-400" },
    { href: "/baby/vaccination", icon: "💉", label: "예방접종", color: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-600 dark:text-green-400" },
    { href: "/baby/milestones", icon: "🏆", label: "발달 마일스톤", color: "bg-purple-50 dark:bg-purple-900/20", textColor: "text-purple-600 dark:text-purple-400" },
    { href: "/baby/medication", icon: "💊", label: "투약 기록", color: "bg-red-50 dark:bg-red-900/20", textColor: "text-red-600 dark:text-red-400" },
    { href: "/baby/image-analysis", icon: "📷", label: "증상 이미지 분석", color: "bg-teal-50 dark:bg-teal-900/20", textColor: "text-teal-600 dark:text-teal-400" },
    { href: "/baby/emergency", icon: "🚨", label: "소아과 응급", color: "bg-rose-50 dark:bg-rose-900/20", textColor: "text-rose-600 dark:text-rose-400" },
    { href: "/baby/growth-report", icon: "📄", label: "성장 리포트", color: "bg-gray-50 dark:bg-gray-900/20", textColor: "text-gray-600 dark:text-gray-400" },
  ];

  return (
    <div className="space-y-6">
      {/* 아이 프로필 카드 */}
      <div className="rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
            {child.gender === "male" ? "👦" : "👧"}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{child.name}</h2>
            <p className="text-sm text-white/90">
              {ageInfo.totalDays}일 ({ageInfo.years > 0 ? `${ageInfo.years}년 ` : ""}{ageInfo.months}개월)
            </p>
            <p className="text-xs text-white/70">
              {new Date(child.birthDate).toLocaleDateString("ko-KR")} 출생
              {child.birthWeight && ` · ${child.birthWeight}kg`}
              {child.birthHeight && ` · ${child.birthHeight}cm`}
            </p>
          </div>
        </div>
      </div>

      {/* 메뉴 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-2 rounded-xl ${item.color} p-4 shadow-sm transition-transform hover:scale-[1.02]`}
          >
            <span className="text-3xl">{item.icon}</span>
            <span className={`text-sm font-medium ${item.textColor}`}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
