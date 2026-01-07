"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { PetProfile } from "@/app/page";

interface FoodRecommendation {
  id: string;
  name: string;
  brand: string;
  type: "dry" | "wet" | "raw" | "treat";
  targetAge: "puppy" | "adult" | "senior" | "all";
  targetSpecies: "dog" | "cat";
  features: string[];
  ingredients: string[];
  rating: number;
  priceRange: "budget" | "mid" | "premium";
  suitableFor: string[];
}

interface DietLog {
  id: string;
  petId: string;
  date: string;
  foodName: string;
  amount: string;
  mealTime: "breakfast" | "lunch" | "dinner" | "snack";
  notes?: string;
}

// Sample food recommendations
const FOOD_RECOMMENDATIONS: FoodRecommendation[] = [
  {
    id: "1",
    name: "오리젠 오리지널",
    brand: "오리젠",
    type: "dry",
    targetAge: "adult",
    targetSpecies: "dog",
    features: ["고단백", "곡물 프리", "신선한 재료"],
    ingredients: ["닭고기", "칠면조", "생선"],
    rating: 4.8,
    priceRange: "premium",
    suitableFor: ["활동적인 반려견", "근육 유지"],
  },
  {
    id: "2",
    name: "로얄캐닌 미니 어덜트",
    brand: "로얄캐닌",
    type: "dry",
    targetAge: "adult",
    targetSpecies: "dog",
    features: ["소형견 전용", "소화 건강", "피모 건강"],
    ingredients: ["닭고기", "쌀", "옥수수"],
    rating: 4.5,
    priceRange: "mid",
    suitableFor: ["소형견", "실내견"],
  },
  {
    id: "3",
    name: "힐스 사이언스 다이어트",
    brand: "힐스",
    type: "dry",
    targetAge: "adult",
    targetSpecies: "dog",
    features: ["체중 관리", "관절 건강", "수의사 추천"],
    ingredients: ["닭고기", "보리", "현미"],
    rating: 4.6,
    priceRange: "mid",
    suitableFor: ["과체중", "관절 케어"],
  },
  {
    id: "4",
    name: "로얄캐닌 인도어 캣",
    brand: "로얄캐닌",
    type: "dry",
    targetAge: "adult",
    targetSpecies: "cat",
    features: ["실내묘 전용", "헤어볼 케어", "체중 관리"],
    ingredients: ["닭고기", "쌀", "식이섬유"],
    rating: 4.7,
    priceRange: "mid",
    suitableFor: ["실내묘", "헤어볼 문제"],
  },
  {
    id: "5",
    name: "뉴트로 그레인 프리",
    brand: "뉴트로",
    type: "dry",
    targetAge: "adult",
    targetSpecies: "cat",
    features: ["곡물 프리", "고단백", "자연 재료"],
    ingredients: ["연어", "고구마", "완두콩"],
    rating: 4.4,
    priceRange: "premium",
    suitableFor: ["민감한 소화", "알러지"],
  },
];

const DIET_TIPS = {
  dog: [
    "하루 2~3회 규칙적인 식사가 좋습니다",
    "사람 음식, 특히 포도, 초콜릿, 양파는 위험해요",
    "급격한 사료 변경은 소화 문제를 일으킬 수 있어요",
    "깨끗한 물을 항상 제공해주세요",
    "과체중 예방을 위해 간식은 하루 칼로리의 10% 이하로",
  ],
  cat: [
    "고양이는 하루 2~3회 소량씩 급여하세요",
    "수분 섭취가 중요해요, 습식 사료를 섞어주세요",
    "고양이에게 개 사료를 주면 안돼요",
    "타우린이 포함된 사료를 선택하세요",
    "식사 장소는 화장실과 떨어진 곳에",
  ],
};

