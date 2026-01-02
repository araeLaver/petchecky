"use client";

import { useEffect, useState, useCallback } from "react";
import { Plan } from "@/types/subscription";
import { useAuth } from "@/contexts/AuthContext";
import { loadTossPayments, TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";

interface BillingModalProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BillingModal({ plan, onClose }: BillingModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);

  const customerKey = user?.id || `guest_${Date.now()}`;

  const initializePayment = useCallback(async () => {
    if (!user) {
      setError("로그인이 필요합니다.");
      setIsLoading(false);
      return;
    }

    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        throw new Error("결제 설정이 올바르지 않습니다.");
      }

      const tossPayments = await loadTossPayments(clientKey);
      const paymentWidgets = tossPayments.widgets({
        customerKey,
      });

      await paymentWidgets.setAmount({
        currency: "KRW",
        value: plan.price,
      });

      await paymentWidgets.renderPaymentMethods({
        selector: "#payment-method",
        variantKey: "DEFAULT",
      });

      await paymentWidgets.renderAgreement({
        selector: "#agreement",
        variantKey: "AGREEMENT",
      });

      setWidgets(paymentWidgets);
      setIsLoading(false);
    } catch (err) {
      console.error("Payment initialization error:", err);
      setError("결제 초기화에 실패했습니다.");
      setIsLoading(false);
    }
  }, [user, customerKey, plan.price]);

  useEffect(() => {
    initializePayment();
  }, [initializePayment]);

  const handlePayment = async () => {
    if (!widgets || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      await widgets.requestPayment({
        orderId: `SUB_${user.id.slice(0, 8)}_${Date.now()}`,
        orderName: `펫체키 ${plan.name} 구독`,
        customerEmail: user.email || undefined,
        customerName: user.user_metadata?.name || "사용자",
        successUrl: `${window.location.origin}/subscription/success?planType=${plan.id}&customerKey=${customerKey}`,
        failUrl: `${window.location.origin}/subscription/fail`,
      });
    } catch (err) {
      console.error("Payment request error:", err);
      if (err instanceof Error && err.message !== "사용자가 결제를 취소했습니다.") {
        setError(err.message || "결제 요청에 실패했습니다.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{plan.name} 구독</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6">
          {/* 구독 정보 */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">월 구독료</p>
                <p className="text-2xl font-bold text-blue-600">{plan.monthlyPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">다음 결제일</p>
                <p className="text-sm font-medium">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {/* 결제 위젯 */}
          {isLoading && !error ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div id="payment-method" className="mb-4"></div>
              <div id="agreement" className="mb-6"></div>
            </>
          )}

          {/* 결제 버튼 */}
          <button
            onClick={handlePayment}
            disabled={isLoading || !!error}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
              isLoading || error
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLoading ? "처리중..." : `${plan.monthlyPrice} 결제하기`}
          </button>

          {/* 안내 문구 */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            구독은 언제든 해지할 수 있으며, 해지 후에도 결제 기간까지 이용 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
