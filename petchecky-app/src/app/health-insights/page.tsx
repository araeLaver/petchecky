"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

interface Pet {
  id: string;
  name: string;
  species: "dog" | "cat";
  breed: string;
  age: number;
  weight: number;
}

interface HealthData {
  petId: string;
  weights: { date: string; weight: number }[];
  vaccinations: { name: string; date: string; nextDate?: string }[];
  conditions: string[];
  lastCheckup?: string;
}

interface HealthInsight {
  id: string;
  type: "warning" | "info" | "success" | "alert";
  category: string;
  title: string;
  description: string;
  recommendation?: string;
  riskLevel?: "low" | "medium" | "high";
}

interface BreedHealthInfo {
  commonIssues: string[];
  lifeExpectancy: string;
  weightRange: { min: number; max: number };
  exerciseNeeds: string;
}

// Breed-specific health information database
const BREED_HEALTH_DATA: { [key: string]: BreedHealthInfo } = {
  // Dogs
  "골든 리트리버": {
    commonIssues: ["고관절 이형성증", "백내장", "심장질환", "피부 알레르기"],
    lifeExpectancy: "10-12년",
    weightRange: { min: 25, max: 34 },
    exerciseNeeds: "높음",
  },
  "시바 이누": {
    commonIssues: ["알레르기", "슬개골 탈구", "녹내장", "갑상선 질환"],
    lifeExpectancy: "12-15년",
    weightRange: { min: 8, max: 11 },
    exerciseNeeds: "중간",
  },
  "포메라니안": {
    commonIssues: ["슬개골 탈구", "기관허탈", "치아 문제", "탈모"],
    lifeExpectancy: "12-16년",
    weightRange: { min: 1.5, max: 3 },
    exerciseNeeds: "낮음",
  },
  "푸들": {
    commonIssues: ["슬개골 탈구", "백내장", "간질", "갑상선 질환"],
    lifeExpectancy: "12-15년",
    weightRange: { min: 3, max: 32 },
    exerciseNeeds: "중간",
  },
  "말티즈": {
    commonIssues: ["슬개골 탈구", "치아 문제", "눈물 자국", "저혈당"],
    lifeExpectancy: "12-15년",
    weightRange: { min: 2, max: 4 },
    exerciseNeeds: "낮음",
  },
  // Cats
  "페르시안": {
    commonIssues: ["다낭성 신장질환", "호흡기 문제", "눈 질환", "피부 질환"],
    lifeExpectancy: "12-17년",
    weightRange: { min: 3, max: 5.5 },
    exerciseNeeds: "낮음",
  },
  "러시안 블루": {
    commonIssues: ["비만", "요로 결석", "스트레스 질환"],
    lifeExpectancy: "15-20년",
    weightRange: { min: 3.5, max: 6 },
    exerciseNeeds: "중간",
  },
  "코리안 숏헤어": {
    commonIssues: ["비만", "치주 질환", "요로 질환"],
    lifeExpectancy: "12-18년",
    weightRange: { min: 3, max: 5 },
    exerciseNeeds: "중간",
  },
};

// Age-based health milestones
const AGE_MILESTONES = {
  dog: [
    { age: 1, message: "성장기 완료, 성견 사료로 전환 권장" },
    { age: 7, message: "시니어 건강검진 시작 권장" },
    { age: 10, message: "노령견 특별 관리 필요" },
  ],
  cat: [
    { age: 1, message: "성묘 사료로 전환 권장" },
    { age: 7, message: "중년 건강검진 시작 권장" },
    { age: 11, message: "시니어 건강검진 권장" },
  ],
};

