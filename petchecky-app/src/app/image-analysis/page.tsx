"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnalysisResult {
  id: string;
  category: string;
  imagePreview: string;
  description: string;
  result: string;
  severity: "low" | "medium" | "high";
  date: string;
  petName?: string;
}

type AnalysisCategory = "skin" | "eye" | "ear" | "teeth" | "wound" | "other";

const ANALYSIS_CATEGORIES: { id: AnalysisCategory; icon: string; labelKo: string; labelEn: string; labelJa: string }[] = [
  { id: "skin", icon: "🐾", labelKo: "피부/털", labelEn: "Skin/Fur", labelJa: "皮膚/毛" },
  { id: "eye", icon: "👁️", labelKo: "눈", labelEn: "Eyes", labelJa: "目" },
  { id: "ear", icon: "👂", labelKo: "귀", labelEn: "Ears", labelJa: "耳" },
  { id: "teeth", icon: "🦷", labelKo: "치아/잇몸", labelEn: "Teeth/Gums", labelJa: "歯/歯茎" },
  { id: "wound", icon: "🩹", labelKo: "상처/부상", labelEn: "Wound/Injury", labelJa: "傷/怪我" },
  { id: "other", icon: "📷", labelKo: "기타", labelEn: "Other", labelJa: "その他" },
];

const STORAGE_KEY = "petchecky_image_analyses";

