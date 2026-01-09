"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import WaitingRoom from "@/components/video-consultation/WaitingRoom";
import VideoCall from "@/components/video-consultation/VideoCall";

type PageStep = "loading" | "waiting" | "call" | "ended";

// Sample vet data
const VETS = [
  { id: 1, name: "김수의", specialty: "내과 전문", exp: "15년" },
  { id: 2, name: "이동물", specialty: "외과 전문", exp: "12년" },
  { id: 3, name: "박펫케어", specialty: "피부과 전문", exp: "10년" },
];

function VideoConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { isPremiumPlus } = useSubscription();

  const [step, setStep] = useState<PageStep>("loading");
  const [selectedVet, setSelectedVet] = useState(VETS[0]);
  const [consultationData, setConsultationData] = useState({
    petName: "",
    urgency: "normal" as "normal" | "urgent",
    symptoms: "",
  });
  const [queuePosition, setQueuePosition] = useState(0);
  const [callDuration, setCallDuration] = useState(0);

  // Parse URL params
  useEffect(() => {
    const petName = searchParams.get("petName") || "반려동물";
    const urgency = (searchParams.get("urgency") as "normal" | "urgent") || "normal";
    const symptoms = searchParams.get("symptoms") || "";

    setConsultationData({ petName, urgency, symptoms });

    // Assign random vet
    const randomVet = VETS[Math.floor(Math.random() * VETS.length)];
    setSelectedVet(randomVet);

    // Set initial queue position
    const initialQueue = urgency === "urgent"
      ? Math.floor(Math.random() * 2) + 1
      : Math.floor(Math.random() * 5) + 2;
    setQueuePosition(initialQueue);

    setStep("waiting");
  }, [searchParams]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/vet-consultation");
    }
  }, [user, router]);

  const handleCancel = () => {
    router.push("/vet-consultation");
  };

  const handleReady = () => {
    setStep("call");
  };

  const handleEndCall = () => {
    setStep("ended");
  };

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-white">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (step === "waiting") {
    return (
      <WaitingRoom
        queuePosition={queuePosition}
        vetName={selectedVet.name}
        vetSpecialty={selectedVet.specialty}
        urgency={consultationData.urgency}
        onCancel={handleCancel}
        onReady={handleReady}
      />
    );
  }

  if (step === "call") {
    return (
      <VideoCall
        onEnd={handleEndCall}
        vetName={selectedVet.name}
        vetSpecialty={selectedVet.specialty}
        petName={consultationData.petName}
        isDemo={true}
      />
    );
  }

  // Ended state
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          상담이 종료되었습니다
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {selectedVet.name} 수의사와의 상담이 완료되었습니다.
        </p>

        {/* Consultation Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">상담 요약</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">수의사</span>
              <span className="text-gray-800 dark:text-white">{selectedVet.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">반려동물</span>
              <span className="text-gray-800 dark:text-white">{consultationData.petName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">상담 유형</span>
              <span className={consultationData.urgency === "urgent" ? "text-red-500" : "text-blue-500"}>
                {consultationData.urgency === "urgent" ? "긴급 상담" : "일반 상담"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">요금</span>
              <span className="text-gray-800 dark:text-white font-semibold">
                {isPremiumPlus ? "무료 (프리미엄+)" : consultationData.urgency === "urgent" ? "₩30,000" : "₩15,000"}
              </span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-2">상담은 어떠셨나요?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="text-3xl hover:scale-110 transition-transform"
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/vet-consultation"
            className="block w-full rounded-xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-600 transition-colors"
          >
            다시 상담하기
          </Link>
          <Link
            href="/"
            className="block w-full rounded-xl bg-gray-100 dark:bg-gray-700 py-3 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>

        {/* Feedback Notice */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
          상담 내역은 마이페이지에서 확인하실 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default function VideoConsultationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-white">로딩 중...</p>
        </div>
      </div>
    }>
      <VideoConsultationContent />
    </Suspense>
  );
}