export default function DietPage() {
  const { t } = useLanguage();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"recommendations" | "log" | "tips">("recommendations");

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  // Load pets
  useEffect(() => {
    const savedPets = localStorage.getItem("petchecky_pets");
    if (savedPets) {
      const parsedPets = JSON.parse(savedPets);
      setPets(parsedPets);
      if (parsedPets.length > 0) {
        setSelectedPetId(parsedPets[0].id);
      }
    }
  }, []);

  // Load diet logs
  useEffect(() => {
    if (selectedPetId) {
      const saved = localStorage.getItem(`petchecky_diet_${selectedPetId}`);
      setDietLogs(saved ? JSON.parse(saved) : []);
    }
  }, [selectedPetId]);

  // Save diet log
  const handleSaveDietLog = (log: Omit<DietLog, "id" | "petId">) => {
    if (!selectedPetId) return;

    const newLog: DietLog = {
      ...log,
      id: Date.now().toString(),
      petId: selectedPetId,
    };

    const updated = [...dietLogs, newLog];
    setDietLogs(updated);
    localStorage.setItem(`petchecky_diet_${selectedPetId}`, JSON.stringify(updated));
    setShowLogModal(false);
  };

  // Get filtered recommendations
  const getRecommendations = () => {
    if (!selectedPet) return [];

    return FOOD_RECOMMENDATIONS.filter((food) => {
      // Filter by species
      if (food.targetSpecies !== selectedPet.species) return false;

      // Could add more filtering based on pet age, weight, health conditions
      return true;
    });
  };

  const recommendations = getRecommendations();

  // Get meal time label
  const getMealTimeLabel = (mealTime: string) => {
    const labels: Record<string, string> = {
      breakfast: "아침",
      lunch: "점심",
      dinner: "저녁",
      snack: "간식",
    };
    return labels[mealTime] || mealTime;
  };

  // Get price range label
  const getPriceLabel = (priceRange: string) => {
    const labels: Record<string, string> = {
      budget: "💰",
      mid: "💰💰",
      premium: "💰💰💰",
    };
    return labels[priceRange] || priceRange;
  };

  // Get food type label
  const getFoodTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      dry: "건식 사료",
      wet: "습식 사료",
      raw: "생식",
      treat: "간식",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">🍽️ 식이요법 & 사료</h1>
          </div>
          {activeTab === "log" && (
            <button
              onClick={() => setShowLogModal(true)}
              className="rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              + 식사 기록
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        {/* Pet Selection */}
        {pets.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id!)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedPetId === pet.id
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                <span>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          {(["recommendations", "log", "tips"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              {tab === "recommendations" ? "추천 사료" : tab === "log" ? "식사 기록" : "식이 팁"}
            </button>
          ))}
        </div>

        {/* Recommendations Tab */}
        {activeTab === "recommendations" && (
          <div className="space-y-4">
            {selectedPet && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-700">
                <p className="text-sm text-green-700 dark:text-green-300">
                  🐾 <strong>{selectedPet.name}</strong>({selectedPet.breed}, {selectedPet.age}세, {selectedPet.weight}kg)에게 맞는 사료를 추천해드려요
                </p>
              </div>
            )}

            {recommendations.map((food) => (
              <div
                key={food.id}
                className="rounded-xl bg-white border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{food.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{food.brand}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{food.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {getFoodTypeLabel(food.type)}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {getPriceLabel(food.priceRange)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {food.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <strong>주 성분:</strong> {food.ingredients.join(", ")}
                </div>

                {food.suitableFor.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <strong>추천 대상:</strong> {food.suitableFor.join(", ")}
                  </div>
                )}
              </div>
            ))}

            {recommendations.length === 0 && (
              <div className="rounded-xl bg-white border border-gray-200 p-8 text-center dark:bg-gray-800 dark:border-gray-700">
                <div className="text-4xl mb-3">🍽️</div>
                <p className="text-gray-500 dark:text-gray-400">
                  펫 프로필을 등록하면 맞춤 사료를 추천받을 수 있어요
                </p>
              </div>
            )}
          </div>
        )}

        {/* Diet Log Tab */}
        {activeTab === "log" && (
          <div className="space-y-4">
            {dietLogs.length > 0 ? (
              <>
                {/* Today's summary */}
                <div className="rounded-xl bg-white border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="font-bold text-gray-800 mb-3 dark:text-gray-100">오늘의 식사</h3>
                  {dietLogs
                    .filter((log) => log.date === new Date().toISOString().split("T")[0])
                    .map((log) => (
                      <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 dark:border-gray-700">
                        <span className="text-2xl">
                          {log.mealTime === "breakfast" ? "🌅" : log.mealTime === "lunch" ? "☀️" : log.mealTime === "dinner" ? "🌙" : "🍪"}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-100">{log.foodName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getMealTimeLabel(log.mealTime)} · {log.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  {dietLogs.filter((log) => log.date === new Date().toISOString().split("T")[0]).length === 0 && (
                    <p className="text-center text-gray-500 py-4 dark:text-gray-400">오늘 기록이 없습니다</p>
                  )}
                </div>

                {/* All logs */}
                <div className="rounded-xl bg-white border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="font-bold text-gray-800 mb-3 dark:text-gray-100">식사 기록</h3>
                  {dietLogs
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((log) => (
                      <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 dark:border-gray-700">
                        <span className="text-2xl">
                          {log.mealTime === "breakfast" ? "🌅" : log.mealTime === "lunch" ? "☀️" : log.mealTime === "dinner" ? "🌙" : "🍪"}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-100">{log.foodName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {log.date} · {getMealTimeLabel(log.mealTime)} · {log.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-white border border-gray-200 p-8 text-center dark:bg-gray-800 dark:border-gray-700">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-gray-500 mb-4 dark:text-gray-400">
                  식사 기록을 남겨보세요
                </p>
                <button
                  onClick={() => setShowLogModal(true)}
                  className="rounded-full bg-green-500 px-6 py-2 text-sm font-medium text-white hover:bg-green-600"
                >
                  첫 기록 추가하기
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tips Tab */}
        {activeTab === "tips" && selectedPet && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
              <h3 className="font-bold text-gray-800 mb-3 dark:text-gray-100">
                {selectedPet.species === "dog" ? "🐕 강아지" : "🐈 고양이"} 식이 팁
              </h3>
              <ul className="space-y-2">
                {DIET_TIPS[selectedPet.species].map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dangerous foods */}
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-700">
              <h3 className="font-bold text-red-700 mb-3 dark:text-red-300">🚫 위험한 음식</h3>
              <div className="grid grid-cols-2 gap-2">
                {["초콜릿", "포도/건포도", "양파/마늘", "자일리톨", "카페인", "알코올"].map((food, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-300">
                    <span>❌</span>
                    <span>{food}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Healthy snacks */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 dark:bg-blue-900/20 dark:border-blue-700">
              <h3 className="font-bold text-blue-700 mb-3 dark:text-blue-300">✅ 건강한 간식</h3>
              <div className="grid grid-cols-2 gap-2">
                {(selectedPet.species === "dog"
                  ? ["당근", "사과 (씨 제외)", "블루베리", "수박", "오이", "호박"]
                  : ["익힌 닭가슴살", "삶은 생선", "호박", "브로콜리", "참외", "수박"]
                ).map((food, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-300">
                    <span>✓</span>
                    <span>{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Diet Log Modal */}
      {showLogModal && selectedPet && (
        <DietLogModal
          petName={selectedPet.name}
          onSave={handleSaveDietLog}
          onClose={() => setShowLogModal(false)}
        />
      )}
    </div>
  );
}

// Diet Log Modal Component
function DietLogModal({
  petName,
  onSave,
  onClose,
}: {
  petName: string;
  onSave: (log: Omit<DietLog, "id" | "petId">) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [foodName, setFoodName] = useState("");
  const [amount, setAmount] = useState("");
  const [mealTime, setMealTime] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !amount.trim()) return;

    onSave({
      date,
      foodName: foodName.trim(),
      amount: amount.trim(),
      mealTime,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">식사 기록</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <p className="text-sm text-green-700 dark:text-green-300">🍽️ {petName}의 식사를 기록해요</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">식사 시간</label>
            <div className="grid grid-cols-4 gap-2">
              {(["breakfast", "lunch", "dinner", "snack"] as const).map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setMealTime(time)}
                  className={`rounded-lg border-2 p-2 text-center transition-colors ${
                    mealTime === time
                      ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <div className="text-xl">
                    {time === "breakfast" ? "🌅" : time === "lunch" ? "☀️" : time === "dinner" ? "🌙" : "🍪"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {time === "breakfast" ? "아침" : time === "lunch" ? "점심" : time === "dinner" ? "저녁" : "간식"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">음식/사료명 *</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="예: 로얄캐닌 어덜트"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">양 *</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="예: 100g, 1/2컵"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="특이사항 등"
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-green-500 focus:outline-none resize-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!foodName.trim() || !amount.trim()}
              className="flex-1 rounded-lg bg-green-500 py-3 font-medium text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