export default function ImageAnalysisPage() {
  const { getAccessToken } = useAuth();
  const { isPremiumPlus } = useSubscription();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<AnalysisCategory>("skin");
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [petName, setPetName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAnalysisHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load analysis history:", e);
      }
    }

    // Load pet name from localStorage
    const pets = localStorage.getItem("petchecky_pets");
    if (pets) {
      try {
        const parsed = JSON.parse(pets);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPetName(parsed[0].name);
        }
      } catch (e) {
        console.error("Failed to load pet name:", e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (history: AnalysisResult[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
    } catch (e) {
      console.error("Failed to save analysis history:", e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(language === "ko" ? "이미지 크기는 5MB 이하로 업로드해주세요." :
            language === "ja" ? "画像サイズは5MB以下でアップロードしてください。" :
            "Please upload an image under 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(language === "ko" ? "이미지 파일만 업로드할 수 있습니다." :
            language === "ja" ? "画像ファイルのみアップロードできます。" :
            "Only image files can be uploaded.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const base64Data = dataUrl.split(",")[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type,
        preview: dataUrl,
      });
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const categoryLabel = ANALYSIS_CATEGORIES.find(c => c.id === selectedCategory);
    const categoryName = language === "ko" ? categoryLabel?.labelKo :
                         language === "ja" ? categoryLabel?.labelJa :
                         categoryLabel?.labelEn;

    try {
      // 인증 토큰을 헤더에 포함하여 요청 (보안 강화)
      const token = await getAccessToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch("/api/image-analysis", {
        method: "POST",
        headers,
        body: JSON.stringify({
          image: {
            data: selectedImage.data,
            mimeType: selectedImage.mimeType,
          },
          category: selectedCategory,
          description,
          petName,
          language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newResult: AnalysisResult = {
          id: Date.now().toString(),
          category: categoryName || selectedCategory,
          imagePreview: selectedImage.preview,
          description,
          result: data.analysis,
          severity: data.severity,
          date: new Date().toISOString(),
          petName,
        };

        setAnalysisResult(newResult);

        // Save to history
        const updatedHistory = [newResult, ...analysisHistory].slice(0, 20);
        setAnalysisHistory(updatedHistory);
        saveHistory(updatedHistory);
      } else {
        alert(data.message || (language === "ko" ? "분석 중 오류가 발생했습니다." :
              language === "ja" ? "分析中にエラーが発生しました。" :
              "An error occurred during analysis."));
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert(language === "ko" ? "네트워크 오류가 발생했습니다." :
            language === "ja" ? "ネットワークエラーが発生しました。" :
            "A network error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityStyle = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "border-red-500 bg-red-50 dark:bg-red-900/20";
      case "medium":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "low":
        return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }
  };

  const getSeverityBadge = (severity: "low" | "medium" | "high") => {
    const labels = {
      high: { ko: "🚨 위험 - 병원 방문 권장", en: "🚨 Critical - Vet Visit Recommended", ja: "🚨 危険 - 病院受診推奨" },
      medium: { ko: "⚠️ 주의 - 경과 관찰 필요", en: "⚠️ Caution - Observation Needed", ja: "⚠️ 注意 - 経過観察必要" },
      low: { ko: "✅ 안심 - 일반적인 상태", en: "✅ Safe - Normal Condition", ja: "✅ 安心 - 一般的な状態" },
    };

    const colors = {
      high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    };

    return (
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colors[severity]}`}>
        {labels[severity][language as keyof typeof labels.high]}
      </span>
    );
  };

  const texts = {
    ko: {
      title: "AI 이미지 분석",
      subtitle: "반려동물 사진을 분석하여 건강 상태를 체크해드려요",
      premiumRequired: "프리미엄+ 전용 기능",
      premiumDesc: "이미지 분석은 프리미엄+ 구독자만 이용할 수 있습니다.",
      upgrade: "프리미엄+ 구독하기",
      selectCategory: "분석할 부위 선택",
      uploadImage: "사진 업로드",
      uploadDesc: "반려동물의 해당 부위 사진을 업로드하세요",
      changeImage: "사진 변경",
      description: "증상 설명 (선택)",
      descriptionPlaceholder: "예: 어제부터 빨갛게 부어올랐어요",
      analyze: "분석하기",
      analyzing: "분석 중...",
      result: "분석 결과",
      history: "분석 기록",
      noHistory: "분석 기록이 없습니다",
      back: "뒤로",
      disclaimer: "* AI 분석은 참고용이며, 정확한 진단은 수의사와 상담하세요",
      findHospital: "가까운 병원 찾기",
    },
    en: {
      title: "AI Image Analysis",
      subtitle: "Upload pet photos to check their health condition",
      premiumRequired: "Premium+ Feature",
      premiumDesc: "Image analysis is only available for Premium+ subscribers.",
      upgrade: "Subscribe to Premium+",
      selectCategory: "Select Area to Analyze",
      uploadImage: "Upload Photo",
      uploadDesc: "Upload a photo of the relevant area",
      changeImage: "Change Photo",
      description: "Symptom Description (Optional)",
      descriptionPlaceholder: "e.g., It has been red and swollen since yesterday",
      analyze: "Analyze",
      analyzing: "Analyzing...",
      result: "Analysis Result",
      history: "Analysis History",
      noHistory: "No analysis history",
      back: "Back",
      disclaimer: "* AI analysis is for reference only. Please consult a vet for accurate diagnosis.",
      findHospital: "Find Nearby Vet",
    },
    ja: {
      title: "AI画像分析",
      subtitle: "ペットの写真をアップロードして健康状態をチェック",
      premiumRequired: "プレミアム+専用機能",
      premiumDesc: "画像分析はプレミアム+会員のみご利用いただけます。",
      upgrade: "プレミアム+に登録",
      selectCategory: "分析する部位を選択",
      uploadImage: "写真をアップロード",
      uploadDesc: "該当部位の写真をアップロードしてください",
      changeImage: "写真を変更",
      description: "症状の説明（任意）",
      descriptionPlaceholder: "例：昨日から赤く腫れています",
      analyze: "分析する",
      analyzing: "分析中...",
      result: "分析結果",
      history: "分析履歴",
      noHistory: "分析履歴がありません",
      back: "戻る",
      disclaimer: "* AI分析は参考情報です。正確な診断は獣医師にご相談ください。",
      findHospital: "近くの病院を探す",
    },
  };

  const t = texts[language as keyof typeof texts] || texts.ko;

  // Premium+ check
  if (!isPremiumPlus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← {t.back}
          </Link>

          <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center">
            <div className="text-6xl mb-4">📷</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {t.premiumRequired}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t.premiumDesc}
            </p>
            <Link
              href="/subscription"
              className="inline-block rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
            >
              {t.upgrade}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← {t.back}
          </Link>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
          >
            {showHistory ? t.back : t.history}
          </button>
        </div>

        {showHistory ? (
          /* History View */
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {t.history}
            </h1>
            {analysisHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t.noHistory}
              </div>
            ) : (
              analysisHistory.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border-l-4 p-4 ${getSeverityStyle(item.severity)}`}
                >
                  <div className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imagePreview}
                      alt="Analysis"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {item.category}
                        </span>
                        {item.petName && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({item.petName})
                          </span>
                        )}
                      </div>
                      {getSeverityBadge(item.severity)}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {item.result}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Analysis View */
          <div className="space-y-6">
            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {t.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t.subtitle}
              </p>
            </div>

            {/* Category Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="font-semibold text-gray-800 dark:text-white mb-4">
                {t.selectCategory}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {ANALYSIS_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
                      selectedCategory === category.id
                        ? "bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500"
                        : "bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className={`text-sm font-medium ${
                      selectedCategory === category.id
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {language === "ko" ? category.labelKo :
                       language === "ja" ? category.labelJa :
                       category.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="font-semibold text-gray-800 dark:text-white mb-4">
                {t.uploadImage}
              </h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {selectedImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedImage.preview}
                      alt="Selected"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 text-purple-600 dark:text-purple-400 font-medium hover:underline"
                  >
                    {t.changeImage}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {t.uploadDesc}
                  </span>
                </button>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="font-semibold text-gray-800 dark:text-white mb-4">
                {t.description}
              </h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                className="w-full h-24 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 py-4 font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isAnalyzing ? t.analyzing : t.analyze}
            </button>

            {/* Analysis Result */}
            {analysisResult && (
              <div className={`rounded-2xl border-l-4 p-6 ${getSeverityStyle(analysisResult.severity)}`}>
                <h2 className="font-semibold text-gray-800 dark:text-white mb-3">
                  {t.result}
                </h2>
                <div className="mb-4">
                  {getSeverityBadge(analysisResult.severity)}
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {analysisResult.result}
                </p>
                {(analysisResult.severity === "medium" || analysisResult.severity === "high") && (
                  <Link
                    href="/"
                    className={`mt-4 block w-full rounded-lg py-3 text-center font-medium text-white ${
                      analysisResult.severity === "high"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    🏥 {t.findHospital}
                  </Link>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              {t.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
