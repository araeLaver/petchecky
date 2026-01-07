"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language, TranslationKeys, languageNames, languageFlags } from "@/locales";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  languageName: string;
  languageFlag: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "petchecky_language";

// 브라우저 언어 감지
function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return "ko";

  const browserLang = navigator.language.toLowerCase();

  if (browserLang.startsWith("ko")) return "ko";
  if (browserLang.startsWith("ja")) return "ja";
  if (browserLang.startsWith("en")) return "en";

  return "ko"; // 기본값
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ko");
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 언어 설정 (localStorage 또는 브라우저 감지)
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language | null;

    if (savedLang && ["ko", "en", "ja"].includes(savedLang)) {
      setLanguageState(savedLang);
    } else {
      const detectedLang = detectBrowserLanguage();
      setLanguageState(detectedLang);
    }

    setIsInitialized(true);
  }, []);

  // 언어 변경 핸들러
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);

    // HTML lang 속성 업데이트
    document.documentElement.lang = lang;
  };

  // HTML lang 속성 초기 설정
  useEffect(() => {
    if (isInitialized) {
      document.documentElement.lang = language;
    }
  }, [language, isInitialized]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    languageName: languageNames[language],
    languageFlag: languageFlags[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// 편의를 위한 훅: 번역 객체만 반환
export function useTranslation() {
  const { t } = useLanguage();
  return t;
}
