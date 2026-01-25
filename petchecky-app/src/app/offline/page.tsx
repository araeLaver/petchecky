"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Inline SVG Icons
const WifiOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const PetIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
  </svg>
);

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-redirect when back online
      window.location.reload();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await fetch("/", { method: "HEAD" });
      window.location.href = "/";
    } catch {
      setRetrying(false);
    }
  };

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <RefreshIcon className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-lg text-gray-600">연결이 복원되었습니다. 페이지를 새로고침합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOffIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            오프라인 상태입니다
          </h1>
          <p className="text-gray-600">
            인터넷에 연결되어 있지 않습니다.<br />
            Wi-Fi나 데이터 연결을 확인해주세요.
          </p>
        </div>

        {/* Retry Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            <RefreshIcon className={`w-5 h-5 ${retrying ? "animate-spin" : ""}`} />
            {retrying ? "연결 확인 중..." : "다시 시도"}
          </button>
        </div>

        {/* Cached Features */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HomeIcon className="w-5 h-5" />
            오프라인에서도 이용 가능한 기능
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <MessageIcon className="w-3 h-3 text-blue-600" />
              </span>
              <div>
                <p className="font-medium text-gray-900">이전 상담 기록</p>
                <p className="text-sm text-gray-500">저장된 AI 상담 내역을 확인할 수 있습니다</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <PetIcon className="w-3 h-3 text-green-600" />
              </span>
              <div>
                <p className="font-medium text-gray-900">내 반려동물 정보</p>
                <p className="text-sm text-gray-500">등록된 반려동물 정보를 확인할 수 있습니다</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertIcon className="w-3 h-3 text-orange-600" />
              </span>
              <div>
                <p className="font-medium text-gray-900">응급 상황 가이드</p>
                <p className="text-sm text-gray-500">캐시된 응급 대처 방법을 확인할 수 있습니다</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 rounded-2xl p-6">
          <h3 className="font-semibold text-amber-900 mb-3">연결 문제 해결 방법</h3>
          <ul className="space-y-2 text-sm text-amber-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Wi-Fi가 켜져 있는지 확인하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>비행기 모드가 꺼져 있는지 확인하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>모바일 데이터가 켜져 있는지 확인하세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>라우터를 재시작해 보세요</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
