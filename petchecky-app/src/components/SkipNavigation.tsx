"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function SkipNavigation() {
  const { t } = useLanguage();

  return (
    <a
      href="#main-content"
      className="fixed left-0 top-0 z-[100] -translate-y-full bg-blue-600 px-4 py-2 text-white transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {t.accessibility.skipToMain}
    </a>
  );
}
