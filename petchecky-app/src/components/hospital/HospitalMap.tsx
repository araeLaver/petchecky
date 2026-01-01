"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface Hospital {
  id: string;
  name: string;
  address: string;
  roadAddress: string;
  phone: string;
  distance: string;
  lat: number;
  lng: number;
  placeUrl: string;
}

interface HospitalMapProps {
  hospitals: Hospital[];
  center: { lat: number; lng: number };
  selectedHospital: Hospital | null;
  onMarkerClick: (hospital: Hospital) => void;
}

export default function HospitalMap({
  hospitals,
  center,
  selectedHospital,
  onMarkerClick,
}: HospitalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const infoWindowRef = useRef<kakao.maps.InfoWindow | null>(null);
  const currentMarkerRef = useRef<kakao.maps.Marker | null>(null);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: 5,
      };
      const newMap = new window.kakao.maps.Map(mapRef.current!, options);
      setMap(newMap);
      setIsMapLoaded(true);

      // 현재 위치 마커 (파란색 원)
      const currentMarker = new window.kakao.maps.CustomOverlay({
        map: newMap,
        position: new window.kakao.maps.LatLng(center.lat, center.lng),
        content: `
          <div style="
            width: 20px;
            height: 20px;
            background: #3B82F6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `,
        yAnchor: 0.5,
      });
      currentMarkerRef.current = currentMarker as unknown as kakao.maps.Marker;
    });
  }, [center.lat, center.lng]);

  // 마커 클릭 핸들러
  const handleMarkerClick = useCallback(
    (hospital: Hospital) => {
      onMarkerClick(hospital);
    },
    [onMarkerClick]
  );

  // 병원 마커 표시
  useEffect(() => {
    if (!map || !isMapLoaded || hospitals.length === 0) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    hospitals.forEach((hospital) => {
      const position = new window.kakao.maps.LatLng(hospital.lat, hospital.lng);
      const marker = new window.kakao.maps.Marker({
        map,
        position,
        title: hospital.name,
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, "click", () => {
        handleMarkerClick(hospital);
      });

      markersRef.current.push(marker);
    });
  }, [map, isMapLoaded, hospitals, handleMarkerClick]);

  // 선택된 병원 인포윈도우 표시
  useEffect(() => {
    if (!map || !selectedHospital) return;

    // 기존 인포윈도우 닫기
    infoWindowRef.current?.close();

    const position = new window.kakao.maps.LatLng(
      selectedHospital.lat,
      selectedHospital.lng
    );

    const infoWindow = new window.kakao.maps.InfoWindow({
      content: `
        <div style="padding:12px;min-width:200px;max-width:280px;">
          <strong style="font-size:14px;color:#1f2937;">${selectedHospital.name}</strong>
          <p style="font-size:12px;color:#6b7280;margin:6px 0 4px;">${selectedHospital.roadAddress || selectedHospital.address}</p>
          <p style="font-size:13px;color:#3b82f6;font-weight:500;">${selectedHospital.phone || "전화번호 없음"}</p>
        </div>
      `,
      removable: true,
    });

    const markerIndex = hospitals.findIndex((h) => h.id === selectedHospital.id);
    if (markerIndex !== -1 && markersRef.current[markerIndex]) {
      infoWindow.open(map, markersRef.current[markerIndex]);
      infoWindowRef.current = infoWindow;
    }

    map.setCenter(position);
  }, [map, selectedHospital, hospitals]);

  return (
    <div className="relative h-full w-full min-h-[300px]">
      <div ref={mapRef} className="h-full w-full" />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-2" />
            <p className="text-sm text-gray-500">지도 로딩 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
