"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState - 데이터가 없을 때 표시하는 컴포넌트
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<span className="text-4xl">📝</span>}
 *   title="게시글이 없습니다"
 *   description="첫 번째 게시글을 작성해보세요!"
 *   action={<Button>글쓰기</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      {icon && (
        <div className="mb-4 text-gray-400" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * 채팅 기록 없음 상태
 */
export function NoChatHistory({ onStartChat }: { onStartChat?: () => void }) {
  return (
    <EmptyState
      icon={<span className="text-5xl">💬</span>}
      title="채팅 기록이 없습니다"
      description="반려동물의 건강에 대해 상담해보세요!"
      action={
        onStartChat && (
          <button
            onClick={onStartChat}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            상담 시작하기
          </button>
        )
      }
    />
  );
}

/**
 * 펫 없음 상태
 */
export function NoPets({ onAddPet }: { onAddPet?: () => void }) {
  return (
    <EmptyState
      icon={<span className="text-5xl">🐾</span>}
      title="등록된 반려동물이 없습니다"
      description="반려동물을 등록하고 건강 상담을 받아보세요!"
      action={
        onAddPet && (
          <button
            onClick={onAddPet}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            반려동물 등록하기
          </button>
        )
      }
    />
  );
}

/**
 * 게시글 없음 상태
 */
export function NoPosts({ onCreatePost }: { onCreatePost?: () => void }) {
  return (
    <EmptyState
      icon={<span className="text-5xl">📝</span>}
      title="게시글이 없습니다"
      description="첫 번째 게시글을 작성해보세요!"
      action={
        onCreatePost && (
          <button
            onClick={onCreatePost}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            글쓰기
          </button>
        )
      }
    />
  );
}

/**
 * 검색 결과 없음 상태
 */
export function NoSearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<span className="text-5xl">🔍</span>}
      title="검색 결과가 없습니다"
      description={
        query
          ? `"${query}"에 대한 검색 결과를 찾을 수 없습니다.`
          : "다른 검색어로 시도해보세요."
      }
    />
  );
}

export default EmptyState;
