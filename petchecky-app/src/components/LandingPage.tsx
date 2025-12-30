"use client";

import { PetProfile } from "@/app/page";

interface LandingPageProps {
  petProfile: PetProfile | null;
  onStartChat: () => void;
  onRegisterPet: () => void;
  onViewHistory: () => void;
  historyCount: number;
}

const FEATURES = [
  {
    icon: "🔍",
    title: "AI 증상 분석",
    description: "반려동물의 증상을 입력하면 AI가 가능한 원인과 대응 방법을 안내해드려요.",
  },
  {
    icon: "⚡",
    title: "위험도 자동 판단",
    description: "증상의 심각도를 분석하여 병원 방문이 필요한지 알려드려요.",
  },
  {
    icon: "📋",
    title: "상담 기록 저장",
    description: "이전 상담 내역을 저장하고, 언제든 다시 확인할 수 있어요.",
  },
  {
    icon: "🐕",
    title: "맞춤형 상담",
    description: "반려동물의 종류, 품종, 나이, 체중을 고려한 맞춤 상담을 제공해요.",
  },
];

const COMMON_SYMPTOMS = [
  { emoji: "🤮", label: "구토" },
  { emoji: "💩", label: "설사" },
  { emoji: "😫", label: "식욕부진" },
  { emoji: "🤒", label: "발열" },
  { emoji: "🦵", label: "절뚝거림" },
  { emoji: "😴", label: "무기력" },
];

export default function LandingPage({
  petProfile,
  onStartChat,
  onRegisterPet,
  onViewHistory,
  historyCount,
}: LandingPageProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Section */}
      <section className="px-4 py-12 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-7xl">🐾</div>
          <h1 className="mb-4 text-4xl font-bold text-gray-800">펫체키</h1>
          <p className="mb-2 text-xl text-blue-600 font-medium">
            AI가 체크하는 우리 아이 건강
          </p>
          <p className="mb-8 text-gray-500 leading-relaxed">
            반려동물이 아파 보일 때, 걱정되는 증상이 있을 때
            <br />
            AI가 증상을 분석하고 적절한 대응 방법을 알려드립니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {petProfile ? (
              <button
                onClick={onStartChat}
                className="rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl active:scale-95"
              >
                💬 상담 시작하기
              </button>
            ) : (
              <button
                onClick={onRegisterPet}
                className="rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl active:scale-95"
              >
                🐾 우리 아이 등록하기
              </button>
            )}

            {historyCount > 0 && (
              <button
                onClick={onViewHistory}
                className="rounded-full border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95"
              >
                📋 상담 기록 ({historyCount})
              </button>
            )}
          </div>

          {petProfile && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
              <span>{petProfile.species === "dog" ? "🐕" : "🐈"}</span>
              <span className="font-medium">{petProfile.name}</span>
              <span className="text-blue-400">|</span>
              <span>{petProfile.breed} · {petProfile.age}세 · {petProfile.weight}kg</span>
            </div>
          )}
        </div>
      </section>

      {/* Common Symptoms Section */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-center text-lg font-semibold text-gray-700">
            이런 증상이 있으신가요?
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {COMMON_SYMPTOMS.map((symptom) => (
              <button
                key={symptom.label}
                onClick={() => {
                  if (!petProfile) {
                    onRegisterPet();
                  } else {
                    onStartChat();
                  }
                }}
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95"
              >
                <span className="text-2xl">{symptom.emoji}</span>
                <span className="text-sm font-medium text-gray-700">{symptom.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-xl font-bold text-gray-800">
            펫체키가 도와드려요
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 text-3xl">{feature.icon}</div>
                <h3 className="mb-2 font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="border-t border-gray-100 bg-amber-50 px-4 py-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-amber-700">
            ⚠️ 펫체키는 참고용 정보를 제공하며, 정확한 진단은 수의사와 상담하세요.
            <br />
            응급 상황 시 가까운 동물병원을 방문해주세요.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-6">
        <div className="mx-auto max-w-2xl text-center text-xs text-gray-400">
          <p>© 2024 펫체키. AI 반려동물 건강 상담 서비스.</p>
        </div>
      </footer>
    </div>
  );
}
