import { ko, TranslationKeys } from "./ko";
import { en } from "./en";
import { ja } from "./ja";

export type Language = "ko" | "en" | "ja";

export const translations: Record<Language, TranslationKeys> = {
  ko,
  en,
  ja,
};

export const languageNames: Record<Language, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

export const languageFlags: Record<Language, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  ja: "🇯🇵",
};

export type { TranslationKeys };
