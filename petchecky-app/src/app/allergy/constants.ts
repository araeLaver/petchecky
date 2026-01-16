import { AllergyType } from "./types";

export const ALLERGY_TYPES: { value: AllergyType; label: string; icon: string; color: string }[] = [
  { value: "food", label: "식품 알레르기", icon: "🍖", color: "orange" },
  { value: "environmental", label: "환경 알레르기", icon: "🌿", color: "green" },
  { value: "medication", label: "약물 알레르기", icon: "💊", color: "purple" },
  { value: "contact", label: "접촉 알레르기", icon: "🧴", color: "blue" },
];

export const COMMON_ALLERGENS = {
  dog: {
    food: ["소고기", "닭고기", "돼지고기", "유제품", "밀", "옥수수", "콩", "계란", "생선"],
    environmental: ["집먼지진드기", "꽃가루", "곰팡이", "풀", "벼룩"],
    medication: ["항생제", "백신", "NSAID", "마취제"],
    contact: ["샴푸", "청소 세제", "라텍스", "플라스틱"],
  },
  cat: {
    food: ["소고기", "생선", "닭고기", "유제품", "밀", "옥수수", "콩"],
    environmental: ["집먼지진드기", "꽃가루", "곰팡이", "담배연기", "벼룩"],
    medication: ["항생제", "백신", "기생충약"],
    contact: ["화학 세제", "향수", "모래", "플라스틱"],
  },
};

export const COMMON_SYMPTOMS = [
  "가려움증", "피부 발진", "귀 감염", "구토", "설사", "재채기",
  "눈물", "발 핥기", "탈모", "두드러기", "얼굴 부기", "호흡곤란"
];

export const DANGEROUS_FOODS = {
  dog: [
    { name: "초콜릿", danger: "high" as const, effect: "테오브로민 중독" },
    { name: "포도/건포도", danger: "high" as const, effect: "급성 신부전" },
    { name: "양파/마늘", danger: "high" as const, effect: "적혈구 손상" },
    { name: "자일리톨", danger: "high" as const, effect: "저혈당, 간부전" },
    { name: "아보카도", danger: "medium" as const, effect: "구토, 설사" },
    { name: "카페인", danger: "high" as const, effect: "심장/신경계 이상" },
    { name: "알코올", danger: "high" as const, effect: "중추신경 억제" },
    { name: "마카다미아", danger: "medium" as const, effect: "무기력, 구토" },
  ],
  cat: [
    { name: "초콜릿", danger: "high" as const, effect: "테오브로민 중독" },
    { name: "양파/마늘", danger: "high" as const, effect: "적혈구 손상" },
    { name: "알코올", danger: "high" as const, effect: "중추신경 억제" },
    { name: "카페인", danger: "high" as const, effect: "심장/신경계 이상" },
    { name: "포도/건포도", danger: "high" as const, effect: "신부전 가능" },
    { name: "날생선", danger: "medium" as const, effect: "티아민 결핍" },
    { name: "우유", danger: "low" as const, effect: "유당불내증" },
    { name: "날계란", danger: "medium" as const, effect: "살모넬라" },
  ],
};

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "severe": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "moderate": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    default: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }
};

export const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case "severe": return "심각";
    case "moderate": return "중등도";
    default: return "경미";
  }
};
