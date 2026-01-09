"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface ConsultationRequest {
  petName: string;
  petSpecies: "dog" | "cat";
  petBreed: string;
  petAge: string;
  urgency: "normal" | "urgent";
  symptoms: string;
  duration: string;
}

const CONSULTATION_PRICES = {
  normal: 15000,
  urgent: 30000,
};

export default function VetConsultationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isPremium, isPremiumPlus } = useSubscription();
  const [step, setStep] = useState<"info" | "form" | "waiting" | "chat">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [form, setForm] = useState<ConsultationRequest>({
    petName: "",
    petSpecies: "dog",
    petBreed: "",
    petAge: "",
    urgency: "normal",
    symptoms: "",
    duration: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 시뮬레이션: 대기열 진입
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setQueuePosition(Math.floor(Math.random() * 5) + 1);
    setStep("waiting");
    setIsSubmitting(false);
  };

  // 프리미엄+ 사용자는 무료
  const getPrice = () => {
    if (isPremiumPlus) return 0;
    if (isPremium) return Math.floor(CONSULTATION_PRICES[form.urgency] * 0.5);
    return CONSULTATION_PRICES[form.urgency];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold text-gray-800">펫체키</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">실시간 수의사 상담</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {step === "info" && (
          <div className="space-y-6">
            {/* 서비스 소개 */}
            <div className="text-center">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                전문 수의사와 실시간 상담
              </h2>
              <p className="text-gray-500">
                24시간 전문 수의사가 대기하고 있습니다.<br />
                긴급한 상황에도 빠르게 상담받으세요.
              </p>
            </div>

            {/* 상담 유형 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">💬</span>
                  <div>
                    <h3 className="font-bold text-gray-800">일반 상담</h3>
                    <p className="text-sm text-gray-500">평균 대기 5-10분</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  일반적인 건강 상담, 예방접종 문의, 사료/영양 상담 등
                </p>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    {isPremiumPlus ? "무료" : `₩${CONSULTATION_PRICES.normal.toLocaleString()}`}
                  </span>
                  {isPremium && !isPremiumPlus && (
                    <span className="ml-2 text-sm text-green-600">50% 할인</span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🚨</span>
                  <div>
                    <h3 className="font-bold text-red-800">긴급 상담</h3>
                    <p className="text-sm text-red-600">우선 연결 (1-3분)</p>
                  </div>
                </div>
                <p className="text-sm text-red-700 mb-4">
                  응급 상황, 중독 의심, 심각한 증상 발생 시
                </p>
                <div className="text-right">
                  <span className="text-2xl font-bold text-red-600">
                    {isPremiumPlus ? "무료" : `₩${CONSULTATION_PRICES.urgent.toLocaleString()}`}
                  </span>
                  {isPremium && !isPremiumPlus && (
                    <span className="ml-2 text-sm text-green-600">50% 할인</span>
                  )}
                </div>
              </div>
            </div>

            {/* 프리미엄+ 혜택 안내 */}
            {!isPremiumPlus && (
              <div className="rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 p-5 text-center">
                <p className="text-sm text-purple-800 font-medium mb-2">
                  프리미엄+ 구독 시 수의사 상담 무제한 무료!
                </p>
                <Link
                  href="/subscription"
                  className="inline-block rounded-full bg-purple-500 px-6 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors"
                >
                  프리미엄+ 알아보기
                </Link>
              </div>
            )}

            {/* 상담 시작 버튼 */}
            <div className="text-center">
              {user ? (
                <button
                  onClick={() => setStep("form")}
                  className="rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl active:scale-95"
                >
                  상담 신청하기
                </button>
              ) : (
                <div>
                  <p className="text-gray-500 mb-3">상담을 위해 로그인이 필요합니다</p>
                  <Link
                    href="/"
                    className="inline-block rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-600"
                  >
                    로그인하러 가기
                  </Link>
                </div>
              )}
            </div>

            {/* 수의사 소개 */}
            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 text-center">상담 수의사진</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: "김수의", specialty: "내과 전문", exp: "15년" },
                  { name: "이동물", specialty: "외과 전문", exp: "12년" },
                  { name: "박펫케어", specialty: "피부과 전문", exp: "10년" },
                ].map((vet) => (
                  <div key={vet.name} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                      👨‍⚕️
                    </div>
                    <p className="font-medium text-gray-800 text-sm">{vet.name}</p>
                    <p className="text-xs text-gray-500">{vet.specialty}</p>
                    <p className="text-xs text-blue-600">경력 {vet.exp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "form" && (
          <div className="space-y-6">
            <button
              onClick={() => setStep("info")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              ← 뒤로
            </button>

            <div className="rounded-2xl bg-white border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">상담 정보 입력</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 긴급도 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상담 유형 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, urgency: "normal" }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.urgency === "normal"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">💬</span>
                      <p className="font-medium mt-1">일반 상담</p>
                      <p className="text-sm text-gray-500">₩{getPrice().toLocaleString()}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, urgency: "urgent" }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.urgency === "urgent"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">🚨</span>
                      <p className="font-medium mt-1">긴급 상담</p>
                      <p className="text-sm text-gray-500">₩{getPrice().toLocaleString()}</p>
                    </button>
                  </div>
                </div>

                {/* 반려동물 정보 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      반려동물 이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="petName"
                      value={form.petName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      종류 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="petSpecies"
                      value={form.petSpecies}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="dog">강아지</option>
                      <option value="cat">고양이</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      품종
                    </label>
                    <input
                      type="text"
                      name="petBreed"
                      value={form.petBreed}
                      onChange={handleChange}
                      placeholder="예: 말티즈"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      나이
                    </label>
                    <input
                      type="text"
                      name="petAge"
                      value={form.petAge}
                      onChange={handleChange}
                      placeholder="예: 3세"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    현재 증상 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleChange}
                    rows={3}
                    placeholder="어떤 증상이 있는지 자세히 설명해주세요"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    증상 지속 기간
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="예: 3일 전부터"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* 결제 정보 */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">상담 비용</span>
                    <span className="text-xl font-bold text-blue-600">
                      {getPrice() === 0 ? "무료" : `₩${getPrice().toLocaleString()}`}
                    </span>
                  </div>
                  {isPremiumPlus && (
                    <p className="text-sm text-purple-600 mt-1">
                      프리미엄+ 혜택으로 무료 이용
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !form.petName || !form.symptoms}
                  className="w-full rounded-lg bg-blue-500 py-4 font-semibold text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "접수 중..." : "상담 신청"}
                </button>
              </form>
            </div>
          </div>
        )}

        {step === "waiting" && (
          <div className="text-center space-y-6 py-12">
            <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-16 h-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                수의사 연결 중...
              </h2>
              <p className="text-gray-500">
                대기 순서: <span className="font-bold text-blue-600">{queuePosition}번째</span>
              </p>
              <p className="text-sm text-gray-400 mt-2">
                예상 대기 시간: 약 {queuePosition * 2}분
              </p>
            </div>

            <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 max-w-sm mx-auto">
              <p className="text-sm text-yellow-800">
                상담 연결 시 알림을 보내드립니다.<br />
                잠시 다른 작업을 하셔도 괜찮습니다.
              </p>
            </div>

            <button
              onClick={() => setStep("info")}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              상담 취소
            </button>

            {/* 데모용: 상담 시작 버튼 */}
            <div className="pt-8">
              <button
                onClick={() => setStep("chat")}
                className="rounded-full bg-green-500 px-6 py-3 text-white font-medium hover:bg-green-600"
              >
                [데모] 상담 시작하기
              </button>
            </div>
          </div>
        )}

        {step === "chat" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-center">
              <p className="text-green-800 font-medium">
                수의사 김수의님과 연결되었습니다
              </p>
            </div>

            {/* 채팅 영역 */}
            <div className="rounded-2xl bg-white border border-gray-100 h-[400px] flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-3">
                    <p className="text-sm text-gray-800">
                      안녕하세요, 김수의 수의사입니다. {form.petName}의 증상에 대해 자세히 말씀해주시겠어요?
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                  <button className="rounded-full bg-blue-500 px-6 py-2 text-white font-medium hover:bg-blue-600">
                    전송
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50">
                📞 음성 통화
              </button>
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    petName: form.petName,
                    urgency: form.urgency,
                    symptoms: form.symptoms,
                  });
                  router.push(`/vet-consultation/video?${params.toString()}`);
                }}
                className="flex-1 rounded-lg border border-blue-300 bg-blue-50 py-3 font-medium text-blue-700 hover:bg-blue-100"
              >
                📹 화상 통화
              </button>
            </div>

            <button
              onClick={() => setStep("info")}
              className="w-full rounded-lg bg-red-500 py-3 font-medium text-white hover:bg-red-600"
            >
              상담 종료
            </button>
          </div>
        )}
      </main>

      {/* 응급 연락처 */}
      <div className="fixed bottom-4 right-4">
        <a
          href="tel:119"
          className="flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-red-600"
        >
          🚑 응급 119
        </a>
      </div>
    </div>
  );
}
