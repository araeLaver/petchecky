"use client";

import { RefObject } from "react";
import Link from "next/link";

interface ImageData {
  data: string;
  mimeType: string;
  preview: string;
}

interface ChatFormProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  limitExceeded: boolean;
  isPremiumPlus: boolean;
  selectedImage: ImageData | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (e: React.FormEvent) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onBack: () => void;
}

export default function ChatForm({
  input,
  setInput,
  isLoading,
  limitExceeded,
  isPremiumPlus,
  selectedImage,
  fileInputRef,
  onSubmit,
  onImageSelect,
  onRemoveImage,
  onBack,
}: ChatFormProps) {
  if (limitExceeded) {
    return <LimitExceededBanner onBack={onBack} />;
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
      {/* 선택된 이미지 미리보기 */}
      {selectedImage && (
        <ImagePreview
          preview={selectedImage.preview}
          onRemove={onRemoveImage}
        />
      )}

      <div className="flex gap-2">
        {/* 이미지 업로드 버튼 (프리미엄+ 전용) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => {
            if (!isPremiumPlus) {
              alert("이미지 분석은 프리미엄+ 구독자 전용 기능입니다.");
              return;
            }
            fileInputRef.current?.click();
          }}
          disabled={isLoading}
          className={`rounded-full p-3 transition-colors ${
            isPremiumPlus
              ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
              : "bg-gray-100 text-gray-400"
          }`}
          title={isPremiumPlus ? "이미지 첨부" : "프리미엄+ 전용 기능"}
          aria-label={isPremiumPlus ? "이미지 첨부하기" : "프리미엄+ 전용 기능"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 1000))}
          placeholder={selectedImage ? "사진에 대해 설명해주세요..." : "증상을 입력하세요..."}
          maxLength={1000}
          className="flex-1 rounded-full border border-gray-300 px-5 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-full bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          aria-label="메시지 전송"
        >
          전송
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-gray-400">
        * AI 상담은 참고용이며, 정확한 진단은 수의사와 상담하세요
        {isPremiumPlus && " | 📷 이미지 분석 가능"}
      </p>
    </form>
  );
}

interface ImagePreviewProps {
  preview: string;
  onRemove: () => void;
}

function ImagePreview({ preview, onRemove }: ImagePreviewProps) {
  return (
    <div className="mb-3 relative inline-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={preview}
        alt="선택된 이미지"
        className="h-20 w-20 object-cover rounded-lg border border-gray-300"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
        aria-label="선택한 이미지 제거"
      >
        ✕
      </button>
    </div>
  );
}

interface LimitExceededBannerProps {
  onBack: () => void;
}

function LimitExceededBanner({ onBack }: LimitExceededBannerProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-5 text-center">
        <p className="text-gray-800 font-bold text-lg mb-2">
          이번 달 무료 상담 횟수를 모두 사용했어요
        </p>
        <p className="text-sm text-gray-600 mb-4">
          프리미엄 구독으로 무제한 AI 상담을 이용해보세요!
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/subscription"
            className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            프리미엄 둘러보기
          </Link>
          <button
            onClick={onBack}
            className="rounded-full bg-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
            aria-label="홈 화면으로 돌아가기"
          >
            홈으로
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          다음 달 1일에 무료 횟수가 초기화됩니다
        </p>
      </div>
    </div>
  );
}