export default function HealthInsightsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load pets
    const storedPets = localStorage.getItem("pets");
    if (storedPets) {
      const parsedPets = JSON.parse(storedPets);
      setPets(parsedPets);
      if (parsedPets.length > 0) {
        setSelectedPetId(parsedPets[0].id);
      }
    }

    // Load health data from various sources
    const storedHealthData = localStorage.getItem("petHealthData");
    if (storedHealthData) {
      setHealthData(JSON.parse(storedHealthData));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedPetId && pets.length > 0) {
      generateInsights();
    }
  }, [selectedPetId, pets, healthData]);

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  const generateInsights = () => {
    if (!selectedPet) return;

    const newInsights: HealthInsight[] = [];
    const petHealthData = healthData.find((h) => h.petId === selectedPetId);
    const breedInfo = BREED_HEALTH_DATA[selectedPet.breed];

    // Weight analysis
    if (breedInfo) {
      const { min, max } = breedInfo.weightRange;
      if (selectedPet.weight < min) {
        newInsights.push({
          id: "weight-low",
          type: "warning",
          category: "weight",
          title: t.healthInsights?.underweight || "저체중 주의",
          description: `${selectedPet.name}의 현재 체중(${selectedPet.weight}kg)이 품종 권장 범위(${min}-${max}kg)보다 낮습니다.`,
          recommendation: "수의사와 상담하여 적절한 영양 보충 방법을 확인하세요.",
          riskLevel: "medium",
        });
      } else if (selectedPet.weight > max * 1.2) {
        newInsights.push({
          id: "weight-high",
          type: "alert",
          category: "weight",
          title: t.healthInsights?.overweight || "비만 경고",
          description: `${selectedPet.name}의 현재 체중(${selectedPet.weight}kg)이 권장 범위를 20% 이상 초과합니다.`,
          recommendation: "식이 조절과 운동량 증가가 필요합니다. 수의사와 상담하세요.",
          riskLevel: "high",
        });
      } else if (selectedPet.weight > max) {
        newInsights.push({
          id: "weight-over",
          type: "warning",
          category: "weight",
          title: t.healthInsights?.slightlyOverweight || "약간 과체중",
          description: `${selectedPet.name}의 체중이 권장 범위보다 약간 높습니다.`,
          recommendation: "간식을 줄이고 운동량을 늘려보세요.",
          riskLevel: "low",
        });
      } else {
        newInsights.push({
          id: "weight-normal",
          type: "success",
          category: "weight",
          title: t.healthInsights?.healthyWeight || "건강한 체중",
          description: `${selectedPet.name}의 체중이 품종 권장 범위 내에 있습니다.`,
          riskLevel: "low",
        });
      }

      // Breed-specific health risks
      breedInfo.commonIssues.forEach((issue, index) => {
        newInsights.push({
          id: `breed-risk-${index}`,
          type: "info",
          category: "breed",
          title: `${issue} 주의`,
          description: `${selectedPet.breed}은(는) ${issue}에 취약할 수 있습니다.`,
          recommendation: "정기 검진 시 관련 검사를 받아보세요.",
          riskLevel: "medium",
        });
      });
    }

    // Age-based insights
    const milestones = AGE_MILESTONES[selectedPet.species];
    const applicableMilestone = milestones.find((m) => selectedPet.age >= m.age);
    if (applicableMilestone) {
      newInsights.push({
        id: "age-milestone",
        type: "info",
        category: "age",
        title: t.healthInsights?.ageAdvice || "나이별 건강 조언",
        description: applicableMilestone.message,
        riskLevel: "low",
      });
    }

    // Senior pet alert
    if (
      (selectedPet.species === "dog" && selectedPet.age >= 7) ||
      (selectedPet.species === "cat" && selectedPet.age >= 10)
    ) {
      newInsights.push({
        id: "senior-care",
        type: "warning",
        category: "age",
        title: t.healthInsights?.seniorCare || "시니어 케어 필요",
        description: `${selectedPet.name}은(는) 시니어 단계에 접어들었습니다.`,
        recommendation: "6개월마다 정기 검진을 받으시고, 관절 건강과 치아 건강에 특별히 신경 쓰세요.",
        riskLevel: "medium",
      });
    }

    // Vaccination reminder
    const storedVaccinations = localStorage.getItem("petVaccinations");
    if (storedVaccinations) {
      const vaccinations = JSON.parse(storedVaccinations);
      const petVaccinations = vaccinations.filter((v: { petId: string; nextDate?: string }) => v.petId === selectedPetId);
      const overdueVaccinations = petVaccinations.filter(
        (v: { nextDate?: string }) => v.nextDate && new Date(v.nextDate) < new Date()
      );
      if (overdueVaccinations.length > 0) {
        newInsights.push({
          id: "vaccination-overdue",
          type: "alert",
          category: "vaccination",
          title: t.healthInsights?.vaccinationOverdue || "예방접종 기한 초과",
          description: `${overdueVaccinations.length}개의 예방접종이 기한을 초과했습니다.`,
          recommendation: "가능한 빨리 동물병원을 방문하여 예방접종을 받으세요.",
          riskLevel: "high",
        });
      }
    }

    // Dental health reminder
    if (selectedPet.age >= 3) {
      newInsights.push({
        id: "dental-care",
        type: "info",
        category: "dental",
        title: t.healthInsights?.dentalCare || "치아 건강 관리",
        description: "정기적인 치아 관리가 전체 건강에 중요합니다.",
        recommendation: "치아 스케일링과 일상적인 양치질을 권장합니다.",
        riskLevel: "low",
      });
    }

    // Season-based advice
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8) {
      // Summer
      newInsights.push({
        id: "summer-care",
        type: "info",
        category: "seasonal",
        title: t.healthInsights?.summerCare || "여름철 건강 관리",
        description: "더운 날씨에 열사병과 탈수에 주의하세요.",
        recommendation: "항상 신선한 물을 제공하고, 한낮 산책을 피하세요.",
        riskLevel: "medium",
      });
    } else if (month >= 11 || month <= 1) {
      // Winter
      newInsights.push({
        id: "winter-care",
        type: "info",
        category: "seasonal",
        title: t.healthInsights?.winterCare || "겨울철 건강 관리",
        description: "추운 날씨에 관절 건강과 피부 건조에 주의하세요.",
        recommendation: "실내 온도를 적절히 유지하고, 피부 보습에 신경 쓰세요.",
        riskLevel: "low",
      });
    }

    setInsights(newInsights);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "alert":
        return "🚨";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "info":
      default:
        return "💡";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "alert":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800";
    }
  };

  const getRiskBadge = (level?: string) => {
    switch (level) {
      case "high":
        return (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
            {t.healthInsights?.highRisk || "높은 위험"}
          </span>
        );
      case "medium":
        return (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">
            {t.healthInsights?.mediumRisk || "중간 위험"}
          </span>
        );
      case "low":
        return (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
            {t.healthInsights?.lowRisk || "낮은 위험"}
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      weight: t.healthInsights?.categories?.weight || "체중",
      breed: t.healthInsights?.categories?.breed || "품종",
      age: t.healthInsights?.categories?.age || "나이",
      vaccination: t.healthInsights?.categories?.vaccination || "예방접종",
      dental: t.healthInsights?.categories?.dental || "치아",
      seasonal: t.healthInsights?.categories?.seasonal || "계절",
    };
    return labels[category] || category;
  };

  // Calculate health score
  const calculateHealthScore = () => {
    if (insights.length === 0) return 100;

    let score = 100;
    insights.forEach((insight) => {
      if (insight.type === "alert") score -= 15;
      else if (insight.type === "warning") score -= 8;
    });
    return Math.max(0, score);
  };

  const healthScore = calculateHealthScore();
  const breedInfo = selectedPet ? BREED_HEALTH_DATA[selectedPet.breed] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {t.healthInsights?.title || "AI 건강 인사이트"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.healthInsights?.subtitle || "맞춤형 건강 예측 및 조언"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {/* Pet Selector */}
        {pets.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedPetId === pet.id
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        )}

        {selectedPet ? (
          <>
            {/* Health Score Card */}
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{t.healthInsights?.healthScore || "건강 점수"}</p>
                  <p className="text-5xl font-bold">{healthScore}</p>
                  <p className="text-sm opacity-75">/100</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl mb-2">{selectedPet.species === "dog" ? "🐕" : "🐈"}</div>
                  <p className="font-medium">{selectedPet.name}</p>
                  <p className="text-sm opacity-75">
                    {selectedPet.age}{t.pet?.years || "세"} · {selectedPet.weight}kg
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 rounded-full bg-white/30">
                  <div
                    className={`h-full rounded-full transition-all ${
                      healthScore >= 80
                        ? "bg-green-400"
                        : healthScore >= 60
                        ? "bg-yellow-400"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Breed Info */}
            {breedInfo && (
              <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
                <h3 className="mb-3 font-semibold text-gray-800 dark:text-gray-200">
                  📊 {selectedPet.breed} {t.healthInsights?.breedInfo || "품종 정보"}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">{t.healthInsights?.lifeExpectancy || "기대 수명"}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{breedInfo.lifeExpectancy}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">{t.healthInsights?.idealWeight || "권장 체중"}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {breedInfo.weightRange.min}-{breedInfo.weightRange.max}kg
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">{t.healthInsights?.exerciseNeeds || "운동 필요량"}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{breedInfo.exerciseNeeds}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">{t.healthInsights?.commonIssues || "주의 질환"}</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{breedInfo.commonIssues.length}개</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-gray-800">
                <p className="text-2xl font-bold text-red-500">
                  {insights.filter((i) => i.type === "alert").length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.healthInsights?.alerts || "경고"}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-gray-800">
                <p className="text-2xl font-bold text-yellow-500">
                  {insights.filter((i) => i.type === "warning").length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.healthInsights?.warnings || "주의"}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-gray-800">
                <p className="text-2xl font-bold text-blue-500">
                  {insights.filter((i) => i.type === "info").length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.healthInsights?.tips || "팁"}</p>
              </div>
            </div>

            {/* Insights List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                {t.healthInsights?.insightsList || "건강 인사이트"}
              </h3>

              {/* Alerts first */}
              {insights
                .filter((i) => i.type === "alert")
                .map((insight) => (
                  <div
                    key={insight.id}
                    className={`rounded-2xl border p-4 ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            {insight.title}
                          </h4>
                          {getRiskBadge(insight.riskLevel)}
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                            {getCategoryLabel(insight.category)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {insight.description}
                        </p>
                        {insight.recommendation && (
                          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            💡 {insight.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {/* Warnings */}
              {insights
                .filter((i) => i.type === "warning")
                .map((insight) => (
                  <div
                    key={insight.id}
                    className={`rounded-2xl border p-4 ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            {insight.title}
                          </h4>
                          {getRiskBadge(insight.riskLevel)}
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                            {getCategoryLabel(insight.category)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {insight.description}
                        </p>
                        {insight.recommendation && (
                          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            💡 {insight.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {/* Info & Success */}
              {insights
                .filter((i) => i.type === "info" || i.type === "success")
                .map((insight) => (
                  <div
                    key={insight.id}
                    className={`rounded-2xl border p-4 ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            {insight.title}
                          </h4>
                          {getRiskBadge(insight.riskLevel)}
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                            {getCategoryLabel(insight.category)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {insight.description}
                        </p>
                        {insight.recommendation && (
                          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            💡 {insight.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                ⚠️ {t.healthInsights?.disclaimer || "이 정보는 참고용이며, 정확한 진단과 치료는 수의사와 상담하세요."}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center dark:bg-gray-800">
            <p className="text-4xl mb-3">🐾</p>
            <p className="text-gray-500 dark:text-gray-400">
              {t.healthInsights?.noPet || "반려동물을 먼저 등록해주세요"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 rounded-full bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
            >
              {t.healthInsights?.registerPet || "반려동물 등록하기"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
