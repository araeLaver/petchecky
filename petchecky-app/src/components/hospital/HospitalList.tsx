"use client";

import { Hospital } from "./HospitalMap";

interface HospitalListProps {
  hospitals: Hospital[];
  isLoading: boolean;
  selectedHospital: Hospital | null;
  onSelect: (hospital: Hospital) => void;
  onReservation?: (hospital: Hospital) => void;
}

function formatDistance(meters: string): string {
  const m = parseInt(meters, 10);
  if (isNaN(m)) return meters;
  if (m >= 1000) {
    return `${(m / 1000).toFixed(1)}km`;
  }
  return `${m}m`;
}

export default function HospitalList({
  hospitals,
  isLoading,
  selectedHospital,
  onSelect,
  onReservation,
}: HospitalListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-3" />
          <p className="text-gray-500">주변 동물병원을 검색 중...</p>
        </div>
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-center p-6">
        <div>
          <span className="text-5xl">🏥</span>
          <p className="mt-4 text-gray-600 font-medium">주변에 동물병원이 없습니다</p>
          <p className="text-sm text-gray-400 mt-1">검색 반경을 넓혀보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {hospitals.map((hospital, index) => (
        <button
          key={hospital.id}
          onClick={() => onSelect(hospital)}
          className={`w-full p-4 text-left transition-colors ${
            selectedHospital?.id === hospital.id
              ? "bg-blue-50 border-l-4 border-blue-500"
              : "hover:bg-gray-50 border-l-4 border-transparent"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-800 truncate">
                  {hospital.name}
                </h3>
              </div>
              <p className="text-sm text-gray-500 mt-2 truncate pl-8">
                {hospital.roadAddress || hospital.address}
              </p>
              {hospital.phone && (
                <p className="text-sm text-gray-600 mt-1 pl-8">{hospital.phone}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                {formatDistance(hospital.distance)}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-wrap gap-2 mt-3 pl-8">
            {hospital.phone && (
              <a
                href={`tel:${hospital.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 min-w-[80px] rounded-lg bg-blue-500 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-600 transition-colors"
              >
                📞 전화
              </a>
            )}
            {onReservation && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReservation(hospital);
                }}
                className="flex-1 min-w-[80px] rounded-lg bg-green-500 py-2.5 text-center text-sm font-medium text-white hover:bg-green-600 transition-colors"
              >
                📅 예약
              </button>
            )}
            <a
              href={hospital.placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-w-[80px] rounded-lg border border-gray-300 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              🗺️ 상세
            </a>
          </div>
        </button>
      ))}
    </div>
  );
}
