import { ko, TranslationKeys } from "./ko";
import { en } from "./en";
import { ja } from "./ja";
import { zh } from "./zh";

export type Language = "ko" | "en" | "ja" | "zh";

export const translations: Record<Language, TranslationKeys> = {
  ko,
  en,
  ja,
  zh,
};

export const languageNames: Record<Language, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
};

export const languageFlags: Record<Language, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  ja: "🇯🇵",
  zh: "🇨🇳",
};

// RTL 언어 지원
export const rtlLanguages: Language[] = [];

export const isRtlLanguage = (lang: Language): boolean => {
  return rtlLanguages.includes(lang);
};

// 언어 메타데이터
export interface LanguageMetadata {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  direction: "ltr" | "rtl";
}

export const languageMetadata: Record<Language, LanguageMetadata> = {
  ko: {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    direction: "ltr",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    direction: "ltr",
  },
  ja: {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    direction: "ltr",
  },
  zh: {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    direction: "ltr",
  },
};

export type { TranslationKeys };
