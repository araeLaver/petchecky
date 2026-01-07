"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import WeightChart from "@/components/health/WeightChart";
import HealthRecordModal from "@/components/health/HealthRecordModal";
import HealthRecordList from "@/components/health/HealthRecordList";
import { PetProfile } from "@/app/page";

export interface HealthRecord {
  id: string;
  petId: string;
  date: string;
  weight?: number;
  bodyCondition?: "underweight" | "ideal" | "overweight";
  appetite?: "poor" | "normal" | "good";
  energy?: "low" | "normal" | "high";
  notes?: string;
}

export default function HealthTrackingPage() {
  const { t } = useLanguage();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [viewMode, setViewMode] = useState<"chart" | "list">("chart");
  const [dateRange, setDateRange] = useState<"1m" | "3m" | "6m" | "1y">("3m");

  const selectedPet = pets.find((p) => p.id === selectedPetId);

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

  // 건강 기록 로드
  useEffect(() => {
    if (selectedPetId) {
      const saved = localStorage.getItem(`petchecky_health_${selectedPetId}`);
      if (saved) {
        setRecords(JSON.parse(saved));
      } else {
        setRecords([]);
      }
    }
  }, [selectedPetId]);

  // 건강 기록 저장
  const saveRecords = (newRecords: HealthRecord[]) => {
    if (selectedPetId) {
      localStorage.setItem(
        `petchecky_health_${selectedPetId}`,
        JSON.stringify(newRecords)
      );
      setRecords(newRecords);
    }
  };

  // 기록 추가/수정
  const handleSaveRecord = (record: Omit<HealthRecord, "id" | "petId">) => {
    if (!selectedPetId) return;

    if (editingRecord) {
      const updated = records.map((r) =>
        r.id === editingRecord.id
          ? { ...record, id: r.id, petId: selectedPetId }
          : r
      );
      saveRecords(updated);
    } else {
      const newRecord: HealthRecord = {
        ...record,
        id: Date.now().toString(),
        petId: selectedPetId,
      };
      saveRecords([...records, newRecord]);
    }
    setShowModal(false);
    setEditingRecord(null);
  };

  // 기록 삭제
  const handleDeleteRecord = (id: string) => {
    if (confirm("이 기록을 삭제하시겠습니까?")) {
      saveRecords(records.filter((r) => r.id !== id));
    }
  };

  // 날짜 범위에 따른 필터링
  const getFilteredRecords = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case "1m":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return records
      .filter((r) => new Date(r.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // 체중 통계 계산
  const getWeightStats = () => {
    const weightRecords = records.filter((r) => r.weight !== undefined);
    if (weightRecords.length === 0) return null;

    const weights = weightRecords.map((r) => r.weight!);
    const latest = weightRecords.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    const previous = weightRecords.length > 1 ? weightRecords[weightRecords.length - 2] : null;

    const change = previous && latest.weight && previous.weight
      ? latest.weight - previous.weight
      : 0;

    return {
      current: latest.weight!,
      min: Math.min(...weights),
      max: Math.max(...weights),
      avg: weights.reduce((a, b) => a + b, 0) / weights.length,
      change,
    };
  };

  const filteredRecords = getFilteredRecords();
  const weightStats = getWeightStats();

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
            <h1 className="text-lg font-bold text-gray-800">건강 기록</h1>
          </div>
          <button
            onClick={() => {
              setEditingRecord(null);
              setShowModal(true);
            }}
            className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            + 기록 추가
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

        {/* 체중 통계 카드 */}
        {weightStats && (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">현재 체중</p>
              <p className="text-2xl font-bold text-gray-800">
                {weightStats.current.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
              </p>
              {weightStats.change !== 0 && (
                <p
                  className={`text-xs mt-1 ${
                    weightStats.change > 0 ? "text-orange-500" : "text-green-500"
                  }`}
                >
                  {weightStats.change > 0 ? "▲" : "▼"}{" "}
                  {Math.abs(weightStats.change).toFixed(1)}kg
                </p>
              )}
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">평균 체중</p>
              <p className="text-2xl font-bold text-gray-800">
                {weightStats.avg.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
              </p>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">최저</p>
              <p className="text-2xl font-bold text-blue-600">
                {weightStats.min.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
              </p>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">최고</p>
              <p className="text-2xl font-bold text-orange-500">
                {weightStats.max.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
              </p>
            </div>
          </div>
        )}

        {/* 보기 모드 & 기간 선택 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setViewMode("chart")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "chart"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📊 차트
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📋 목록
            </button>
          </div>

          <div className="flex gap-1">
            {(["1m", "3m", "6m", "1y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  dateRange === range
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {range === "1m" ? "1개월" : range === "3m" ? "3개월" : range === "6m" ? "6개월" : "1년"}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        {records.length > 0 ? (
          viewMode === "chart" ? (
            <WeightChart records={filteredRecords} petName={selectedPet?.name || ""} />
          ) : (
            <HealthRecordList
              records={filteredRecords}
              onEdit={(record) => {
                setEditingRecord(record);
                setShowModal(true);
              }}
              onDelete={handleDeleteRecord}
            />
          )
        ) : (
          <div className="rounded-xl bg-white border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-500 mb-4">
              아직 기록된 건강 데이터가 없습니다
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-full bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              첫 기록 추가하기
            </button>
          </div>
        )}

        {/* 건강 팁 */}
        {selectedPet && (
          <div className="mt-6 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-4">
            <h3 className="font-bold text-gray-800 mb-2">
              💡 {selectedPet.name}의 건강 관리 팁
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 정기적인 체중 측정으로 건강 상태를 모니터링하세요</li>
              <li>• 급격한 체중 변화는 건강 이상의 신호일 수 있어요</li>
              <li>• 식욕과 활동량 변화도 함께 기록하면 좋아요</li>
            </ul>
          </div>
        )}
      </main>

      {/* 기록 추가/수정 모달 */}
      {showModal && selectedPet && (
        <HealthRecordModal
          pet={selectedPet}
          record={editingRecord}
          onSave={handleSaveRecord}
          onClose={() => {
            setShowModal(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}
