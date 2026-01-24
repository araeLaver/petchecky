"use client";

import { useSubscription } from "@/contexts/SubscriptionContext";
import { useState } from "react";

export default function SubscriptionStatus() {
  const {
    subscription,
    isPremium,
    currentPlan,
    isLoading,
    cancelSubscription,
    vetConsultationsRemaining,
  } = useSubscription();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">무료 플랜</h3>
        <p className="text-gray-600 text-sm mb-4">
          월 20회 AI 상담을 이용할 수 있습니다.
        </p>
        <a
          href="/subscription"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          프리미엄 업그레이드
        </a>
      </div>
    );
  }

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const handleCancel = async () => {
    setIsCancelling(true);
    const success = await cancelSubscription();
    setIsCancelling(false);
    setShowCancelConfirm(false);
    if (success) {
      alert("구독이 해지되었습니다. 현재 결제 기간까지는 계속 이용하실 수 있습니다.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* 플랜 정보 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
              currentPlan === "premium_plus" ? "bg-purple-500" : "bg-blue-500"
            }`}
          >
            {currentPlan === "premium_plus" ? "프리미엄+" : "프리미엄"}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">다음 결제일</p>
          <p className="font-medium text-gray-900">{periodEnd}</p>
        </div>
      </div>

      {/* 카드 정보 */}
      {subscription?.card_company && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">
            {subscription.card_company} {subscription.card_number}
          </p>
        </div>
      )}

      {/* 프리미엄+ 수의사 상담 잔여 */}
      {currentPlan === "premium_plus" && (
        <div className="bg-purple-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-700">수의사 상담 잔여</span>
            <span className="font-bold text-purple-700">
              {vetConsultationsRemaining}회 / 2회
            </span>
          </div>
        </div>
      )}

      {/* 해지 버튼 */}
      {subscription?.status === "active" && (
        <>
          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              구독 해지
            </button>
          ) : (
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-700 mb-3">
                정말 구독을 해지하시겠습니까?<br />
                {periodEnd}까지는 계속 이용 가능합니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:bg-gray-300"
                >
                  {isCancelling ? "처리중..." : "해지하기"}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {subscription?.status === "cancelled" && (
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-sm text-yellow-700">
            구독이 해지 예정입니다. {periodEnd}까지 이용 가능합니다.
          </p>
        </div>
      )}
    </div>
  );
}
