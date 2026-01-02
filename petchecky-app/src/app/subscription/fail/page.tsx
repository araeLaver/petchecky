"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function FailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message") || "결제가 취소되었거나 실패했습니다.";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">결제 실패</h1>
        <p className="text-gray-600 mb-2">{decodeURIComponent(errorMessage)}</p>
        {errorCode && (
          <p className="text-sm text-gray-400 mb-6">에러 코드: {errorCode}</p>
        )}

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

        <p className="text-xs text-gray-500 mt-6">
          문제가 계속되면 고객센터로 문의해주세요.
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionFailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <FailContent />
    </Suspense>
  );
}
