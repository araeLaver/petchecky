"use client";

import { useState } from "react";
import Link from "next/link";
import { useChildStore } from "@/stores/childStore";
import { useAuth } from "@/contexts/AuthContext";

export default function ImageAnalysisPage() {
  const { children, selectedChildId } = useChildStore();
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const { getAccessToken } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image || isLoading) return;
    setIsLoading(true);
    setResult("");

    try {
      const token = await getAccessToken();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const birth = selectedChild ? new Date(selectedChild.birthDate) : null;
      const ageMonths = birth
        ? Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        : undefined;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: `아기의 증상 이미지를 분석해주세요. ${description ? `추가 설명: ${description}` : ""}`,
          mode: "baby",
          image,
          childProfile: selectedChild
            ? { name: selectedChild.name, ageMonths, gender: selectedChild.gender }
            : undefined,
        }),
      });

      const data = await response.json();
      setResult(data.message);
    } catch {
      setResult("분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedChild) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">아이를 먼저 등록해주세요</p>
          <Link href="/baby" className="mt-4 inline-block text-pink-500 hover:underline">← 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/baby" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-bold text-gray-800 dark:text-gray-100">📷 증상 이미지 분석</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-4 space-y-4">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <h3 className="mb-3 font-bold text-gray-900 dark:text-gray-100">증상 사진 업로드</h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            발진, 피부 증상, 상처 등의 사진을 업로드하면 AI가 분석해드립니다.
          </p>

          <div className="space-y-3">
            {image ? (
              <div className="relative">
                <img src={image} alt="업로드된 이미지" className="w-full rounded-lg object-cover" style={{ maxHeight: 300 }} />
                <button
                  onClick={() => setImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-pink-400 dark:border-gray-600">
                <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-500">사진을 선택하세요</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">증상 설명 (선택)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                rows={3}
                placeholder="언제부터 나타났는지, 어디에 있는지 등 추가 정보를 입력하세요..."
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!image || isLoading}
              className="w-full rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50"
            >
              {isLoading ? "분석 중..." : "AI 분석 시작"}
            </button>
          </div>
        </div>

        {result && (
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <h3 className="mb-2 font-bold text-gray-900 dark:text-gray-100">분석 결과</h3>
            <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{result}</div>
          </div>
        )}

        <div className="rounded-xl bg-yellow-50 p-3 text-center dark:bg-yellow-900/20">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            ※ AI 이미지 분석은 참고용이며, 정확한 진단은 소아과 전문의와 상담하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
