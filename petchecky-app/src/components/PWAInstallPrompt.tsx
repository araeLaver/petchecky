"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallPromptProps {
  /** Delay before showing the prompt (ms) */
  delay?: number;
  /** Minimum visits before showing */
  minVisits?: number;
}

// Inline SVG Icons
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SmartphoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function PWAInstallPrompt({
  delay = 5000,
  minVisits = 2,
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Check if running in standalone mode
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Check for iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    if (isStandalone) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      checkAndShowPrompt();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [isStandalone]);

  // Track visits and check display conditions
  const checkAndShowPrompt = useCallback(() => {
    if (isStandalone) return;

    // Check if user dismissed permanently
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed === "permanent") return;

    // Check temporary dismiss
    const dismissedAt = localStorage.getItem("pwa-prompt-dismissed-at");
    if (dismissedAt) {
      const dismissDate = new Date(dismissedAt);
      const now = new Date();
      const daysDiff = (now.getTime() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 7) return; // Wait 7 days before showing again
    }

    // Track visits
    const visits = parseInt(localStorage.getItem("pwa-visits") || "0", 10);
    localStorage.setItem("pwa-visits", String(visits + 1));

    // Show prompt after delay and minimum visits
    if (visits >= minVisits) {
      setTimeout(() => {
        setShowPrompt(true);
      }, delay);
    }
  }, [isStandalone, delay, minVisits]);

  // Check for iOS users without beforeinstallprompt
  useEffect(() => {
    if (isIOS && !isStandalone) {
      checkAndShowPrompt();
    }
  }, [isIOS, isStandalone, checkAndShowPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS fallback - show iOS guide
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return;
    }

    setInstalling(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        localStorage.setItem("pwa-installed", "true");
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("Install error:", error);
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = (permanent: boolean = false) => {
    setShowPrompt(false);
    setShowIOSGuide(false);

    if (permanent) {
      localStorage.setItem("pwa-prompt-dismissed", "permanent");
    } else {
      localStorage.setItem("pwa-prompt-dismissed-at", new Date().toISOString());
    }
  };

  // Don't render if already installed or no prompt available
  if (isStandalone || (!showPrompt && !showIOSGuide)) {
    return null;
  }

  // iOS Safari guide
  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fadeIn">
        <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 animate-slideUp">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">홈 화면에 추가하기</h2>
            <button
              onClick={() => handleDismiss(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="닫기"
            >
              <XIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">공유 버튼 탭하기</p>
                <p className="text-sm text-gray-500 mt-1">
                  Safari 하단의 <ShareIcon className="w-4 h-4 inline text-blue-500" /> 공유 버튼을 탭하세요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">&apos;홈 화면에 추가&apos; 선택</p>
                <p className="text-sm text-gray-500 mt-1">
                  아래로 스크롤하여 <PlusIcon className="w-4 h-4 inline" /> 홈 화면에 추가를 선택하세요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">&apos;추가&apos; 탭하기</p>
                <p className="text-sm text-gray-500 mt-1">
                  오른쪽 상단의 &apos;추가&apos;를 탭하면 완료됩니다
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDismiss(false)}
            className="w-full mt-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  // Standard install prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slideUp">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 max-w-lg mx-auto">
        <div className="flex items-start gap-4">
          {/* App Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <SmartphoneIcon className="w-7 h-7 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">펫체키 앱 설치</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              홈 화면에 추가하고 더 빠르게 이용하세요
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckIcon className="w-3 h-3" /> 빠른 실행
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                <CheckIcon className="w-3 h-3" /> 오프라인 지원
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                <CheckIcon className="w-3 h-3" /> 푸시 알림
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => handleDismiss(false)}
            className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
            aria-label="닫기"
          >
            <XIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleDismiss(true)}
            className="flex-1 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
          >
            다시 보지 않기
          </button>
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2"
          >
            {installing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                설치 중...
              </>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4" />
                설치하기
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
