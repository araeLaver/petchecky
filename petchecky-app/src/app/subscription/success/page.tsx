"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, getAccessToken } = useAuth();
  const { refreshSubscription } = useSubscription();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("결제를 처리하고 있습니다...");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const authKey = searchParams.get("authKey");
        const customerKey = searchParams.get("customerKey");
        const planType = searchParams.get("planType");

        // 이미 처리 완료된 경우 (새로고침 등)
        if (!authKey) {
          setStatus("success");
          setMessage("구독이 완료되었습니다!");
          return;
        }

        if (!user) {
          throw new Error("로그인이 필요합니다.");
        }

        if (!planType || !["premium", "premium_plus"].includes(planType)) {
          throw new Error("유효하지 않은 플랜입니다.");
        }

        // 인증 토큰을 헤더에 포함하여 요청 (보안 강화)
        const token = await getAccessToken();
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // 빌링키 발급 및 결제 확인
        const response = await fetch("/api/billing/confirm", {
          method: "POST",
          headers,
          body: JSON.stringify({
            authKey,
            customerKey: customerKey || user.id,
            // userId는 더 이상 클라이언트에서 전송하지 않음 - 서버에서 인증 토큰으로 검증
            planType,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "결제 처리에 실패했습니다.");
        }

        // 구독 상태 새로고침
        await refreshSubscription();

        setStatus("success");
        setMessage("구독이 시작되었습니다!");
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "결제 처리 중 오류가 발생했습니다.");
      }
    };

    if (user !== undefined) {
      confirmPayment();
    }
  }, [searchParams, user, refreshSubscription]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
        {status === "processing" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">결제 처리중</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">결제 완료!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                상담 시작하기
              </button>
              <button
                onClick={() => router.push("/subscription")}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                구독 정보 확인
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">결제 실패</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/subscription")}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                다시 시도하기
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
