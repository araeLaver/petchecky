"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePWA, usePushNotification } from "@/hooks/usePWA";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// Install Prompt 컴포넌트
// ============================================

interface InstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

/**
 * PWA 설치 프롬프트 배너
 */
export function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isInstallable, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // 이전에 닫았는지 확인
  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // 7일 후 다시 표시
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      onInstall?.();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    setIsDismissed(true);
    onDismiss?.();
  };

  if (!isInstallable || isDismissed) return null;

  const content = (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </div>

        {/* 내용 */}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">앱 설치하기</h3>
          <p className="text-sm text-gray-500 mt-1">
            홈 화면에 추가하여 더 빠르게 이용하세요.
          </p>

          {/* 버튼 */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg
                hover:bg-blue-700 transition-colors"
            >
              설치
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-1.5 text-gray-600 text-sm font-medium rounded-lg
                hover:bg-gray-100 transition-colors"
            >
              나중에
            </button>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  if (prefersReducedMotion) {
    return content;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Update Banner 컴포넌트
// ============================================

interface UpdateBannerProps {
  onUpdate?: () => void;
  onDismiss?: () => void;
}

/**
 * PWA 업데이트 알림 배너
 */
export function UpdateBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isUpdateAvailable, updateServiceWorker } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  const handleUpdate = async () => {
    await updateServiceWorker();
    onUpdate?.();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (!isUpdateAvailable || isDismissed) return null;

  const content = (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>

        <div className="flex-1">
          <p className="font-medium">새 버전이 있습니다</p>
          <p className="text-sm text-blue-100">업데이트하여 새로운 기능을 사용하세요.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg
              hover:bg-blue-50 transition-colors"
          >
            업데이트
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-blue-200 hover:text-white rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  if (prefersReducedMotion) {
    return content;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Offline Banner 컴포넌트
// ============================================

/**
 * 오프라인 상태 배너
 */
export function OfflineBanner() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isOnline } = usePWA();

  if (isOnline) return null;

  const content = (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-yellow-900 py-2 px-4 text-center z-50">
      <div className="flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
        <span className="font-medium">오프라인 모드 - 일부 기능이 제한됩니다</span>
      </div>
    </div>
  );

  if (prefersReducedMotion) {
    return content;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        exit={{ y: 50 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Notification Permission 컴포넌트
// ============================================

interface NotificationPermissionProps {
  onGranted?: () => void;
  onDenied?: () => void;
}

/**
 * 알림 권한 요청 배너
 */
export function NotificationPermissionBanner({
  onGranted,
  onDenied,
}: NotificationPermissionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isSupported, permission, requestPermission, subscribe } = usePushNotification();
  const [isDismissed, setIsDismissed] = useState(false);

  // 이미 권한이 있거나, 거부되었으면 표시 안 함
  if (!isSupported || permission !== "default" || isDismissed) return null;

  const handleAllow = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      await subscribe();
      onGranted?.();
    } else {
      onDenied?.();
    }
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const content = (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-gray-900">알림 받기</h3>
          <p className="text-sm text-gray-500 mt-1">
            건강 리마인더, 새 댓글 등의 알림을 받으세요.
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAllow}
              className="px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg
                hover:bg-purple-700 transition-colors"
            >
              알림 허용
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-1.5 text-gray-600 text-sm font-medium rounded-lg
                hover:bg-gray-100 transition-colors"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (prefersReducedMotion) {
    return content;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// PWA Provider 컴포넌트
// ============================================

interface PWAProviderProps {
  children: React.ReactNode;
  showInstallPrompt?: boolean;
  showUpdateBanner?: boolean;
  showOfflineBanner?: boolean;
}

/**
 * PWA 기능 통합 Provider
 */
export function PWAProvider({
  children,
  showInstallPrompt = true,
  showUpdateBanner = true,
  showOfflineBanner = true,
}: PWAProviderProps) {
  return (
    <>
      {children}
      {showInstallPrompt && <InstallPrompt />}
      {showUpdateBanner && <UpdateBanner />}
      {showOfflineBanner && <OfflineBanner />}
    </>
  );
}
