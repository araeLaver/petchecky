"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmergencyGuide {
  id: string;
  icon: string;
  titleKey: string;
  severity: "critical" | "urgent" | "moderate";
  symptomsKeys: string[];
  firstAidKeys: string[];
  warningKeys: string[];
}

const EMERGENCY_GUIDES: EmergencyGuide[] = [
  {
    id: "choking",
    icon: "😰",
    titleKey: "choking",
    severity: "critical",
    symptomsKeys: ["chokingSymptom1", "chokingSymptom2", "chokingSymptom3"],
    firstAidKeys: ["chokingAid1", "chokingAid2", "chokingAid3", "chokingAid4"],
    warningKeys: ["chokingWarning1"],
  },
  {
    id: "poisoning",
    icon: "☠️",
    titleKey: "poisoning",
    severity: "critical",
    symptomsKeys: ["poisoningSymptom1", "poisoningSymptom2", "poisoningSymptom3", "poisoningSymptom4"],
    firstAidKeys: ["poisoningAid1", "poisoningAid2", "poisoningAid3"],
    warningKeys: ["poisoningWarning1", "poisoningWarning2"],
  },
  {
    id: "heatstroke",
    icon: "🥵",
    titleKey: "heatstroke",
    severity: "critical",
    symptomsKeys: ["heatstrokeSymptom1", "heatstrokeSymptom2", "heatstrokeSymptom3", "heatstrokeSymptom4"],
    firstAidKeys: ["heatstrokeAid1", "heatstrokeAid2", "heatstrokeAid3", "heatstrokeAid4"],
    warningKeys: ["heatstrokeWarning1"],
  },
  {
    id: "bleeding",
    icon: "🩸",
    titleKey: "bleeding",
    severity: "urgent",
    symptomsKeys: ["bleedingSymptom1", "bleedingSymptom2"],
    firstAidKeys: ["bleedingAid1", "bleedingAid2", "bleedingAid3"],
    warningKeys: ["bleedingWarning1"],
  },
  {
    id: "seizure",
    icon: "⚡",
    titleKey: "seizure",
    severity: "critical",
    symptomsKeys: ["seizureSymptom1", "seizureSymptom2", "seizureSymptom3"],
    firstAidKeys: ["seizureAid1", "seizureAid2", "seizureAid3", "seizureAid4"],
    warningKeys: ["seizureWarning1"],
  },
  {
    id: "fracture",
    icon: "🦴",
    titleKey: "fracture",
    severity: "urgent",
    symptomsKeys: ["fractureSymptom1", "fractureSymptom2", "fractureSymptom3"],
    firstAidKeys: ["fractureAid1", "fractureAid2", "fractureAid3"],
    warningKeys: ["fractureWarning1"],
  },
  {
    id: "eyeInjury",
    icon: "👁️",
    titleKey: "eyeInjury",
    severity: "urgent",
    symptomsKeys: ["eyeInjurySymptom1", "eyeInjurySymptom2", "eyeInjurySymptom3"],
    firstAidKeys: ["eyeInjuryAid1", "eyeInjuryAid2", "eyeInjuryAid3"],
    warningKeys: ["eyeInjuryWarning1"],
  },
  {
    id: "insectBite",
    icon: "🐝",
    titleKey: "insectBite",
    severity: "moderate",
    symptomsKeys: ["insectBiteSymptom1", "insectBiteSymptom2", "insectBiteSymptom3"],
    firstAidKeys: ["insectBiteAid1", "insectBiteAid2", "insectBiteAid3"],
    warningKeys: ["insectBiteWarning1"],
  },
];

const SEVERITY_STYLES = {
  critical: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  urgent: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
  moderate: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
};

