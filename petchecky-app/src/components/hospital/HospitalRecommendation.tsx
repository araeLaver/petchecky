"use client";

import { useState, useEffect, useCallback } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import HospitalMap, { Hospital } from "./HospitalMap";
import HospitalList from "./HospitalList";
import ReservationModal from "./ReservationModal";

interface HospitalRecommendationProps {
  severity: "low" | "medium" | "high";
  isVisible: boolean;
  onClose: () => void;
  petName?: string;
  petSpecies?: "dog" | "cat";
}

export default function HospitalRecommendation({
  severity,
  isVisible,
  onClose,
  petName,
  petSpecies,
}: HospitalRecommendationProps) {
  const {
    latitude,
    longitude,
    error: locationError,
    isLoading: locationLoading,
  } = useGeolocation();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [reservationHospital, setReservationHospital] = useState<Hospital | null>(null);
  const [showReservationSuccess, setShowReservationSuccess] = useState(false);

  // 위험도별 메시지
  const getSeverityConfig = () => {
    switch (severity) {
      case "high":
        return {
          emoji: "🚨",
          title: "즉시 병원 방문을 권장합니다",
          description: "심각한 증상이 의심됩니다. 가까운 동물병원을 방문해주세요.",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
        };
      case "medium":
        return {
          emoji: "⚠️",
          title: "병원 방문을 고려해주세요",
          description: "증상이 지속된다면 수의사 상담을 권장합니다.",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
        };
      default:
        return {
          emoji: "ℹ️",
          title: "참고용 정보입니다",
          description: "필요시 가까운 동물병원을 확인해보세요.",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
        };
    }
  };

  // 병원 검색
  const searchHospitals = useCallback(() => {
    if (!latitude || !longitude) return;

    // 카카오맵 SDK 로드 확인
    if (!window.kakao?.maps) {
      setSearchError("지도 서비스를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    window.kakao.maps.load(() => {
      const ps = new window.kakao.maps.services.Places();
      const location = new window.kakao.maps.LatLng(latitude, longitude);

      ps.keywordSearch(
        "동물병원",
        (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const hospitalList: Hospital[] = result.slice(0, 10).map((place) => ({
              id: place.id,
              name: place.place_name,
              address: place.address_name,
              roadAddress: place.road_address_name,
              phone: place.phone || "",
              distance: place.distance,
              lat: parseFloat(place.y),
              lng: parseFloat(place.x),
              placeUrl: place.place_url,
            }));
            setHospitals(hospitalList);
            if (hospitalList.length > 0) {
              setSelectedHospital(hospitalList[0]);
            }
          } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
            setHospitals([]);
          } else {
            setSearchError("병원 검색 중 오류가 발생했습니다.");
          }
          setIsSearching(false);
        },
        {
          location,
          radius: 5000, // 5km
          size: 15,
          sort: "distance",
        }
      );
    });
  }, [latitude, longitude]);

  // 위치 로드 완료 후 검색
  useEffect(() => {
    if (isVisible && latitude && longitude && !locationLoading) {
      searchHospitals();
    }
  }, [isVisible, latitude, longitude, locationLoading, searchHospitals]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isVisible) return null;

  const config = getSeverityConfig();
  const isLoading = locationLoading || isSearching;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* 헤더 */}
      <div className={`border-b ${config.borderColor} ${config.bgColor} p-4`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.emoji}</span>
            <div>
              <h2 className={`font-bold ${config.textColor}`}>{config.title}</h2>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 뷰 토글 */}
      <div className="flex border-b border-gray-200 sm:hidden">
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            viewMode === "list"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500"
          }`}
        >
          📋 목록
        </button>
        <button
          onClick={() => setViewMode("map")}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            viewMode === "map"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500"
          }`}
        >
          🗺️ 지도
        </button>
      </div>

      {/* 위치 에러 알림 */}
      {locationError && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
          <p className="text-sm text-yellow-700">{locationError}</p>
        </div>
      )}

      {/* 검색 에러 알림 */}
      {searchError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-center">
          <p className="text-sm text-red-700">{searchError}</p>
          <button
            onClick={searchHospitals}
            className="mt-1 text-sm text-red-600 underline hover:text-red-800"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 병원 목록 (모바일: 조건부, 데스크톱: 항상 표시) */}
        <div
          className={`w-full sm:w-1/2 lg:w-2/5 overflow-y-auto border-r border-gray-200 ${
            viewMode === "map" ? "hidden sm:block" : ""
          }`}
        >
          <HospitalList
            hospitals={hospitals}
            isLoading={isLoading}
            selectedHospital={selectedHospital}
            onSelect={setSelectedHospital}
            onReservation={setReservationHospital}
          />
        </div>

        {/* 지도 (모바일: 조건부, 데스크톱: 항상 표시) */}
        <div
          className={`w-full sm:w-1/2 lg:w-3/5 ${
            viewMode === "list" ? "hidden sm:block" : ""
          }`}
        >
          {latitude && longitude ? (
            <HospitalMap
              hospitals={hospitals}
              center={{ lat: latitude, lng: longitude }}
              selectedHospital={selectedHospital}
              onMarkerClick={setSelectedHospital}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <p className="text-gray-500">위치 정보를 불러오는 중...</p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 안내 */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-center">
        <p className="text-xs text-gray-500">
          * 영업시간 및 진료 가능 여부는 병원에 직접 문의해주세요
        </p>
      </div>

      {/* 예약 모달 */}
      {reservationHospital && (
        <ReservationModal
          hospital={reservationHospital}
          petName={petName}
          petSpecies={petSpecies}
          onClose={() => setReservationHospital(null)}
          onSuccess={() => {
            setReservationHospital(null);
            setShowReservationSuccess(true);
            setTimeout(() => setShowReservationSuccess(false), 3000);
          }}
        />
      )}

      {/* 예약 성공 토스트 */}
      {showReservationSuccess && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[70] animate-fade-in">
          <div className="rounded-full bg-green-500 px-6 py-3 text-white font-medium shadow-lg">
            예약 요청이 완료되었습니다!
          </div>
        </div>
      )}
    </div>
  );
}
