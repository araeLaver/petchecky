"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import VaccinationCard from "@/components/vaccination/VaccinationCard";
import { PetProfile } from "@/app/page";

// 모달 동적 임포트
const VaccinationModal = dynamic(() => import("@/components/vaccination/VaccinationModal"), {
  loading: () => null,
});

export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  date: string; // 접종일
  nextDate?: string; // 다음 접종 예정일
  hospital?: string;
  notes?: string;
  completed: boolean;
  type: "required" | "optional";
}

// 강아지 필수/권장 백신
const DOG_VACCINES = [
  { name: "종합백신 (DHPPL)", type: "required", interval: 365 },
  { name: "광견병", type: "required", interval: 365 },
  { name: "코로나 장염", type: "optional", interval: 365 },
  { name: "켄넬코프", type: "optional", interval: 365 },
  { name: "인플루엔자", type: "optional", interval: 365 },
  { name: "심장사상충 예방", type: "required", interval: 30 },
];

// 고양이 필수/권장 백신
const CAT_VACCINES = [
  { name: "종합백신 (FVRCP)", type: "required", interval: 365 },
  { name: "광견병", type: "required", interval: 365 },
  { name: "백혈병 (FeLV)", type: "optional", interval: 365 },
  { name: "전염성 복막염 (FIP)", type: "optional", interval: 365 },
  { name: "심장사상충 예방", type: "required", interval: 30 },
];

