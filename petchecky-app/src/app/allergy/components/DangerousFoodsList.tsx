"use client";

import { Pet } from "../types";
import { DANGEROUS_FOODS } from "../constants";

interface DangerousFoodsListProps {
  selectedPet: Pet | undefined;
}

export default function DangerousFoodsList({ selectedPet }: DangerousFoodsListProps) {
  const dangerousFoods = selectedPet ? DANGEROUS_FOODS[selectedPet.species] : DANGEROUS_FOODS.dog;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
        <p className="text-sm text-red-800 dark:text-red-300">
          ⚠️ 아래 식품들은 {selectedPet?.species === "cat" ? "고양이" : "강아지"}에게 <strong>절대 주면 안 됩니다</strong>
        </p>
      </div>

      <div className="space-y-3">
        {dangerousFoods.map(food => (
          <div
            key={food.name}
            className={`rounded-xl p-4 border ${
              food.danger === "high"
                ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                : food.danger === "medium"
                ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                : "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {food.danger === "high" ? "☠️" : food.danger === "medium" ? "⚠️" : "⚡"}
                </span>
                <div>
                  <p className={`font-bold ${
                    food.danger === "high"
                      ? "text-red-800 dark:text-red-300"
                      : food.danger === "medium"
                      ? "text-yellow-800 dark:text-yellow-300"
                      : "text-orange-800 dark:text-orange-300"
                  }`}>
                    {food.name}
                  </p>
                  <p className={`text-sm ${
                    food.danger === "high"
                      ? "text-red-600 dark:text-red-400"
                      : food.danger === "medium"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}>
                    {food.effect}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                food.danger === "high"
                  ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                  : food.danger === "medium"
                  ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                  : "bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
              }`}>
                {food.danger === "high" ? "치명적" : food.danger === "medium" ? "위험" : "주의"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>응급 상황 시:</strong> 즉시 동물병원에 연락하고, 섭취한 음식의 종류와 양을 알려주세요.
        </p>
      </div>
    </div>
  );
}
