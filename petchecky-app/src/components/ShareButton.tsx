"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export default function ShareButton({ title, text, url, className = "" }: ShareButtonProps) {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setShowMenu(true);
        }
      }
    } else {
      setShowMenu(true);
    }
  };

  const shareToKakao = () => {
    if (typeof window !== "undefined" && (window as unknown as { Kakao?: { Share?: { sendDefault: (options: unknown) => void } } }).Kakao?.Share) {
      (window as unknown as { Kakao: { Share: { sendDefault: (options: unknown) => void } } }).Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description: text,
          imageUrl: `${shareUrl}/og-image.png`,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: t.share.viewMore,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    } else {
      window.open(`https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`, "_blank");
    }
    setShowMenu(false);
  };

  const shareToTwitter = () => {
    const tweetText = encodeURIComponent(`${title}\n${text}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`, "_blank");
    setShowMenu(false);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    setShowMenu(false);
  };

  const shareToLine = () => {
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`, "_blank");
    setShowMenu(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className={`flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors ${className}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {t.share.button}
      </button>

      {/* Share Menu Modal */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 z-50 w-48 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="p-2 space-y-1">
              <button
                onClick={shareToKakao}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="text-xl">💬</span>
                <span>KakaoTalk</span>
              </button>
              <button
                onClick={shareToTwitter}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="text-xl">𝕏</span>
                <span>X (Twitter)</span>
              </button>
              <button
                onClick={shareToFacebook}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="text-xl">📘</span>
                <span>Facebook</span>
              </button>
              <button
                onClick={shareToLine}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="text-xl">💚</span>
                <span>LINE</span>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              <button
                onClick={copyToClipboard}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span className="text-xl">{copied ? "✅" : "🔗"}</span>
                <span>{copied ? t.share.copied : t.share.copyLink}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