export default function VaccinationPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "overdue">("all");

  const selectedPet = pets.find((p) => p.id === selectedPetId);
  const vaccineList = selectedPet?.species === "cat" ? CAT_VACCINES : DOG_VACCINES;

  // 펫 목록 로드
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

  // 예방접종 기록 로드
  useEffect(() => {
    if (selectedPetId) {
      const saved = localStorage.getItem(`petchecky_vaccinations_${selectedPetId}`);
      if (saved) {
        setVaccinations(JSON.parse(saved));
      } else {
        setVaccinations([]);
      }
    }
  }, [selectedPetId]);

  // 예방접종 기록 저장
  const saveVaccinations = (newVaccinations: Vaccination[]) => {
    if (selectedPetId) {
      localStorage.setItem(
        `petchecky_vaccinations_${selectedPetId}`,
        JSON.stringify(newVaccinations)
      );
      setVaccinations(newVaccinations);
    }
  };

  // 예방접종 추가/수정
  const handleSaveVaccination = (vaccination: Omit<Vaccination, "id" | "petId">) => {
    if (!selectedPetId) return;

    if (editingVaccination) {
      // 수정
      const updated = vaccinations.map((v) =>
        v.id === editingVaccination.id
          ? { ...vaccination, id: v.id, petId: selectedPetId }
          : v
      );
      saveVaccinations(updated);
    } else {
      // 추가
      const newVaccination: Vaccination = {
        ...vaccination,
        id: Date.now().toString(),
        petId: selectedPetId,
      };
      saveVaccinations([...vaccinations, newVaccination]);
    }
    setShowModal(false);
    setEditingVaccination(null);
  };

  // 예방접종 삭제
  const handleDeleteVaccination = (id: string) => {
    if (confirm("이 예방접종 기록을 삭제하시겠습니까?")) {
      saveVaccinations(vaccinations.filter((v) => v.id !== id));
    }
  };

  // 필터링된 목록
  const getFilteredVaccinations = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return vaccinations.filter((v) => {
      if (filter === "all") return true;

      if (!v.nextDate) return false;

      const nextDate = new Date(v.nextDate);
      nextDate.setHours(0, 0, 0, 0);

      if (filter === "upcoming") {
        const weekLater = new Date(today);
        weekLater.setDate(weekLater.getDate() + 7);
        return nextDate >= today && nextDate <= weekLater;
      }

      if (filter === "overdue") {
        return nextDate < today;
      }

      return true;
    });
  };

  // 다가오는 접종 알림 수
  const getUpcomingCount = () => {
    const today = new Date();
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);

    return vaccinations.filter((v) => {
      if (!v.nextDate) return false;
      const nextDate = new Date(v.nextDate);
      return nextDate >= today && nextDate <= weekLater;
    }).length;
  };

  // 지난 접종 수
  const getOverdueCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return vaccinations.filter((v) => {
      if (!v.nextDate) return false;
      const nextDate = new Date(v.nextDate);
      nextDate.setHours(0, 0, 0, 0);
      return nextDate < today;
    }).length;
  };

  const filteredVaccinations = getFilteredVaccinations();
  const upcomingCount = getUpcomingCount();
  const overdueCount = getOverdueCount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-gray-800">예방접종 관리</h1>
          </div>
          <button
            onClick={() => {
              setEditingVaccination(null);
              setShowModal(true);
            }}
            className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            + 접종 기록
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        {/* 펫 선택 */}
        {pets.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id!)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedPetId === pet.id
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* 알림 배너 */}
        {(upcomingCount > 0 || overdueCount > 0) && (
          <div className="mb-4 space-y-2">
            {overdueCount > 0 && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-medium text-red-800">
                    {overdueCount}건의 접종이 지연되었습니다
                  </p>
                  <p className="text-sm text-red-600">
                    가까운 동물병원에서 접종을 진행해주세요
                  </p>
                </div>
              </div>
            )}
            {upcomingCount > 0 && (
              <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4">
                <span className="text-2xl">💉</span>
                <div>
                  <p className="font-medium text-blue-800">
                    {upcomingCount}건의 접종이 7일 이내 예정되어 있습니다
                  </p>
                  <p className="text-sm text-blue-600">
                    예약을 확인해주세요
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 필터 탭 */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            전체 ({vaccinations.length})
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === "upcoming"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            예정 ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter("overdue")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === "overdue"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            지연 ({overdueCount})
          </button>
        </div>

        {/* 접종 목록 */}
        {filteredVaccinations.length > 0 ? (
          <div className="space-y-3">
            {filteredVaccinations
              .sort((a, b) => {
                // 지연된 것 먼저, 그 다음 예정일 순
                if (a.nextDate && b.nextDate) {
                  return new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime();
                }
                return 0;
              })
              .map((vaccination) => (
                <VaccinationCard
                  key={vaccination.id}
                  vaccination={vaccination}
                  onEdit={() => {
                    setEditingVaccination(vaccination);
                    setShowModal(true);
                  }}
                  onDelete={() => handleDeleteVaccination(vaccination.id)}
                />
              ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-3">💉</div>
            <p className="text-gray-500 mb-4">
              {filter === "all"
                ? "등록된 예방접종 기록이 없습니다"
                : filter === "upcoming"
                ? "7일 이내 예정된 접종이 없습니다"
                : "지연된 접종이 없습니다"}
            </p>
            {filter === "all" && (
              <button
                onClick={() => setShowModal(true)}
                className="rounded-full bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                첫 접종 기록 추가
              </button>
            )}
          </div>
        )}

        {/* 권장 백신 안내 */}
        {selectedPet && vaccinations.length === 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              {selectedPet.species === "dog" ? "🐕" : "🐈"} {selectedPet.name}의 권장 예방접종
            </h2>
            <div className="space-y-2">
              {vaccineList.map((vaccine, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl bg-white border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        vaccine.type === "required"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {vaccine.type === "required" ? "필수" : "권장"}
                    </span>
                    <span className="font-medium text-gray-800">{vaccine.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {vaccine.interval >= 365
                      ? `${Math.floor(vaccine.interval / 365)}년마다`
                      : `${vaccine.interval}일마다`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 접종 추가/수정 모달 */}
      {showModal && selectedPet && (
        <VaccinationModal
          pet={selectedPet}
          vaccination={editingVaccination}
          vaccineList={vaccineList}
          onSave={handleSaveVaccination}
          onClose={() => {
            setShowModal(false);
            setEditingVaccination(null);
          }}
        />
      )}
    </div>
  );
}
