"use client";

import { usePushNotification } from "@/contexts/PushNotificationContext";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationSettingsProps {
  onClose: () => void;
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { user } = useAuth();
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    enableNotifications,
    disableNotifications,
  } = usePushNotification();

  const handleToggle = async () => {
    if (isSubscribed) {
      await disableNotifications();
    } else {
      const success = await enableNotifications();
      if (!success && permission === "denied") {
        alert("브라우저 설정에서 알림 권한을 허용해주세요.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">알림 설정</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* 브라우저 지원 여부 */}
          {!isSupported ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-center">
              <p className="text-sm text-yellow-700">
                이 브라우저는 푸시 알림을 지원하지 않습니다.
              </p>
              <p className="mt-1 text-xs text-yellow-600">
                Chrome, Firefox, Edge 등 최신 브라우저를 사용해주세요.
              </p>
            </div>
          ) : (
            <>
              {/* 로그인 필요 안내 */}
              {!user && (
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <p className="text-sm text-blue-700">
                    푸시 알림을 받으려면 로그인이 필요합니다.
                  </p>
                </div>
              )}

              {/* 알림 권한이 거부된 경우 */}
              {permission === "denied" && (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-700 font-medium">
                    알림이 차단되어 있습니다
                  </p>
                  <p className="mt-1 text-xs text-red-600">
                    브라우저 설정에서 이 사이트의 알림 권한을 허용해주세요.
                  </p>
                </div>
              )}

              {/* 푸시 알림 토글 */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-800">푸시 알림</p>
                  <p className="text-sm text-gray-500">
                    건강 체크 리마인더, 중요 알림을 받아보세요
                  </p>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={isLoading || permission === "denied" || !user}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isSubscribed ? "bg-blue-500" : "bg-gray-300"
                  } ${(isLoading || permission === "denied" || !user) && "opacity-50 cursor-not-allowed"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isSubscribed ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* 알림 종류 설명 */}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">알림 종류</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">1.</span>
                    <span>건강 체크 리마인더</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">2.</span>
                    <span>예방접종 일정 알림</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">3.</span>
                    <span>긴급 건강 정보</span>
                  </li>
                </ul>
              </div>

              {/* 상태 표시 */}
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  {isSubscribed ? (
                    <span className="text-green-600">알림이 활성화되어 있습니다</span>
                  ) : (
                    <span>알림이 비활성화되어 있습니다</span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-gray-100 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
