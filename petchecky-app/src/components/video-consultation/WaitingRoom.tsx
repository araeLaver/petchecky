"use client";

import { useState, useEffect, useRef } from "react";

interface WaitingRoomProps {
  queuePosition: number;
  vetName: string;
  vetSpecialty: string;
  urgency: "normal" | "urgent";
  onCancel: () => void;
  onReady: () => void;
}

export default function WaitingRoom({
  queuePosition,
  vetName,
  vetSpecialty,
  urgency,
  onCancel,
  onReady,
}: WaitingRoomProps) {
  const [currentPosition, setCurrentPosition] = useState(queuePosition);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [testingDevices, setTestingDevices] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulate queue movement
  useEffect(() => {
    if (currentPosition <= 0) return;

    const interval = setInterval(() => {
      setCurrentPosition((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, urgency === "urgent" ? 5000 : 10000); // Urgent: faster queue

    return () => clearInterval(interval);
  }, [urgency, currentPosition]);

  // Test camera and microphone
  const testDevices = async () => {
    setTestingDevices(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraReady(true);
      setMicReady(true);
    } catch (error) {
      console.error("Device access error:", error);
      alert("카메라와 마이크 접근 권한이 필요합니다.\n브라우저 설정에서 권한을 허용해주세요.");
    } finally {
      setTestingDevices(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const estimatedWaitTime = urgency === "urgent"
    ? Math.max(1, currentPosition * 1)
    : Math.max(1, currentPosition * 2);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            화상 상담 대기실
          </h1>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            취소
          </button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Queue Status */}
          <div className={`rounded-2xl p-6 text-center ${
            urgency === "urgent"
              ? "bg-red-50 border-2 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              : "bg-blue-50 border-2 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
          }`}>
            {currentPosition > 0 ? (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg">
                  <div className="w-14 h-14 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  urgency === "urgent" ? "text-red-800 dark:text-red-300" : "text-blue-800 dark:text-blue-300"
                }`}>
                  대기 순서: {currentPosition}번째
                </h2>
                <p className={urgency === "urgent" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}>
                  예상 대기 시간: 약 {estimatedWaitTime}분
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
                  연결 준비 완료!
                </h2>
                <p className="text-green-600 dark:text-green-400">
                  수의사가 곧 연결됩니다
                </p>
              </>
            )}
          </div>

          {/* Vet Info */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-3xl">👨‍⚕️</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white">{vetName} 수의사</h3>
                <p className="text-gray-500 dark:text-gray-400">{vetSpecialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400">상담 가능</span>
                </div>
              </div>
            </div>
          </div>

          {/* Camera/Mic Test */}
          <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">장치 테스트</h3>

            {/* Video Preview */}
            <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video mb-4">
              {cameraReady ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-5xl mb-2 block">📷</span>
                    <p className="text-gray-400">카메라 미리보기</p>
                  </div>
                </div>
              )}
            </div>

            {/* Device Status */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`rounded-xl p-3 flex items-center gap-3 ${
                cameraReady
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-gray-50 dark:bg-gray-700"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  cameraReady ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className={`font-medium ${cameraReady ? "text-green-800 dark:text-green-300" : "text-gray-700 dark:text-gray-300"}`}>
                    카메라
                  </p>
                  <p className={`text-sm ${cameraReady ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                    {cameraReady ? "준비됨" : "테스트 필요"}
                  </p>
                </div>
              </div>

              <div className={`rounded-xl p-3 flex items-center gap-3 ${
                micReady
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-gray-50 dark:bg-gray-700"
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  micReady ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <p className={`font-medium ${micReady ? "text-green-800 dark:text-green-300" : "text-gray-700 dark:text-gray-300"}`}>
                    마이크
                  </p>
                  <p className={`text-sm ${micReady ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                    {micReady ? "준비됨" : "테스트 필요"}
                  </p>
                </div>
              </div>
            </div>

            {/* Test Button */}
            {!cameraReady && (
              <button
                onClick={testDevices}
                disabled={testingDevices}
                className="w-full rounded-xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {testingDevices ? "테스트 중..." : "카메라/마이크 테스트"}
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">상담 팁</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              <li>• 밝은 곳에서 반려동물을 촬영해주세요</li>
              <li>• 증상 부위를 가까이 보여주시면 좋아요</li>
              <li>• 조용한 환경에서 상담하시면 더 원활해요</li>
            </ul>
          </div>

          {/* Ready Button */}
          {currentPosition === 0 && cameraReady && micReady && (
            <button
              onClick={onReady}
              className="w-full rounded-2xl bg-green-500 py-4 text-lg font-bold text-white hover:bg-green-600 transition-colors animate-pulse"
            >
              상담 시작하기
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