export default function EmergencyPage() {
  const { t } = useLanguage();
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "urgent" | "moderate">("all");

  const filteredGuides = filter === "all"
    ? EMERGENCY_GUIDES
    : EMERGENCY_GUIDES.filter(g => g.severity === filter);

  const selectedGuideData = EMERGENCY_GUIDES.find(g => g.id === selectedGuide);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ←
          </Link>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {t.emergency.title}
          </h1>
        </div>
      </header>

      {/* Emergency Notice */}
      <div className="bg-red-500 px-4 py-3 text-center text-white">
        <p className="font-medium">{t.emergency.notice}</p>
        <p className="text-sm opacity-90">{t.emergency.callVet}</p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex overflow-x-auto">
          {(["all", "critical", "urgent", "moderate"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 whitespace-nowrap py-3 text-sm font-medium transition-colors ${
                filter === f
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {t.emergency.filters[f as keyof typeof t.emergency.filters]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4">
        {/* Guide List */}
        {!selectedGuide && (
          <div className="space-y-3">
            {filteredGuides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => setSelectedGuide(guide.id)}
                className={`w-full rounded-xl border p-4 text-left transition-all hover:shadow-md ${SEVERITY_STYLES[guide.severity]}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{guide.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {t.emergency.guides[guide.titleKey as keyof typeof t.emergency.guides]}
                    </h3>
                    <p className="text-sm opacity-80">
                      {t.emergency.severityLabels[guide.severity as keyof typeof t.emergency.severityLabels]}
                    </p>
                  </div>
                  <span className="text-xl">→</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Guide Detail */}
        {selectedGuide && selectedGuideData && (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedGuide(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              ← {t.common.back}
            </button>

            <div className={`rounded-xl border p-4 ${SEVERITY_STYLES[selectedGuideData.severity]}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{selectedGuideData.icon}</span>
                <div>
                  <h2 className="text-xl font-bold">
                    {t.emergency.guides[selectedGuideData.titleKey as keyof typeof t.emergency.guides]}
                  </h2>
                  <span className="text-sm">
                    {t.emergency.severityLabels[selectedGuideData.severity as keyof typeof t.emergency.severityLabels]}
                  </span>
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 dark:text-gray-100">
                <span>🔍</span> {t.emergency.symptoms}
              </h3>
              <ul className="space-y-2">
                {selectedGuideData.symptomsKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-red-500">•</span>
                    {t.emergency.symptomTexts[key as keyof typeof t.emergency.symptomTexts]}
                  </li>
                ))}
              </ul>
            </section>

            {/* First Aid */}
            <section className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2 dark:text-green-200">
                <span>🩹</span> {t.emergency.firstAid}
              </h3>
              <ol className="space-y-2">
                {selectedGuideData.firstAidKeys.map((key, index) => (
                  <li key={key} className="flex items-start gap-2 text-green-700 dark:text-green-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-200 text-xs font-bold text-green-800 dark:bg-green-700 dark:text-green-100">
                      {index + 1}
                    </span>
                    <span>{t.emergency.firstAidTexts[key as keyof typeof t.emergency.firstAidTexts]}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Warnings */}
            <section className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
              <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2 dark:text-yellow-200">
                <span>⚠️</span> {t.emergency.warnings}
              </h3>
              <ul className="space-y-2">
                {selectedGuideData.warningKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2 text-yellow-700 dark:text-yellow-300">
                    <span>!</span>
                    {t.emergency.warningTexts[key as keyof typeof t.emergency.warningTexts]}
                  </li>
                ))}
              </ul>
            </section>

            {/* Find Hospital Button */}
            <Link
              href="/?findHospital=true"
              className="block w-full rounded-xl bg-red-500 py-4 text-center font-semibold text-white hover:bg-red-600 transition-colors"
            >
              🏥 {t.hospital.find}
            </Link>
          </div>
        )}
      </main>

      {/* Disclaimer */}
      <footer className="border-t border-gray-200 bg-gray-100 px-4 py-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          {t.emergency.disclaimer}
        </p>
      </footer>
    </div>
  );
}
