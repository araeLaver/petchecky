"use client";

import { Allergy } from "../types";
import { ALLERGY_TYPES, getSeverityColor, getSeverityLabel } from "../constants";

interface AllergyCardProps {
  allergy: Allergy;
  onDelete: (id: string) => void;
  onAddReaction: (allergy: Allergy) => void;
}

export default function AllergyCard({ allergy, onDelete, onAddReaction }: AllergyCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {ALLERGY_TYPES.find(t => t.value === allergy.type)?.icon}
            </span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{allergy.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(allergy.severity)}`}>
              {getSeverityLabel(allergy.severity)}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {ALLERGY_TYPES.find(t => t.value === allergy.type)?.label}
            {allergy.diagnosedDate && ` • 진단일: ${allergy.diagnosedDate}`}
          </p>
        </div>
        <button
          onClick={() => onDelete(allergy.id)}
          className="text-gray-400 hover:text-red-500"
          aria-label={`${allergy.name} 삭제`}
        >
          🗑️
        </button>
      </div>

      {/* Symptoms */}
      {allergy.symptoms.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {allergy.symptoms.map(symptom => (
            <span
              key={symptom}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300"
            >
              {symptom}
            </span>
          ))}
        </div>
      )}

      {/* Recent Reactions */}
      {allergy.reactions.length > 0 && (
        <div className="mb-3 p-3 bg-red-50 rounded-xl dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
            최근 반응 ({allergy.reactions.length}회)
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">
            마지막: {allergy.reactions[allergy.reactions.length - 1].date}
          </p>
        </div>
      )}

      {/* Add Reaction Button */}
      <button
        onClick={() => onAddReaction(allergy)}
        className="w-full py-2.5 rounded-xl bg-red-100 text-red-700 font-medium hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
      >
        + 반응 기록 추가
      </button>
    </div>
  );
}
