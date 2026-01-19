// 앱 전역 상수 정의

// === 사용량 제한 ===
export const LIMITS = {
  MONTHLY_FREE_MESSAGES: 20,
  MESSAGE_MAX_LENGTH: 2000,
  PET_NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  MESSAGE_HISTORY_COUNT: 6,
  ANALYSIS_HISTORY_COUNT: 20,
  MAX_CHAT_RECORDS: 50,
} as const;

// === Rate Limiting ===
export const RATE_LIMITS = {
  // 채팅 API
  CHAT_PER_MINUTE: 10,
  CHAT_WINDOW_MS: 60 * 1000, // 1분

  // 커뮤니티 게시글
  POSTS_PER_MINUTE: 5,
  POSTS_WINDOW_MS: 60 * 1000, // 1분

  // 커뮤니티 댓글
  COMMENTS_PER_MINUTE: 10,
  COMMENTS_WINDOW_MS: 60 * 1000, // 1분

  // 좋아요
  LIKES_PER_MINUTE: 30,
  LIKES_WINDOW_MS: 60 * 1000, // 1분

  // GET 요청 (읽기)
  READS_PER_MINUTE: 60,
  READS_WINDOW_MS: 60 * 1000, // 1분
} as const;

// === 파일 업로드 ===
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const;

// === API 설정 ===
export const API_CONFIG = {
  GEMINI_MODEL: 'gemini-2.5-flash',
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
} as const;

// === 위험도 키워드 ===
export const SEVERITY_KEYWORDS = {
  high: {
    ko: ['응급', '즉시 병원', '당장', '위험', '심각', '출혈', '호흡곤란', '의식', '경련', '마비', '중독'],
    en: ['emergency', 'immediately', 'urgent', 'critical', 'severe', 'bleeding', 'breathing difficulty', 'unconscious', 'seizure', 'paralysis', 'poisoning'],
    ja: ['緊急', 'すぐに病院', '危険', '重大', '出血', '呼吸困難', '意識', 'けいれん', '麻痺', '中毒'],
  },
  medium: {
    ko: ['병원 방문', '검사', '주의', '관찰', '악화', '지속', '증상'],
    en: ['vet visit', 'examination', 'caution', 'observe', 'worsen', 'persistent', 'symptoms'],
    ja: ['病院', '検査', '注意', '観察', '悪化', '持続', '症状'],
  },
} as const;

// === 펫 종류 이모지 ===
export const PET_EMOJI = {
  dog: '🐕',
  cat: '🐈',
} as const;

// === 에러 메시지 (한국어) ===
export const ERROR_MESSAGES = {
  ko: {
    LOGIN_REQUIRED: '로그인이 필요합니다.',
    NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
    GENERAL_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    LIMIT_EXCEEDED: '이번 달 무료 상담 횟수를 모두 사용하셨어요.',
    PREMIUM_REQUIRED: '프리미엄 구독이 필요한 기능입니다.',
    PREMIUM_PLUS_REQUIRED: '프리미엄+ 구독자 전용 기능입니다.',
    INVALID_INPUT: '입력값이 올바르지 않습니다.',
    FILE_TOO_LARGE: '파일 크기가 너무 큽니다.',
    INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다.',
  },
  en: {
    LOGIN_REQUIRED: 'Login is required.',
    NETWORK_ERROR: 'Please check your network connection.',
    GENERAL_ERROR: 'A temporary error occurred. Please try again later.',
    LIMIT_EXCEEDED: 'You have used all your free consultations this month.',
    PREMIUM_REQUIRED: 'This feature requires a premium subscription.',
    PREMIUM_PLUS_REQUIRED: 'This feature is for Premium+ subscribers only.',
    INVALID_INPUT: 'Invalid input.',
    FILE_TOO_LARGE: 'File size is too large.',
    INVALID_FILE_TYPE: 'Unsupported file format.',
  },
  ja: {
    LOGIN_REQUIRED: 'ログインが必要です。',
    NETWORK_ERROR: 'ネットワーク接続を確認してください。',
    GENERAL_ERROR: '一時的なエラーが発生しました。しばらくしてから再試行してください。',
    LIMIT_EXCEEDED: '今月の無料相談回数を使い切りました。',
    PREMIUM_REQUIRED: 'この機能はプレミアム会員専用です。',
    PREMIUM_PLUS_REQUIRED: 'この機能はプレミアム+会員専用です。',
    INVALID_INPUT: '入力値が正しくありません。',
    FILE_TOO_LARGE: 'ファイルサイズが大きすぎます。',
    INVALID_FILE_TYPE: 'サポートされていないファイル形式です。',
  },
} as const;

// === 구독 플랜 ===
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PREMIUM: 'premium',
  PREMIUM_PLUS: 'premium_plus',
} as const;

// === 타입 export ===
export type Language = 'ko' | 'en' | 'ja';
export type PetSpecies = keyof typeof PET_EMOJI;
export type Severity = 'low' | 'medium' | 'high';
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];
