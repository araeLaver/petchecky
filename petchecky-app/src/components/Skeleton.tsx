"use client";

import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * 기본 스켈레톤 컴포넌트
 * 로딩 상태를 시각적으로 표시합니다.
 */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
      {...props}
    />
  );
}

/**
 * 텍스트 스켈레톤 - 한 줄 텍스트용
 */
export function SkeletonText({ className = "", ...props }: SkeletonProps) {
  return <Skeleton className={`h-4 ${className}`} {...props} />;
}

/**
 * 원형 스켈레톤 - 아바타, 아이콘용
 */
export function SkeletonCircle({ className = "", ...props }: SkeletonProps) {
  return <Skeleton className={`rounded-full ${className}`} {...props} />;
}

/**
 * 카드 스켈레톤 - 카드 형태의 컨텐츠용
 */
export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`rounded-2xl bg-white border border-gray-100 p-5 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <div className="flex items-start gap-3">
        <SkeletonCircle className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-3/4" />
          <SkeletonText className="w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonText className="w-full" />
        <SkeletonText className="w-5/6" />
      </div>
    </div>
  );
}

/**
 * 펫 카드 스켈레톤
 */
export function SkeletonPetCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`rounded-xl bg-white border border-gray-100 p-4 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-3">
        <SkeletonCircle className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-24" />
          <SkeletonText className="w-16 h-3" />
        </div>
      </div>
    </div>
  );
}

/**
 * 채팅 메시지 스켈레톤
 */
export function SkeletonChatMessage({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && <SkeletonCircle className="w-8 h-8 flex-shrink-0" />}
      <div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : ""}`}>
        <Skeleton className={`h-10 ${isUser ? "w-32" : "w-48"} rounded-2xl`} />
        {!isUser && <Skeleton className="h-16 w-64 rounded-2xl" />}
      </div>
    </div>
  );
}

/**
 * 리스트 아이템 스켈레톤
 */
export function SkeletonListItem({ className = "" }: SkeletonProps) {
  return (
    <div className={`flex items-center gap-4 p-4 ${className}`}>
      <SkeletonCircle className="w-10 h-10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/2 h-3" />
      </div>
      <Skeleton className="w-16 h-8 rounded-lg" />
    </div>
  );
}

/**
 * 게시글 카드 스켈레톤
 */
export function SkeletonPostCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`rounded-2xl bg-white border border-gray-100 p-5 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonCircle className="w-10 h-10" />
        <div className="flex-1 space-y-1">
          <SkeletonText className="w-24" />
          <SkeletonText className="w-16 h-3" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <SkeletonText className="w-full" />
        <SkeletonText className="w-4/5" />
        <SkeletonText className="w-3/5" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="w-16 h-8 rounded-full" />
        <Skeleton className="w-16 h-8 rounded-full" />
      </div>
    </div>
  );
}

/**
 * 통계 카드 스켈레톤
 */
export function SkeletonStatCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`rounded-xl bg-white border border-gray-100 p-4 dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      <SkeletonText className="w-20 h-3 mb-2" />
      <Skeleton className="w-16 h-8" />
    </div>
  );
}

/**
 * 페이지 헤더 스켈레톤
 */
export function SkeletonPageHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
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
  );
}

export default Skeleton;
