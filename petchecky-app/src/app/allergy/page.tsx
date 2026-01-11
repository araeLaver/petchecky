"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Allergy {
  id: string;
  petId: string;
  name: string;
  type: "food" | "environmental" | "medication" | "contact";
  severity: "mild" | "moderate" | "severe";
  symptoms: string[];
  diagnosedDate?: string;
  notes?: string;
  reactions: AllergyReaction[];
}

interface AllergyReaction {
  id: string;
  date: string;
  trigger?: string;
  symptoms: string[];
  severity: "mild" | "moderate" | "severe";
  treatment?: string;
  notes?: string;
}

interface DietaryRestriction {
  id: string;
  petId: string;
  ingredient: string;
  reason: "allergy" | "intolerance" | "medical" | "preference";
  notes?: string;
}

interface Pet {
  id: string;
  name: string;
  species: "dog" | "cat";
}

const ALLERGY_TYPES: { value: Allergy["type"]; label: string; icon: string; color: string }[] = [
  { value: "food", label: "식품 알레르기", icon: "🍖", color: "orange" },
  { value: "environmental", label: "환경 알레르기", icon: "🌿", color: "green" },
  { value: "medication", label: "약물 알레르기", icon: "💊", color: "purple" },
  { value: "contact", label: "접촉 알레르기", icon: "🧴", color: "blue" },
];

const COMMON_ALLERGENS = {
  dog: {
    food: ["소고기", "닭고기", "돼지고기", "유제품", "밀", "옥수수", "콩", "계란", "생선"],
    environmental: ["집먼지진드기", "꽃가루", "곰팡이", "풀", "벼룩"],
    medication: ["항생제", "백신", "NSAID", "마취제"],
    contact: ["샴푸", "청소 세제", "라텍스", "플라스틱"],
  },
  cat: {
    food: ["소고기", "생선", "닭고기", "유제품", "밀", "옥수수", "콩"],
    environmental: ["집먼지진드기", "꽃가루", "곰팡이", "담배연기", "벼룩"],
    medication: ["항생제", "백신", "기생충약"],
    contact: ["화학 세제", "향수", "모래", "플라스틱"],
  },
};

const COMMON_SYMPTOMS = [
  "가려움증", "피부 발진", "귀 감염", "구토", "설사", "재채기",
  "눈물", "발 핥기", "탈모", "두드러기", "얼굴 부기", "호흡곤란"
];

const DANGEROUS_FOODS = {
  dog: [
    { name: "초콜릿", danger: "high", effect: "테오브로민 중독" },
    { name: "포도/건포도", danger: "high", effect: "급성 신부전" },
    { name: "양파/마늘", danger: "high", effect: "적혈구 손상" },
    { name: "자일리톨", danger: "high", effect: "저혈당, 간부전" },
    { name: "아보카도", danger: "medium", effect: "구토, 설사" },
    { name: "카페인", danger: "high", effect: "심장/신경계 이상" },
    { name: "알코올", danger: "high", effect: "중추신경 억제" },
    { name: "마카다미아", danger: "medium", effect: "무기력, 구토" },
  ],
  cat: [
    { name: "초콜릿", danger: "high", effect: "테오브로민 중독" },
    { name: "양파/마늘", danger: "high", effect: "적혈구 손상" },
    { name: "알코올", danger: "high", effect: "중추신경 억제" },
    { name: "카페인", danger: "high", effect: "심장/신경계 이상" },
    { name: "포도/건포도", danger: "high", effect: "신부전 가능" },
    { name: "날생선", danger: "medium", effect: "티아민 결핍" },
    { name: "우유", danger: "low", effect: "유당불내증" },
    { name: "날계란", danger: "medium", effect: "살모넬라" },
  ],
};

