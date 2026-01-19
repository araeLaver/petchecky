"use client";

import { Skeleton, SkeletonText, SkeletonCircle } from "@/components/Skeleton";

/**
 * 메인 페이지 로딩 스켈레톤
 */
export function MainPageLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <SkeletonCircle className="w-8 h-8" />
            <SkeletonText className="w-20" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonCircle className="w-8 h-8" />
            <Skeleton className="w-24 h-8 rounded-full" />
          </div>
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-5xl animate-pulse">🐾</div>
          <SkeletonText className="w-32 mx-auto mb-2" />
          <SkeletonText className="w-24 mx-auto h-3" />
        </div>
      </main>
    </div>
  );
}

/**
 * 채팅 페이지 로딩 스켈레톤
 */
export function ChatPageLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-white p-4">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1">
          <SkeletonText className="w-24 mb-1" />
          <SkeletonText className="w-16 h-3" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 p-4">
        {/* Assistant message */}
        <div className="flex gap-3">
          <SkeletonCircle className="w-8 h-8 flex-shrink-0" />
          <Skeleton className="h-20 w-64 rounded-2xl" />
        </div>
        {/* User message */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 rounded-2xl" />
        </div>
        {/* Assistant message */}
        <div className="flex gap-3">
          <SkeletonCircle className="w-8 h-8 flex-shrink-0" />
          <Skeleton className="h-32 w-72 rounded-2xl" />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-12 rounded-full" />
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * 커뮤니티 페이지 로딩 스켈레톤
 */
export function CommunityPageLoading() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <SkeletonText className="w-32 h-6" />
        <Skeleton className="w-24 h-10 rounded-lg" />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="w-16 h-8 rounded-full" />
        ))}
      </div>

      {/* Post cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-gray-100 p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <SkeletonCircle className="w-10 h-10" />
            <div className="flex-1">
              <SkeletonText className="w-24 mb-1" />
              <SkeletonText className="w-16 h-3" />
            </div>
          </div>
          <SkeletonText className="w-full mb-2" />
          <SkeletonText className="w-4/5 mb-2" />
          <SkeletonText className="w-3/5" />
          <div className="flex gap-4 mt-4">
            <Skeleton className="w-16 h-6 rounded-full" />
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 리스트 로딩 스켈레톤
 */
export function ListLoading({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl">
          <SkeletonCircle className="w-10 h-10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonText className="w-3/4" />
            <SkeletonText className="w-1/2 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 전체 화면 로딩 스피너
 */
export function FullScreenLoading({ message = "로딩 중..." }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
      role="progressbar"
      aria-label={message}
      aria-busy="true"
    >
      <div className="text-center">
        <div className="mb-4 text-5xl animate-bounce">🐾</div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * 인라인 로딩 스피너
 */
export function InlineLoading({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`}
      role="progressbar"
      aria-label="로딩 중"
    />
  );
}

export default MainPageLoading;
