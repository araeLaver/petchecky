"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import PricingPlans from "@/components/subscription/PricingPlans";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";
import BillingModal from "@/components/subscription/BillingModal";
import { Plan } from "@/types/subscription";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isPremium, refreshSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      router.push("/login?redirect=/subscription");
      return;
    }
    if (plan.id !== "free") {
      setSelectedPlan(plan);
    }
  };

  const handlePaymentSuccess = async () => {
    setSelectedPlan(null);
    await refreshSubscription();
    router.push("/subscription/success");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            펫체키 프리미엄
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            우리 아이의 건강을 더 꼼꼼하게 챙기세요.
            프리미엄 구독으로 무제한 AI 상담과 다양한 혜택을 누려보세요.
          </p>
        </div>

        {/* 현재 구독 상태 (로그인 & 구독 중인 경우) */}
        {user && isPremium && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">내 구독</h2>
            <SubscriptionStatus />
          </div>
        )}

        {/* 가격 플랜 */}
        <PricingPlans onSelectPlan={handleSelectPlan} />

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            자주 묻는 질문
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                구독을 해지하면 어떻게 되나요?
              </h3>
              <p className="text-gray-600 text-sm">
                구독 해지 후에도 결제 기간이 끝날 때까지 모든 기능을 이용하실 수 있습니다.
                기간 종료 후 자동으로 무료 플랜으로 전환됩니다.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                결제는 어떻게 진행되나요?
              </h3>
              <p className="text-gray-600 text-sm">
                카드를 등록하시면 매월 같은 날짜에 자동으로 결제됩니다.
                토스페이먼츠를 통해 안전하게 결제됩니다.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                프리미엄+의 수의사 상담은 무엇인가요?
              </h3>
              <p className="text-gray-600 text-sm">
                프리미엄+ 구독자에게는 매월 2회의 실제 수의사와의 채팅 상담 기회가 제공됩니다.
                AI 상담 후 전문적인 조언이 필요할 때 이용하세요.
              </p>
            </div>
          </div>
        </div>

        {/* 홈으로 돌아가기 */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>

      {/* 결제 모달 */}
      {selectedPlan && (
        <BillingModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
