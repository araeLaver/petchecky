"use client";

import { PLANS, Plan, PlanType } from "@/types/subscription";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface PricingPlansProps {
  onSelectPlan: (plan: Plan) => void;
}

export default function PricingPlans({ onSelectPlan }: PricingPlansProps) {
  const { currentPlan, isLoading } = useSubscription();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLANS.map((plan) => {
        const isCurrentPlan = currentPlan === plan.id;
        const isUpgrade =
          (currentPlan === "free" && plan.id !== "free") ||
          (currentPlan === "premium" && plan.id === "premium_plus");

        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-6 border-2 transition-all ${
              plan.highlighted
                ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {/* 배지 */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    plan.id === "premium_plus" ? "bg-purple-500" : "bg-blue-500"
                  }`}
                >
                  {plan.badge}
                </span>
              </div>
            )}

            {/* 플랜 이름 */}
            <h3 className="text-xl font-bold text-gray-900 mt-2">{plan.name}</h3>

            {/* 가격 */}
            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900">
                {plan.monthlyPrice}
              </span>
              {plan.price > 0 && (
                <span className="text-gray-500 ml-1">/월</span>
              )}
            </div>

            {/* 기능 목록 */}
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 ${
                      plan.highlighted ? "text-blue-500" : "text-green-500"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-600 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* 버튼 */}
            <button
              onClick={() => onSelectPlan(plan)}
              disabled={isLoading || isCurrentPlan || plan.id === "free"}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold transition-all ${
                isCurrentPlan
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : plan.id === "free"
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : plan.highlighted
                  ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {isCurrentPlan
                ? "현재 플랜"
                : plan.id === "free"
                ? "기본 플랜"
                : isUpgrade
                ? "업그레이드"
                : "선택하기"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
