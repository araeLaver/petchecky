"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import WalkRecordModal from "@/components/walk/WalkRecordModal";
import WalkStats from "@/components/walk/WalkStats";
import WalkHistory from "@/components/walk/WalkHistory";
import { PetProfile } from "@/app/page";

export interface WalkRecord {
  id: string;
  petId: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number; // 분 단위
  distance?: number; // km 단위
  location?: string;
  weather?: "sunny" | "cloudy" | "rainy" | "snowy";
  mood?: "happy" | "normal" | "tired";
  notes?: string;
}

export default function WalkPage() {
  const { t } = useLanguage();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [records, setRecords] = useState<WalkRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WalkRecord | null>(null);
  const [dateRange, setDateRange] = useState<"week" | "month" | "all">("week");

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

  // 산책 기록 로드
  useEffect(() => {
    if (selectedPetId) {
      const saved = localStorage.getItem(`petchecky_walks_${selectedPetId}`);
      if (saved) {
        setRecords(JSON.parse(saved));
      } else {
        setRecords([]);
      }
    }
  }, [selectedPetId]);

  // 산책 기록 저장
  const saveRecords = (newRecords: WalkRecord[]) => {
    if (selectedPetId) {
      localStorage.setItem(
        `petchecky_walks_${selectedPetId}`,
        JSON.stringify(newRecords)
      );
      setRecords(newRecords);
    }
  };

  // 기록 추가/수정
  const handleSaveRecord = (record: Omit<WalkRecord, "id" | "petId">) => {
    if (!selectedPetId) return;

    if (editingRecord) {
      const updated = records.map((r) =>
        r.id === editingRecord.id
          ? { ...record, id: r.id, petId: selectedPetId }
          : r
      );
      saveRecords(updated);
    } else {
      const newRecord: WalkRecord = {
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
    if (confirm("이 산책 기록을 삭제하시겠습니까?")) {
      saveRecords(records.filter((r) => r.id !== id));
    }
  };

  // 날짜 범위에 따른 필터링
  const getFilteredRecords = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "all":
        return records.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }

    return records
      .filter((r) => new Date(r.date) >= startDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredRecords = getFilteredRecords();

  // 통계 계산
  const getStats = () => {
    if (filteredRecords.length === 0) return null;

    const totalDuration = filteredRecords.reduce((sum, r) => sum + r.duration, 0);
    const totalDistance = filteredRecords.reduce((sum, r) => sum + (r.distance || 0), 0);
    const avgDuration = totalDuration / filteredRecords.length;

    // 이번 주 산책 횟수
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisWeekCount = records.filter(
      (r) => new Date(r.date) >= thisWeekStart
    ).length;

    return {
      totalWalks: filteredRecords.length,
      totalDuration,
      totalDistance,
      avgDuration,
      thisWeekCount,
    };
  };

  const stats = getStats();

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
            <h1 className="text-lg font-bold text-gray-800">🚶 산책 기록</h1>
          </div>
          <button
            onClick={() => {
              setEditingRecord(null);
              setShowModal(true);
            }}
            className="rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            + 산책 기록
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
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* 통계 카드 */}
        {stats && <WalkStats stats={stats} />}

        {/* 기간 선택 */}
        <div className="mb-4 flex gap-2">
          {(["week", "month", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                dateRange === range
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {range === "week" ? "이번 주" : range === "month" ? "이번 달" : "전체"}
            </button>
          ))}
        </div>

        {/* 산책 기록 목록 */}
        {filteredRecords.length > 0 ? (
          <WalkHistory
            records={filteredRecords}
            onEdit={(record) => {
              setEditingRecord(record);
              setShowModal(true);
            }}
            onDelete={handleDeleteRecord}
          />
        ) : (
          <div className="rounded-xl bg-white border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-3">🐕‍🦺</div>
            <p className="text-gray-500 mb-4">
              {dateRange === "all"
                ? "아직 산책 기록이 없습니다"
                : `${dateRange === "week" ? "이번 주" : "이번 달"} 산책 기록이 없습니다`}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-full bg-green-500 px-6 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              첫 산책 기록하기
            </button>
          </div>
        )}

        {/* 산책 팁 */}
        {selectedPet && (
          <div className="mt-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
            <h3 className="font-bold text-gray-800 mb-2">
              🌿 {selectedPet.name}의 산책 팁
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {selectedPet.species === "dog" ? "강아지는 하루 2회, 총 30분~1시간 산책을 권장해요" : "고양이는 실내에서 놀이 시간을 충분히 가지세요"}</li>
              <li>• 더운 날씨에는 아스팔트 온도를 확인하세요</li>
              <li>• 산책 후에는 발바닥을 깨끗이 닦아주세요</li>
            </ul>
          </div>
        )}
      </main>

      {/* 산책 기록 모달 */}
      {showModal && selectedPet && (
        <WalkRecordModal
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
