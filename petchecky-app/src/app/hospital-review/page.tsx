"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export interface HospitalReview {
  id: string;
  hospitalName: string;
  hospitalAddress?: string;
  rating: number; // 1-5
  visitDate: string;
  petType: "dog" | "cat" | "other";
  treatmentType: string;
  pros: string;
  cons?: string;
  content: string;
  cost?: number;
  wouldRecommend: boolean;
  createdAt: string;
}

const TREATMENT_TYPES = [
  { value: "checkup", label: "정기 검진" },
  { value: "vaccination", label: "예방접종" },
  { value: "dental", label: "치과 진료" },
  { value: "surgery", label: "수술" },
  { value: "emergency", label: "응급 진료" },
  { value: "skin", label: "피부과" },
  { value: "internal", label: "내과" },
  { value: "orthopedic", label: "정형외과" },
  { value: "other", label: "기타" },
];

export default function HospitalReviewPage() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<HospitalReview[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<HospitalReview | null>(null);
  const [filter, setFilter] = useState<"all" | "high" | "recent">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load reviews
  useEffect(() => {
    const saved = localStorage.getItem("petchecky_hospital_reviews");
    if (saved) {
      setReviews(JSON.parse(saved));
    }
  }, []);

  // Save reviews
  const saveReviews = (newReviews: HospitalReview[]) => {
    localStorage.setItem("petchecky_hospital_reviews", JSON.stringify(newReviews));
    setReviews(newReviews);
  };

  // Add/Update review
  const handleSaveReview = (review: Omit<HospitalReview, "id" | "createdAt">) => {
    if (editingReview) {
      const updated = reviews.map((r) =>
        r.id === editingReview.id
          ? { ...review, id: r.id, createdAt: r.createdAt }
          : r
      );
      saveReviews(updated);
    } else {
      const newReview: HospitalReview = {
        ...review,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      saveReviews([...reviews, newReview]);
    }
    setShowModal(false);
    setEditingReview(null);
  };

  // Delete review
  const handleDeleteReview = (id: string) => {
    if (confirm("이 리뷰를 삭제하시겠습니까?")) {
      saveReviews(reviews.filter((r) => r.id !== id));
    }
  };

  // Filter and search reviews
  const filteredReviews = reviews
    .filter((review) => {
      if (searchQuery) {
        return (
          review.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (filter === "high") {
        return b.rating - a.rating;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Calculate average rating for a hospital
  const getHospitalStats = (hospitalName: string) => {
    const hospitalReviews = reviews.filter((r) => r.hospitalName === hospitalName);
    const avgRating =
      hospitalReviews.reduce((sum, r) => sum + r.rating, 0) / hospitalReviews.length;
    const recommendRate =
      (hospitalReviews.filter((r) => r.wouldRecommend).length / hospitalReviews.length) *
      100;
    return { avgRating, recommendRate, count: hospitalReviews.length };
  };

  // Get unique hospitals
  const uniqueHospitals = [...new Set(reviews.map((r) => r.hospitalName))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">🏥 병원 리뷰</h1>
          </div>
          <button
            onClick={() => {
              setEditingReview(null);
              setShowModal(true);
            }}
            className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            + 리뷰 작성
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="병원 이름으로 검색..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Filter */}
        <div className="mb-4 flex gap-2">
          {(["all", "recent", "high"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              {f === "all" ? "전체" : f === "recent" ? "최신순" : "평점순"}
            </button>
          ))}
        </div>

        {/* Hospital Stats Summary */}
        {uniqueHospitals.length > 0 && !searchQuery && (
          <div className="mb-6 rounded-xl bg-white border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 mb-3 dark:text-gray-400">
              내가 방문한 병원
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {uniqueHospitals.slice(0, 5).map((hospital) => {
                const stats = getHospitalStats(hospital);
                return (
                  <button
                    key={hospital}
                    onClick={() => setSearchQuery(hospital)}
                    className="flex-shrink-0 rounded-lg bg-gray-50 p-3 min-w-[140px] text-left hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    <p className="font-medium text-gray-800 text-sm truncate dark:text-gray-100">
                      {hospital}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {stats.avgRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">({stats.count})</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl bg-white border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">
                    {review.hospitalName}
                  </h3>
                  {review.hospitalAddress && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {review.hospitalAddress}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= review.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {TREATMENT_TYPES.find((t) => t.value === review.treatmentType)?.label}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {review.petType === "dog" ? "🐕 강아지" : review.petType === "cat" ? "🐈 고양이" : "🐾 기타"}
                </span>
                {review.cost && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    💰 {review.cost.toLocaleString()}원
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-3 dark:text-gray-300">{review.content}</p>

              {(review.pros || review.cons) && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {review.pros && (
                    <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                      <p className="text-xs text-green-700 font-medium mb-1 dark:text-green-400">👍 장점</p>
                      <p className="text-xs text-green-600 dark:text-green-300">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                      <p className="text-xs text-red-700 font-medium mb-1 dark:text-red-400">👎 단점</p>
                      <p className="text-xs text-red-600 dark:text-red-300">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      review.wouldRecommend
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {review.wouldRecommend ? "👍 추천해요" : "보통이에요"}
                  </span>
                  <span className="text-gray-400 text-xs">{review.visitDate}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingReview(review);
                      setShowModal(true);
                    }}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="rounded-xl bg-white border border-gray-200 p-8 text-center dark:bg-gray-800 dark:border-gray-700">
            <div className="text-4xl mb-3">🏥</div>
            <p className="text-gray-500 mb-4 dark:text-gray-400">
              {searchQuery ? "검색 결과가 없습니다" : "아직 병원 리뷰가 없습니다"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="rounded-full bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                첫 리뷰 작성하기
              </button>
            )}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showModal && (
        <ReviewModal
          review={editingReview}
          onSave={handleSaveReview}
          onClose={() => {
            setShowModal(false);
            setEditingReview(null);
          }}
        />
      )}
    </div>
  );
}

// Review Modal Component
function ReviewModal({
  review,
  onSave,
  onClose,
}: {
  review: HospitalReview | null;
  onSave: (review: Omit<HospitalReview, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [hospitalName, setHospitalName] = useState(review?.hospitalName || "");
  const [hospitalAddress, setHospitalAddress] = useState(review?.hospitalAddress || "");
  const [rating, setRating] = useState(review?.rating || 5);
  const [visitDate, setVisitDate] = useState(
    review?.visitDate || new Date().toISOString().split("T")[0]
  );
  const [petType, setPetType] = useState<"dog" | "cat" | "other">(review?.petType || "dog");
  const [treatmentType, setTreatmentType] = useState(review?.treatmentType || "checkup");
  const [pros, setPros] = useState(review?.pros || "");
  const [cons, setCons] = useState(review?.cons || "");
  const [content, setContent] = useState(review?.content || "");
  const [cost, setCost] = useState(review?.cost?.toString() || "");
  const [wouldRecommend, setWouldRecommend] = useState(review?.wouldRecommend ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalName.trim() || !content.trim()) return;

    onSave({
      hospitalName: hospitalName.trim(),
      hospitalAddress: hospitalAddress.trim() || undefined,
      rating,
      visitDate,
      petType,
      treatmentType,
      pros: pros.trim(),
      cons: cons.trim() || undefined,
      content: content.trim(),
      cost: cost ? parseInt(cost) : undefined,
      wouldRecommend,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {review ? "리뷰 수정" : "병원 리뷰 작성"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Hospital Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              병원 이름 *
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="예: 행복동물병원"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          {/* Hospital Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              병원 주소
            </label>
            <input
              type="text"
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
              placeholder="예: 서울시 강남구"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              평점 *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors ${
                    star <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Visit Date & Pet Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                방문일
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                반려동물
              </label>
              <select
                value={petType}
                onChange={(e) => setPetType(e.target.value as "dog" | "cat" | "other")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="dog">🐕 강아지</option>
                <option value="cat">🐈 고양이</option>
                <option value="other">🐾 기타</option>
              </select>
            </div>
          </div>

          {/* Treatment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              진료 유형
            </label>
            <select
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {TREATMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              진료비 (원)
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="예: 50000"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                👍 장점
              </label>
              <input
                type="text"
                value={pros}
                onChange={(e) => setPros(e.target.value)}
                placeholder="예: 친절한 상담"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                👎 단점
              </label>
              <input
                type="text"
                value={cons}
                onChange={(e) => setCons(e.target.value)}
                placeholder="예: 대기 시간"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              상세 후기 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="병원 방문 경험을 자세히 공유해주세요"
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none resize-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          {/* Would Recommend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              이 병원을 추천하시겠어요?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={`flex-1 rounded-lg border-2 p-3 transition-colors ${
                  wouldRecommend
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600"
                }`}
              >
                <span className="text-2xl">👍</span>
                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">추천해요</p>
              </button>
              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={`flex-1 rounded-lg border-2 p-3 transition-colors ${
                  !wouldRecommend
                    ? "border-gray-500 bg-gray-50 dark:bg-gray-700"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600"
                }`}
              >
                <span className="text-2xl">😐</span>
                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">보통이에요</p>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!hospitalName.trim() || !content.trim()}
              className="flex-1 rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {review ? "수정하기" : "저장하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
