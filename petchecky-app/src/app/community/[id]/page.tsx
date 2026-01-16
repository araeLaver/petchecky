"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CommunityPost, CommunityComment } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/dateUtils";

const CATEGORIES = [
  { id: "question", label: "질문", emoji: "?" },
  { id: "tip", label: "팁/정보", emoji: "!" },
  { id: "daily", label: "일상", emoji: "#" },
  { id: "review", label: "후기", emoji: "*" },
];

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, session } = useAuth();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 게시글 조회
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/community/posts/${id}`);
        if (!res.ok) {
          router.push("/community");
          return;
        }
        const data = await res.json();
        setPost(data.post);
        setLikesCount(data.post.likes_count);
      } catch (error) {
        console.error("Error fetching post:", error);
        router.push("/community");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [id, router]);

  // 댓글 조회
  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/community/posts/${id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }
    if (post) {
      fetchComments();
    }
  }, [id, post]);

  // 좋아요 상태 조회
  useEffect(() => {
    async function checkLikeStatus() {
      if (!session?.access_token) return;
      try {
        const res = await fetch(`/api/community/posts/${id}/like`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setIsLiked(data.liked);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    }
    if (post && user) {
      checkLikeStatus();
    }
  }, [id, post, user, session]);

  // 좋아요 토글
  const handleLike = async () => {
    if (!user || !session?.access_token) {
      alert("로그인이 필요합니다");
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    try {
      const res = await fetch(`/api/community/posts/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikesCount(data.likes_count);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !session?.access_token) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/community/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data.comment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!session?.access_token) return;
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/community/posts/${id}/comments?commentId=${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!session?.access_token) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/community/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        router.push("/community");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-3" />
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const categoryInfo = getCategoryInfo(post.category);
  const isAuthor = user?.id === post.user_id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <span>&lt;</span>
            <span>뒤로</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">게시글</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* 게시글 */}
        <article className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
          <div className="p-5">
            {/* 카테고리 & 펫 종류 */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  post.category === "question"
                    ? "bg-purple-100 text-purple-700"
                    : post.category === "tip"
                    ? "bg-green-100 text-green-700"
                    : post.category === "daily"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {categoryInfo.emoji} {categoryInfo.label}
              </span>
              {post.pet_species && (
                <span className="text-lg">
                  {post.pet_species === "dog" ? "🐕" : "🐈"}
                </span>
              )}
            </div>

            {/* 제목 */}
            <h1 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h1>

            {/* 작성자 정보 */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">{post.author_name}</span>
                <span>{formatRelativeTime(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>조회 {post.views_count}</span>
              </div>
            </div>

            {/* 본문 */}
            <div className="prose prose-gray max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isLiked
                    ? "bg-red-50 text-red-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{isLiked ? "❤️" : "🤍"}</span>
                <span className="font-medium">{likesCount}</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600">
                <span>💬</span>
                <span className="font-medium">{comments.length}</span>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/community/${id}/edit`}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  수정
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 text-sm text-red-500 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </article>

        {/* 댓글 섹션 */}
        <section className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            댓글 {comments.length}개
          </h2>

          {/* 댓글 작성 */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요"
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 resize-none focus:outline-none"
                />
                <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50">
                  <span className="text-xs text-gray-400">
                    {newComment.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? "등록 중..." : "등록"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <p className="text-blue-800">댓글을 작성하려면 로그인이 필요합니다</p>
              <Link
                href="/"
                className="inline-block mt-2 text-sm text-blue-600 hover:underline"
              >
                로그인하러 가기
              </Link>
            </div>
          )}

          {/* 댓글 목록 */}
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl bg-white border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {comment.author_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              게시글을 삭제하시겠습니까?
            </h3>
            <p className="text-gray-500 mb-6">
              삭제된 게시글은 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:bg-gray-300"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 패딩 */}
      <div className="h-20" />
    </div>
  );
}
