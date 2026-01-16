"use client";

import { useState } from "react";
import { AllergyReaction, Allergy } from "../types";
import { COMMON_SYMPTOMS, getSeverityColor, getSeverityLabel } from "../constants";

interface ReactionFormModalProps {
  allergy: Allergy;
  onClose: () => void;
  onSubmit: (reaction: Omit<AllergyReaction, "id" | "date">) => void;
}

export default function ReactionFormModal({ allergy, onClose, onSubmit }: ReactionFormModalProps) {
  const [form, setForm] = useState({
    trigger: "",
    symptoms: [] as string[],
    severity: "mild" as AllergyReaction["severity"],
    treatment: "",
    notes: "",
  });

  const toggleSymptom = (symptom: string) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      trigger: form.trigger || undefined,
      symptoms: form.symptoms,
      severity: form.severity,
      treatment: form.treatment || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">반응 기록</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{allergy.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              촉발 요인
            </label>
            <input
              type="text"
              value={form.trigger}
              onChange={(e) => setForm({ ...form, trigger: e.target.value })}
              placeholder="예: 새 간식, 산책 후"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              증상
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.slice(0, 8).map(symptom => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    form.symptoms.includes(symptom)
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              심각도
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["mild", "moderate", "severe"] as const).map(sev => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setForm({ ...form, severity: sev })}
                  className={`p-2 rounded-lg text-sm ${
                    form.severity === sev
                      ? getSeverityColor(sev)
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {getSeverityLabel(sev)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              치료/대처
            </label>
            <input
              type="text"
              value={form.treatment}
              onChange={(e) => setForm({ ...form, treatment: e.target.value })}
              placeholder="예: 항히스타민제 투여"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
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
              기록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
