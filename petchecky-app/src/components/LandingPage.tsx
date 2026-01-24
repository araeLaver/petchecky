"use client";

import Link from "next/link";
import { PetProfile } from "@/app/page";
import { useLanguage } from "@/contexts/LanguageContext";

interface LandingPageProps {
  petProfile: PetProfile | null;
  onStartChat: () => void;
  onRegisterPet: () => void;
  onViewHistory: () => void;
  onViewReport: () => void;
  historyCount: number;
}

// FEATURES and COMMON_SYMPTOMS constants removed - using localized versions below

export default function LandingPage({
  petProfile,
  onStartChat,
  onRegisterPet,
  onViewHistory,
  onViewReport,
  historyCount,
}: LandingPageProps) {
  const { t } = useLanguage();

  const FEATURES_LOCALIZED = [
    {
      icon: "🔍",
      title: t.features.aiAnalysis.title,
      description: t.features.aiAnalysis.description,
    },
    {
      icon: "📷",
      title: t.features.imageAnalysis.title,
      description: t.features.imageAnalysis.description,
      link: "/image-analysis",
      badge: "Premium+",
    },
    {
      icon: "⚡",
      title: t.features.riskAssessment.title,
      description: t.features.riskAssessment.description,
    },
    {
      icon: "📋",
      title: t.features.chatHistory.title,
      description: t.features.chatHistory.description,
    },
    {
      icon: "💬",
      title: t.features.community.title,
      description: t.features.community.description,
      link: "/community",
    },
    {
      icon: "💉",
      title: t.features.vaccination.title,
      description: t.features.vaccination.description,
      link: "/vaccination",
    },
    {
      icon: "📊",
      title: t.features.healthTracking.title,
      description: t.features.healthTracking.description,
      link: "/health-tracking",
    },
    {
      icon: "🚶",
      title: t.features.walkTracking.title,
      description: t.features.walkTracking.description,
      link: "/walk",
    },
    {
      icon: "📸",
      title: t.features.gallery.title,
      description: t.features.gallery.description,
      link: "/gallery",
    },
    {
      icon: "⭐",
      title: t.features.hospitalReview.title,
      description: t.features.hospitalReview.description,
      link: "/hospital-review",
    },
    {
      icon: "💬",
      title: t.features.messages.title,
      description: t.features.messages.description,
      link: "/messages",
      comingSoon: true,
    },
    {
      icon: "🍽️",
      title: t.features.diet.title,
      description: t.features.diet.description,
      link: "/diet",
    },
    {
      icon: "🛡️",
      title: t.features.insurance.title,
      description: t.features.insurance.description,
      link: "/insurance",
      comingSoon: true,
    },
    {
      icon: "🔔",
      title: t.features.reminders.title,
      description: t.features.reminders.description,
      link: "/reminders",
    },
    {
      icon: "💾",
      title: t.features.backup.title,
      description: t.features.backup.description,
      link: "/settings/backup",
    },
    {
      icon: "📆",
      title: t.features.calendar.title,
      description: t.features.calendar.description,
      link: "/calendar",
    },
    {
      icon: "🚨",
      title: t.features.emergency.title,
      description: t.features.emergency.description,
      link: "/emergency",
    },
    {
      icon: "📱",
      title: t.features.qrPetId.title,
      description: t.features.qrPetId.description,
      link: "/qr-pet-id",
    },
    {
      icon: "🏥",
      title: t.features.hospital.title,
      description: t.features.hospital.description,
      link: "/hospital",
    },
    {
      icon: "🧑‍🤝‍🧑",
      title: t.features.petSitter.title,
      description: t.features.petSitter.description,
      link: "/pet-sitter",
      comingSoon: true,
    },
    {
      icon: "💊",
      title: t.features.medication.title,
      description: t.features.medication.description,
      link: "/medication",
    },
    {
      icon: "🎓",
      title: t.features.training.title,
      description: t.features.training.description,
      link: "/training",
    },
    {
      icon: "🚫",
      title: t.features.allergy.title,
      description: t.features.allergy.description,
      link: "/allergy",
    },
    {
      icon: "💰",
      title: t.features.expense.title,
      description: t.features.expense.description,
      link: "/expense",
    },
    {
      icon: "📝",
      title: t.features.vetRecords.title,
      description: t.features.vetRecords.description,
      link: "/vet-records",
    },
    {
      icon: "🤖",
      title: t.features.healthInsights.title,
      description: t.features.healthInsights.description,
      link: "/health-insights",
    },
  ];

  const SYMPTOMS_LOCALIZED = [
    { emoji: "🤮", label: t.symptoms.vomiting },
    { emoji: "💩", label: t.symptoms.diarrhea },
    { emoji: "😫", label: t.symptoms.lossOfAppetite },
    { emoji: "🤒", label: t.symptoms.fever },
    { emoji: "🦵", label: t.symptoms.limping },
    { emoji: "😴", label: t.symptoms.lethargy },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Section */}
      <section className="px-4 py-12 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-7xl">🐾</div>
          <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-gray-100">{t.common.appName}</h1>
          <p className="mb-2 text-xl text-blue-600 font-medium dark:text-blue-400">
            {t.common.tagline}
          </p>
          <p className="mb-8 text-gray-500 leading-relaxed whitespace-pre-line dark:text-gray-400">
            {t.landing.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {petProfile ? (
              <button
                onClick={onStartChat}
                className="rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl active:scale-95"
              >
                {t.landing.startChat}
              </button>
            ) : (
              <button
                onClick={onRegisterPet}
                className="rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl active:scale-95"
              >
                {t.landing.registerPet}
              </button>
            )}

            {historyCount > 0 && (
              <>
                <button
                  onClick={onViewHistory}
                  className="rounded-full border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95"
                >
                  {t.landing.chatHistory} ({historyCount})
                </button>
                <button
                  onClick={onViewReport}
                  className="rounded-full border-2 border-blue-300 bg-blue-50 px-8 py-4 text-lg font-semibold text-blue-700 transition-all hover:border-blue-400 hover:bg-blue-100 active:scale-95"
                >
                  {t.landing.healthReport}
                </button>
              </>
            )}
          </div>

          {petProfile && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <span>{petProfile.species === "dog" ? "🐕" : "🐈"}</span>
              <span className="font-medium">{petProfile.name}</span>
              <span className="text-blue-400 dark:text-blue-500">|</span>
              <span>{petProfile.breed} · {petProfile.age}{t.pet.years} · {petProfile.weight}{t.pet.kg}</span>
            </div>
          )}
        </div>
      </section>

      {/* Common Symptoms Section */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-10 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-center text-lg font-semibold text-gray-700 dark:text-gray-300">
            {t.landing.symptomsQuestion}
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {SYMPTOMS_LOCALIZED.map((symptom) => (
              <button
                key={symptom.label}
                onClick={() => {
                  if (!petProfile) {
                    onRegisterPet();
                  } else {
                    onStartChat();
                  }
                }}
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95 dark:bg-gray-800 dark:shadow-gray-900"
              >
                <span className="text-2xl">{symptom.emoji}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{symptom.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-xl font-bold text-gray-800 dark:text-gray-100">
            {t.landing.featuresTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES_LOCALIZED.map((feature) => {
              const content = (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{feature.icon}</span>
                    <div className="flex gap-1">
                      {"comingSoon" in feature && feature.comingSoon && (
                        <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {t.common.comingSoon}
                        </span>
                      )}
                      {"badge" in feature && feature.badge && (
                        <span className="inline-block rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {feature.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-400">{feature.description}</p>
                  {"link" in feature && (
                    <p className="mt-2 text-sm text-blue-500 font-medium dark:text-blue-400">바로가기 →</p>
                  )}
                </>
              );

              if ("link" in feature && feature.link) {
                return (
                  <Link
                    key={feature.title}
                    href={feature.link}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition-all dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vet Consultation Banner */}
      <section className="border-t border-gray-100 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-8 dark:border-gray-800">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-4xl mb-3">👨‍⚕️</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {t.vetConsultation.title}
          </h2>
          <p className="text-blue-100 mb-4">
            {t.vetConsultation.subtitle}
          </p>
          <Link
            href="/vet-consultation"
            className="inline-block rounded-full bg-white px-6 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-50 hover:scale-105 active:scale-95"
          >
            {t.vetConsultation.startConsult}
          </Link>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="border-t border-gray-100 bg-amber-50 px-4 py-6 dark:border-gray-800 dark:bg-amber-900/20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t.disclaimer.main}
            <br />
            {t.disclaimer.emergency}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-6 dark:border-gray-800">
        <div className="mx-auto max-w-2xl text-center text-xs text-gray-400 dark:text-gray-500">
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
