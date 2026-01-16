"use client";

import { useState } from "react";
import { DietaryRestriction } from "../types";

interface RestrictionFormModalProps {
  onClose: () => void;
  onSubmit: (restriction: Omit<DietaryRestriction, "id" | "petId">) => void;
}

const RESTRICTION_REASONS = [
  { value: "allergy" as const, label: "알레르기" },
  { value: "intolerance" as const, label: "불내증" },
  { value: "medical" as const, label: "의료적" },
  { value: "preference" as const, label: "기호" },
];

export default function RestrictionFormModal({ onClose, onSubmit }: RestrictionFormModalProps) {
  const [form, setForm] = useState({
    ingredient: "",
    reason: "allergy" as DietaryRestriction["reason"],
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ingredient: form.ingredient,
      reason: form.reason,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">식이 제한 추가</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              재료/성분 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.ingredient}
              onChange={(e) => setForm({ ...form, ingredient: e.target.value })}
              placeholder="예: 밀, 글루텐"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              제한 이유
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RESTRICTION_REASONS.map(reason => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => setForm({ ...form, reason: reason.value })}
                  className={`p-2 rounded-lg text-sm ${
                    form.reason === reason.value
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-gray-300 font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg bg-red-500 font-medium text-white hover:bg-red-600"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
