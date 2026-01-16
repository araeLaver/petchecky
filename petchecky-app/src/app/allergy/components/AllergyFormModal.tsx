"use client";

import { useState } from "react";
import { Allergy, AllergyType, Severity } from "../types";
import { ALLERGY_TYPES, COMMON_SYMPTOMS, getSeverityColor, getSeverityLabel } from "../constants";

interface AllergyFormModalProps {
  onClose: () => void;
  onSubmit: (allergy: Omit<Allergy, "id" | "petId" | "reactions">) => void;
  allergens: Record<string, string[]>;
}

export default function AllergyFormModal({ onClose, onSubmit, allergens }: AllergyFormModalProps) {
  const [form, setForm] = useState({
    name: "",
    type: "food" as AllergyType,
    severity: "mild" as Severity,
    symptoms: [] as string[],
    diagnosedDate: "",
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
      name: form.name,
      type: form.type,
      severity: form.severity,
      symptoms: form.symptoms,
      diagnosedDate: form.diagnosedDate || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">알레르기 등록</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              알레르겐 유형
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALLERGY_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: type.value })}
                  className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
                    form.type === type.value
                      ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              알레르겐 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 닭고기, 꽃가루"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {allergens[form.type]?.slice(0, 5).map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm({ ...form, name: a })}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  {a}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              증상 (다중 선택)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map(symptom => (
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
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
