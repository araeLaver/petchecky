"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Post {
  id: string;
  title: string;
  content: string;
  category: "question" | "tip" | "daily" | "review";
  author_name: string;
  author_id: string;
  pet_species?: "dog" | "cat";
  created_at: string;
  likes: number;
  comments_count: number;
}

const CATEGORIES = [
  { id: "all", label: "전체", emoji: "📋" },
  { id: "question", label: "질문", emoji: "❓" },
  { id: "tip", label: "팁/정보", emoji: "💡" },
  { id: "daily", label: "일상", emoji: "📸" },
  { id: "review", label: "후기", emoji: "⭐" },
];

// 샘플 데이터
const SAMPLE_POSTS: Post[] = [
  {
    id: "1",
    title: "강아지 구토할 때 응급처치 방법 공유해요",
    content: "저희 강아지가 자주 구토를 해서 수의사 선생님께 여쭤봤던 내용 공유합니다...",
    category: "tip",
    author_name: "멍멍이맘",
    author_id: "user1",
    pet_species: "dog",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 24,
    comments_count: 8,
  },
  {
    id: "2",
    title: "고양이가 밥을 안 먹어요 ㅠㅠ",
    content: "3일째 밥을 안 먹는데 병원 가봐야 할까요?",
    category: "question",
    author_name: "냥이집사",
    author_id: "user2",
    pet_species: "cat",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 5,
    comments_count: 12,
  },
  {
    id: "3",
    title: "오늘 산책 다녀왔어요 🐕",
    content: "날씨가 좋아서 공원 다녀왔습니다~",
    category: "daily",
    author_name: "산책러버",
    author_id: "user3",
    pet_species: "dog",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 45,
    comments_count: 3,
  },
  {
    id: "4",
    title: "펫체키 AI 상담 후기입니다",
    content: "처음에는 반신반의했는데 생각보다 정확하게 증상을 분석해줘서 놀랐어요!",
    category: "review",
    author_name: "리뷰어",
    author_id: "user4",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 18,
    comments_count: 6,
  },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);

  const filteredPosts = selectedCategory === "all"
    ? posts
    : posts.filter((post) => post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold text-gray-800">펫체키</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">커뮤니티</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              <span>{category.emoji}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* 글쓰기 버튼 */}
        {user && (
          <button
            onClick={() => setShowWriteModal(true)}
            className="w-full mb-4 rounded-xl bg-white border-2 border-dashed border-gray-300 p-4 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            + 새 글 작성하기
          </button>
        )}

        {/* 게시글 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-3" />
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <span className="text-5xl">📝</span>
            <p className="mt-4 text-gray-500">아직 게시글이 없습니다</p>
            {user && (
              <button
                onClick={() => setShowWriteModal(true)}
                className="mt-4 rounded-full bg-blue-500 px-6 py-2 text-sm font-medium text-white"
              >
                첫 글 작성하기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const categoryInfo = getCategoryInfo(post.category);
              return (
                <article
                  key={post.id}
                  className="rounded-2xl bg-white border border-gray-100 p-4 hover:border-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* 카테고리 & 펫 종류 */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          post.category === "question" ? "bg-purple-100 text-purple-700" :
                          post.category === "tip" ? "bg-green-100 text-green-700" :
                          post.category === "daily" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {categoryInfo.emoji} {categoryInfo.label}
                        </span>
                        {post.pet_species && (
                          <span className="text-sm">
                            {post.pet_species === "dog" ? "🐕" : "🐈"}
                          </span>
                        )}
                      </div>

                      {/* 제목 */}
                      <h2 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                        {post.title}
                      </h2>

                      {/* 내용 미리보기 */}
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {post.content}
                      </p>

                      {/* 메타 정보 */}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{post.author_name}</span>
                        <span>{formatDate(post.created_at)}</span>
                        <span className="flex items-center gap-1">
                          ❤️ {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          💬 {post.comments_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 비로그인 안내 */}
        {!user && (
          <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-200 p-5 text-center">
            <p className="text-blue-800 font-medium mb-2">
              커뮤니티에 참여하려면 로그인이 필요합니다
            </p>
            <Link
              href="/"
              className="inline-block rounded-full bg-blue-500 px-6 py-2 text-sm font-medium text-white"
            >
              로그인하러 가기
            </Link>
          </div>
        )}
      </main>

      {/* 글쓰기 모달 */}
      {showWriteModal && (
        <WritePostModal
          onClose={() => setShowWriteModal(false)}
          onSuccess={(newPost) => {
            setPosts([newPost, ...posts]);
            setShowWriteModal(false);
          }}
        />
      )}

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="mx-auto max-w-3xl flex justify-around">
          <Link href="/" className="flex flex-col items-center py-2 text-gray-500 hover:text-blue-500">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">홈</span>
          </Link>
          <Link href="/community" className="flex flex-col items-center py-2 text-blue-500">
            <span className="text-xl">💬</span>
            <span className="text-xs mt-1">커뮤니티</span>
          </Link>
          <Link href="/vet-consultation" className="flex flex-col items-center py-2 text-gray-500 hover:text-blue-500">
            <span className="text-xl">👨‍⚕️</span>
            <span className="text-xs mt-1">수의사 상담</span>
          </Link>
        </div>
      </nav>

      {/* 하단 패딩 */}
      <div className="h-20" />
    </div>
  );
}

// 글쓰기 모달 컴포넌트
function WritePostModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (post: Post) => void;
}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "question" as Post["category"],
    pet_species: "" as "" | "dog" | "cat",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setIsSubmitting(true);

    // 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newPost: Post = {
      id: Date.now().toString(),
      title: form.title,
      content: form.content,
      category: form.category,
      author_name: user?.email?.split("@")[0] || "익명",
      author_id: user?.id || "",
      pet_species: form.pet_species || undefined,
      created_at: new Date().toISOString(),
      likes: 0,
      comments_count: 0,
    };

    onSuccess(newPost);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">새 글 작성</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.slice(1).map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, category: category.id as Post["category"] }))}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    form.category === category.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category.emoji} {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* 펫 종류 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              반려동물 (선택)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, pet_species: prev.pet_species === "dog" ? "" : "dog" }))}
                className={`flex-1 rounded-lg border-2 py-3 font-medium transition-all ${
                  form.pet_species === "dog"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                🐕 강아지
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, pet_species: prev.pet_species === "cat" ? "" : "cat" }))}
                className={`flex-1 rounded-lg border-2 py-3 font-medium transition-all ${
                  form.pet_species === "cat"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                🐈 고양이
              </button>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="제목을 입력하세요"
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="내용을 입력하세요"
              rows={6}
              maxLength={2000}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none resize-none"
              required
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {form.content.length}/2000
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !form.title.trim() || !form.content.trim()}
              className="flex-1 rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
