"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Allergy, AllergyReaction, DietaryRestriction, Pet } from "./types";
import { ALLERGY_TYPES, COMMON_ALLERGENS, getSeverityColor, getSeverityLabel } from "./constants";
import {
  AllergyCard,
  AllergyFormModal,
  RestrictionFormModal,
  ReactionFormModal,
  DangerousFoodsList,
} from "./components";

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

  const handleAddAllergy = (data: Omit<Allergy, "id" | "petId" | "reactions">) => {
    const newAllergy: Allergy = {
      id: Date.now().toString(),
      petId: selectedPetId,
      ...data,
      reactions: [],
    };
    setAllergies([...allergies, newAllergy]);
    setShowAllergyForm(false);
  };

  const handleAddRestriction = (data: Omit<DietaryRestriction, "id" | "petId">) => {
    const newRestriction: DietaryRestriction = {
      id: Date.now().toString(),
      petId: selectedPetId,
      ...data,
    };
    setRestrictions([...restrictions, newRestriction]);
    setShowRestrictionForm(false);
  };

  const handleAddReaction = (data: Omit<AllergyReaction, "id" | "date">) => {
    if (!showReactionForm) return;

    const reaction: AllergyReaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      ...data,
    };

    setAllergies(allergies.map(a =>
      a.id === showReactionForm.id
        ? { ...a, reactions: [...a.reactions, reaction] }
        : a
    ));
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

  const handleQuickAddRestriction = (allergen: string) => {
    const newRestriction: DietaryRestriction = {
      id: Date.now().toString(),
      petId: selectedPetId,
      ingredient: allergen,
      reason: "allergy",
    };
    setRestrictions([...restrictions, newRestriction]);
  };

  const filteredAllergies = allergies
    .filter(a => a.petId === selectedPetId)
    .filter(a => typeFilter === "all" || a.type === typeFilter);

  const petRestrictions = restrictions.filter(r => r.petId === selectedPetId);

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
          {[
            { key: "allergies", label: "🚫 알레르기" },
            { key: "restrictions", label: "🍽️ 식이 제한" },
            { key: "dangerous", label: "☠️ 위험 식품" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                activeTab === tab.key
                  ? "bg-white text-red-600 shadow dark:bg-gray-700 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
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
                  <AllergyCard
                    key={allergy.id}
                    allergy={allergy}
                    onDelete={handleDeleteAllergy}
                    onAddReaction={setShowReactionForm}
                  />
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
                    onClick={() => handleQuickAddRestriction(allergen)}
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
          <DangerousFoodsList selectedPet={selectedPet} />
        )}

        {/* Modals */}
        {showAllergyForm && (
          <AllergyFormModal
            onClose={() => setShowAllergyForm(false)}
            onSubmit={handleAddAllergy}
            allergens={allergens}
          />
        )}

        {showRestrictionForm && (
          <RestrictionFormModal
            onClose={() => setShowRestrictionForm(false)}
            onSubmit={handleAddRestriction}
          />
        )}

        {showReactionForm && (
          <ReactionFormModal
            allergy={showReactionForm}
            onClose={() => setShowReactionForm(null)}
            onSubmit={handleAddReaction}
          />
        )}
      </main>
    </div>
  );
}