export default function AllergyPage() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"allergies" | "restrictions" | "dangerous">("allergies");
  const [showAllergyForm, setShowAllergyForm] = useState(false);
  const [showRestrictionForm, setShowRestrictionForm] = useState(false);
  const [showReactionForm, setShowReactionForm] = useState<Allergy | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [allergyForm, setAllergyForm] = useState({
    name: "",
    type: "food" as Allergy["type"],
    severity: "mild" as Allergy["severity"],
    symptoms: [] as string[],
    diagnosedDate: "",
    notes: "",
  });

  const [restrictionForm, setRestrictionForm] = useState({
    ingredient: "",
    reason: "allergy" as DietaryRestriction["reason"],
    notes: "",
  });

  const [reactionForm, setReactionForm] = useState({
    trigger: "",
    symptoms: [] as string[],
    severity: "mild" as AllergyReaction["severity"],
    treatment: "",
    notes: "",
  });

  // Load data
  useEffect(() => {
    const savedPets = localStorage.getItem("petProfiles");
    if (savedPets) {
      const parsed = JSON.parse(savedPets);
      const petList = Array.isArray(parsed) ? parsed : [parsed];
      setPets(petList);
      if (petList.length > 0) {
        setSelectedPetId(petList[0].id);
      }
    }

    const savedAllergies = localStorage.getItem("petAllergies");
    if (savedAllergies) {
      setAllergies(JSON.parse(savedAllergies));
    }

    const savedRestrictions = localStorage.getItem("dietaryRestrictions");
    if (savedRestrictions) {
      setRestrictions(JSON.parse(savedRestrictions));
    }
  }, []);

  // Save data
  useEffect(() => {
    if (allergies.length > 0) {
      localStorage.setItem("petAllergies", JSON.stringify(allergies));
    }
  }, [allergies]);

  useEffect(() => {
    if (restrictions.length > 0) {
      localStorage.setItem("dietaryRestrictions", JSON.stringify(restrictions));
    }
  }, [restrictions]);

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const allergens = selectedPet ? COMMON_ALLERGENS[selectedPet.species] : COMMON_ALLERGENS.dog;
  const dangerousFoods = selectedPet ? DANGEROUS_FOODS[selectedPet.species] : DANGEROUS_FOODS.dog;

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    const newAllergy: Allergy = {
      id: Date.now().toString(),
      petId: selectedPetId,
      name: allergyForm.name,
      type: allergyForm.type,
      severity: allergyForm.severity,
      symptoms: allergyForm.symptoms,
      diagnosedDate: allergyForm.diagnosedDate || undefined,
      notes: allergyForm.notes || undefined,
      reactions: [],
    };
    setAllergies([...allergies, newAllergy]);
    setAllergyForm({ name: "", type: "food", severity: "mild", symptoms: [], diagnosedDate: "", notes: "" });
    setShowAllergyForm(false);
  };

  const handleAddRestriction = (e: React.FormEvent) => {
    e.preventDefault();
    const newRestriction: DietaryRestriction = {
      id: Date.now().toString(),
      petId: selectedPetId,
      ingredient: restrictionForm.ingredient,
      reason: restrictionForm.reason,
      notes: restrictionForm.notes || undefined,
    };
    setRestrictions([...restrictions, newRestriction]);
    setRestrictionForm({ ingredient: "", reason: "allergy", notes: "" });
    setShowRestrictionForm(false);
  };

  const handleAddReaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReactionForm) return;

    const reaction: AllergyReaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      trigger: reactionForm.trigger || undefined,
      symptoms: reactionForm.symptoms,
      severity: reactionForm.severity,
      treatment: reactionForm.treatment || undefined,
      notes: reactionForm.notes || undefined,
    };

    setAllergies(allergies.map(a =>
      a.id === showReactionForm.id
        ? { ...a, reactions: [...a.reactions, reaction] }
        : a
    ));

    setReactionForm({ trigger: "", symptoms: [], severity: "mild", treatment: "", notes: "" });
    setShowReactionForm(null);
  };

  const handleDeleteAllergy = (id: string) => {
    if (confirm("이 알레르기를 삭제하시겠습니까?")) {
      setAllergies(allergies.filter(a => a.id !== id));
    }
  };

  const handleDeleteRestriction = (id: string) => {
    if (confirm("이 제한 항목을 삭제하시겠습니까?")) {
      setRestrictions(restrictions.filter(r => r.id !== id));
    }
  };

  const toggleSymptom = (symptom: string, formType: "allergy" | "reaction") => {
    if (formType === "allergy") {
      setAllergyForm(prev => ({
        ...prev,
        symptoms: prev.symptoms.includes(symptom)
          ? prev.symptoms.filter(s => s !== symptom)
          : [...prev.symptoms, symptom]
      }));
    } else {
      setReactionForm(prev => ({
        ...prev,
        symptoms: prev.symptoms.includes(symptom)
          ? prev.symptoms.filter(s => s !== symptom)
          : [...prev.symptoms, symptom]
      }));
    }
  };

  const filteredAllergies = allergies
    .filter(a => a.petId === selectedPetId)
    .filter(a => typeFilter === "all" || a.type === typeFilter);

  const petRestrictions = restrictions.filter(r => r.petId === selectedPetId);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "moderate": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "severe": return "심각";
      case "moderate": return "중등도";
      default: return "경미";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold text-gray-800 dark:text-white">펫체키</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">🚫 알레르기 관리</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Pet Selection */}
        {pets.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pets.map(pet => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedPetId === pet.id
                    ? "bg-red-500 text-white"
                    : "bg-white border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                <span>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Warning Banner */}
        {filteredAllergies.some(a => a.severity === "severe") && (
          <div className="rounded-2xl bg-red-100 border-2 border-red-300 p-4 dark:bg-red-900/30 dark:border-red-700">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-red-800 dark:text-red-300">심각한 알레르기 주의</p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {filteredAllergies.filter(a => a.severity === "severe").map(a => a.name).join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => setActiveTab("allergies")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors text-sm ${
              activeTab === "allergies"
                ? "bg-white text-red-600 shadow dark:bg-gray-700 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            🚫 알레르기
          </button>
          <button
            onClick={() => setActiveTab("restrictions")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors text-sm ${
              activeTab === "restrictions"
                ? "bg-white text-red-600 shadow dark:bg-gray-700 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            🍽️ 식이 제한
          </button>
          <button
            onClick={() => setActiveTab("dangerous")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors text-sm ${
              activeTab === "dangerous"
                ? "bg-white text-red-600 shadow dark:bg-gray-700 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            ☠️ 위험 식품
          </button>
        </div>

        {activeTab === "allergies" && (
          <>
            {/* Type Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  typeFilter === "all"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                전체
              </button>
              {ALLERGY_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setTypeFilter(type.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 ${
                    typeFilter === type.value
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>

            {/* Allergy List */}
            {filteredAllergies.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🚫</span>
                <p className="text-gray-500 dark:text-gray-400">등록된 알레르기가 없습니다</p>
                <button
                  onClick={() => setShowAllergyForm(true)}
                  className="mt-4 text-red-600 font-medium hover:underline"
                >
                  첫 알레르기 등록하기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAllergies.map(allergy => (
                  <div
                    key={allergy.id}
                    className="rounded-2xl bg-white border border-gray-100 p-5 dark:bg-gray-800 dark:border-gray-700"
                  >
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
                        onClick={() => handleDeleteAllergy(allergy.id)}
                        className="text-gray-400 hover:text-red-500"
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
                      onClick={() => setShowReactionForm(allergy)}
                      className="w-full py-2.5 rounded-xl bg-red-100 text-red-700 font-medium hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                    >
                      + 반응 기록 추가
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Allergy Button */}
            <button
              onClick={() => setShowAllergyForm(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-medium hover:border-red-400 hover:text-red-500 dark:border-gray-600 dark:text-gray-400"
            >
              + 새 알레르기 추가
            </button>
          </>
        )}

        {activeTab === "restrictions" && (
          <>
            {/* Restriction List */}
            {petRestrictions.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🍽️</span>
                <p className="text-gray-500 dark:text-gray-400">등록된 식이 제한이 없습니다</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {petRestrictions.map(restriction => (
                  <div
                    key={restriction.id}
                    className="rounded-xl bg-white border border-gray-100 p-4 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{restriction.ingredient}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {restriction.reason === "allergy" && "알레르기"}
                          {restriction.reason === "intolerance" && "불내증"}
                          {restriction.reason === "medical" && "의료적 이유"}
                          {restriction.reason === "preference" && "기호"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteRestriction(restriction.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add from Allergens */}
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">빠른 추가</h3>
              <div className="flex flex-wrap gap-2">
                {allergens.food.map(allergen => (
                  <button
                    key={allergen}
                    onClick={() => {
                      if (!petRestrictions.some(r => r.ingredient === allergen)) {
                        const newRestriction: DietaryRestriction = {
                          id: Date.now().toString(),
                          petId: selectedPetId,
                          ingredient: allergen,
                          reason: "allergy",
                        };
                        setRestrictions([...restrictions, newRestriction]);
                      }
                    }}
                    disabled={petRestrictions.some(r => r.ingredient === allergen)}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      petRestrictions.some(r => r.ingredient === allergen)
                        ? "bg-gray-200 text-gray-400 dark:bg-gray-600"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-red-400 hover:text-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    }`}
                  >
                    + {allergen}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Restriction */}
            <button
              onClick={() => setShowRestrictionForm(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-medium hover:border-red-400 hover:text-red-500 dark:border-gray-600 dark:text-gray-400"
            >
              + 직접 추가
            </button>
          </>
        )}

        {activeTab === "dangerous" && (
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
        )}

        {/* Add Allergy Modal */}
        {showAllergyForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">알레르기 등록</h2>

              <form onSubmit={handleAddAllergy} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    알레르겐 유형
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALLERGY_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setAllergyForm({ ...allergyForm, type: type.value })}
                        className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
                          allergyForm.type === type.value
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
                    value={allergyForm.name}
                    onChange={(e) => setAllergyForm({ ...allergyForm, name: e.target.value })}
                    placeholder="예: 닭고기, 꽃가루"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {allergens[allergyForm.type as keyof typeof allergens]?.slice(0, 5).map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAllergyForm({ ...allergyForm, name: a })}
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
                        onClick={() => setAllergyForm({ ...allergyForm, severity: sev })}
                        className={`p-2 rounded-lg text-sm ${
                          allergyForm.severity === sev
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
                        onClick={() => toggleSymptom(symptom, "allergy")}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          allergyForm.symptoms.includes(symptom)
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
                    onClick={() => setShowAllergyForm(false)}
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
        )}

        {/* Add Restriction Modal */}
        {showRestrictionForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">식이 제한 추가</h2>

              <form onSubmit={handleAddRestriction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    재료/성분 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={restrictionForm.ingredient}
                    onChange={(e) => setRestrictionForm({ ...restrictionForm, ingredient: e.target.value })}
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
                    {([
                      { value: "allergy", label: "알레르기" },
                      { value: "intolerance", label: "불내증" },
                      { value: "medical", label: "의료적" },
                      { value: "preference", label: "기호" },
                    ] as const).map(reason => (
                      <button
                        key={reason.value}
                        type="button"
                        onClick={() => setRestrictionForm({ ...restrictionForm, reason: reason.value })}
                        className={`p-2 rounded-lg text-sm ${
                          restrictionForm.reason === reason.value
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
                    onClick={() => setShowRestrictionForm(false)}
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
        )}

        {/* Add Reaction Modal */}
        {showReactionForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">반응 기록</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{showReactionForm.name}</p>

              <form onSubmit={handleAddReaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    촉발 요인
                  </label>
                  <input
                    type="text"
                    value={reactionForm.trigger}
                    onChange={(e) => setReactionForm({ ...reactionForm, trigger: e.target.value })}
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
                        onClick={() => toggleSymptom(symptom, "reaction")}
                        className={`px-3 py-1.5 rounded-full text-sm ${
                          reactionForm.symptoms.includes(symptom)
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
                        onClick={() => setReactionForm({ ...reactionForm, severity: sev })}
                        className={`p-2 rounded-lg text-sm ${
                          reactionForm.severity === sev
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
                    value={reactionForm.treatment}
                    onChange={(e) => setReactionForm({ ...reactionForm, treatment: e.target.value })}
                    placeholder="예: 항히스타민제 투여"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReactionForm(null)}
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
        )}
      </main>
    </div>
  );
}
