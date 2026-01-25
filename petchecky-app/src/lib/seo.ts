/**
 * SEO Configuration
 *
 * 검색엔진 최적화를 위한 메타데이터 설정
 */

import type { Metadata } from "next";

// ============================================
// 사이트 기본 정보
// ============================================

export const SITE_CONFIG = {
  name: "펫체키",
  nameEn: "PetChecky",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://petchecky.com",
  description: "반려동물이 아파 보일 때, AI가 증상을 분석하고 적절한 대응 방법을 알려드립니다. 강아지, 고양이 건강 상담 서비스.",
  descriptionEn: "When your pet seems sick, AI analyzes symptoms and provides appropriate responses. Dog and cat health consultation service.",
  locale: "ko_KR",
  localeAlternate: ["en_US", "ja_JP", "zh_CN"],
  themeColor: "#3B82F6",
  twitterHandle: "@petchecky",
  author: {
    name: "PetChecky",
    url: "https://petchecky.com",
  },
} as const;

// ============================================
// 기본 키워드
// ============================================

export const DEFAULT_KEYWORDS = [
  "펫체키",
  "PetChecky",
  "반려동물",
  "AI",
  "건강",
  "증상",
  "상담",
  "강아지",
  "고양이",
  "수의사",
  "펫케어",
  "동물병원",
  "반려견",
  "반려묘",
];

// ============================================
// 페이지별 SEO 설정
// ============================================

export interface PageSeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  noIndex?: boolean;
  canonical?: string;
}

export const PAGE_SEO: Record<string, PageSeoConfig> = {
  home: {
    title: "AI가 체크하는 우리 아이 건강",
    description: "반려동물이 아파 보일 때, AI가 증상을 분석하고 적절한 대응 방법을 알려드립니다. 24시간 무료 상담 가능.",
    keywords: ["AI 펫 건강", "반려동물 증상 체크", "강아지 건강", "고양이 건강"],
  },
  community: {
    title: "커뮤니티",
    description: "반려동물 보호자들의 경험과 팁을 공유하세요. 질문, 정보 공유, 고민 상담까지 펫체키 커뮤니티에서.",
    keywords: ["반려동물 커뮤니티", "펫 커뮤니티", "강아지 커뮤니티", "고양이 커뮤니티"],
  },
  emergency: {
    title: "응급 상황 가이드",
    description: "반려동물 응급 상황 시 대처 방법을 안내합니다. 24시간 동물병원 찾기, 응급 처치 가이드 제공.",
    keywords: ["반려동물 응급", "동물 응급처치", "24시간 동물병원", "펫 응급"],
  },
  imageAnalysis: {
    title: "AI 이미지 분석",
    description: "반려동물의 피부, 눈, 귀 등의 사진을 AI가 분석하여 건강 상태를 확인해드립니다.",
    keywords: ["AI 이미지 분석", "반려동물 피부", "펫 건강 체크", "AI 진단"],
  },
  healthTracking: {
    title: "건강 기록",
    description: "반려동물의 체중, 식사, 운동 등 건강 정보를 기록하고 관리하세요.",
    keywords: ["반려동물 건강 기록", "펫 다이어리", "강아지 체중 관리", "고양이 건강 관리"],
  },
  healthInsights: {
    title: "건강 분석",
    description: "AI가 반려동물의 건강 데이터를 분석하여 맞춤형 인사이트를 제공합니다.",
    keywords: ["펫 건강 분석", "AI 건강 인사이트", "반려동물 데이터 분석"],
  },
  vaccination: {
    title: "예방접종 관리",
    description: "반려동물 예방접종 일정을 관리하고 알림을 받으세요. 강아지, 고양이 필수 백신 정보 제공.",
    keywords: ["반려동물 예방접종", "강아지 백신", "고양이 백신", "펫 예방접종"],
  },
  medication: {
    title: "약물 관리",
    description: "반려동물의 약물 복용 일정을 관리하고 알림을 받으세요.",
    keywords: ["반려동물 약물", "펫 약 관리", "강아지 약", "고양이 약"],
  },
  vetRecords: {
    title: "진료 기록",
    description: "반려동물의 병원 방문 기록, 진료 내역, 검사 결과를 한곳에서 관리하세요.",
    keywords: ["반려동물 진료 기록", "동물병원 기록", "펫 의료 기록"],
  },
  vetConsultation: {
    title: "수의사 상담",
    description: "전문 수의사와 온라인으로 상담하세요. 채팅 및 화상 상담 지원.",
    keywords: ["온라인 수의사 상담", "펫 상담", "반려동물 원격 진료"],
  },
  hospitalReview: {
    title: "동물병원 리뷰",
    description: "주변 동물병원 정보와 리뷰를 확인하세요. 가격, 서비스, 위치 정보 제공.",
    keywords: ["동물병원 리뷰", "동물병원 추천", "주변 동물병원", "동물병원 가격"],
  },
  allergy: {
    title: "알레르기 관리",
    description: "반려동물의 알레르기 정보를 기록하고 관리하세요. 음식, 환경 알레르기 추적.",
    keywords: ["반려동물 알레르기", "강아지 알레르기", "고양이 알레르기", "펫 알레르기"],
  },
  diet: {
    title: "식단 관리",
    description: "반려동물의 식단을 기록하고 AI 맞춤 추천을 받으세요.",
    keywords: ["반려동물 식단", "강아지 사료", "고양이 사료", "펫 영양"],
  },
  walk: {
    title: "산책 기록",
    description: "반려동물과의 산책을 기록하고 운동량을 관리하세요. GPS 경로 추적 지원.",
    keywords: ["강아지 산책", "반려동물 운동", "산책 기록", "펫 운동량"],
  },
  training: {
    title: "훈련 가이드",
    description: "반려동물 훈련 방법과 팁을 제공합니다. 기본 훈련부터 문제 행동 교정까지.",
    keywords: ["강아지 훈련", "펫 트레이닝", "반려동물 교육", "행동 교정"],
  },
  calendar: {
    title: "일정 관리",
    description: "반려동물 관련 일정을 캘린더로 관리하세요. 병원 예약, 미용, 예방접종 알림.",
    keywords: ["펫 캘린더", "반려동물 일정", "동물병원 예약"],
  },
  expense: {
    title: "지출 관리",
    description: "반려동물 양육 비용을 기록하고 분석하세요. 카테고리별 지출 통계 제공.",
    keywords: ["반려동물 비용", "펫 지출", "양육 비용", "동물병원 비용"],
  },
  gallery: {
    title: "갤러리",
    description: "반려동물의 사진과 추억을 저장하고 관리하세요.",
    keywords: ["반려동물 사진", "펫 갤러리", "강아지 사진", "고양이 사진"],
  },
  insurance: {
    title: "펫 보험",
    description: "반려동물 보험 상품을 비교하고 적합한 보험을 찾으세요.",
    keywords: ["펫 보험", "반려동물 보험", "강아지 보험", "고양이 보험"],
  },
  petSitter: {
    title: "펫시터 찾기",
    description: "믿을 수 있는 펫시터를 찾아보세요. 리뷰와 평점 확인 가능.",
    keywords: ["펫시터", "반려동물 돌봄", "펫 케어", "강아지 돌봄"],
  },
  qrPetId: {
    title: "QR 펫 ID",
    description: "반려동물 정보가 담긴 QR 코드를 생성하세요. 분실 시 빠른 연락 가능.",
    keywords: ["펫 QR 코드", "반려동물 ID", "펫 신분증", "미아 방지"],
  },
  subscription: {
    title: "프리미엄 구독",
    description: "펫체키 프리미엄 서비스로 더 많은 기능을 이용하세요.",
    keywords: ["펫체키 프리미엄", "구독", "프리미엄 서비스"],
    noIndex: true,
  },
  settings: {
    title: "설정",
    description: "펫체키 앱 설정을 관리하세요.",
    noIndex: true,
  },
  messages: {
    title: "메시지",
    description: "펫체키 메시지함입니다.",
    noIndex: true,
  },
  reminders: {
    title: "알림 설정",
    description: "반려동물 관련 알림을 설정하세요.",
    noIndex: true,
  },
};

// ============================================
// 메타데이터 생성 함수
// ============================================

/**
 * 페이지별 메타데이터 생성
 */
export function generatePageMetadata(
  pageKey: keyof typeof PAGE_SEO,
  options?: {
    dynamicTitle?: string;
    dynamicDescription?: string;
    image?: string;
    canonical?: string;
  }
): Metadata {
  const pageSeo = PAGE_SEO[pageKey];
  if (!pageSeo) {
    return generateDefaultMetadata();
  }

  const title = options?.dynamicTitle || pageSeo.title;
  const description = options?.dynamicDescription || pageSeo.description;
  const keywords = [...DEFAULT_KEYWORDS, ...(pageSeo.keywords || [])];
  const canonical = options?.canonical || pageSeo.canonical;
  const image = options?.image || `${SITE_CONFIG.url}/og-image.png`;

  return {
    title: `${title} | ${SITE_CONFIG.name}`,
    description,
    keywords,
    authors: [SITE_CONFIG.author],
    creator: SITE_CONFIG.author.name,
    publisher: SITE_CONFIG.author.name,
    robots: pageSeo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: canonical || SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_CONFIG.name} - ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      site: SITE_CONFIG.twitterHandle,
      images: [image],
    },
  };
}

/**
 * 기본 메타데이터 생성
 */
export function generateDefaultMetadata(): Metadata {
  return {
    title: {
      template: `%s | ${SITE_CONFIG.name}`,
      default: `${SITE_CONFIG.name} - ${SITE_CONFIG.description}`,
    },
    description: SITE_CONFIG.description,
    keywords: DEFAULT_KEYWORDS,
    authors: [SITE_CONFIG.author],
    creator: SITE_CONFIG.author.name,
    publisher: SITE_CONFIG.author.name,
    robots: { index: true, follow: true },
    openGraph: {
      title: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      url: SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: "website",
      images: [
        {
          url: `${SITE_CONFIG.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      site: SITE_CONFIG.twitterHandle,
      images: [`${SITE_CONFIG.url}/og-image.png`],
    },
  };
}

/**
 * 동적 페이지용 메타데이터 생성 (예: 커뮤니티 게시글)
 */
export function generateDynamicMetadata(options: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "article" | "website";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}): Metadata {
  const {
    title,
    description,
    image = `${SITE_CONFIG.url}/og-image.png`,
    url,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    tags,
  } = options;

  return {
    title: `${title} | ${SITE_CONFIG.name}`,
    description,
    keywords: tags ? [...DEFAULT_KEYWORDS, ...tags] : DEFAULT_KEYWORDS,
    authors: author ? [{ name: author }] : [SITE_CONFIG.author],
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: url || SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        tags,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      site: SITE_CONFIG.twitterHandle,
      images: [image],
    },
  };
}

// ============================================
// JSON-LD 구조화 데이터
// ============================================

export interface OrganizationJsonLd {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
  contactPoint?: {
    "@type": "ContactPoint";
    contactType: string;
    availableLanguage: string[];
  };
}

export interface WebsiteJsonLd {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

export interface ArticleJsonLd {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    "@type": "Person";
    name: string;
  };
}

export interface FAQJsonLd {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

/**
 * Organization JSON-LD 생성
 */
export function generateOrganizationJsonLd(): OrganizationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    sameAs: [
      "https://www.facebook.com/petchecky",
      "https://www.instagram.com/petchecky",
      "https://twitter.com/petchecky",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Korean", "English"],
    },
  };
}

/**
 * Website JSON-LD 생성
 */
export function generateWebsiteJsonLd(): WebsiteJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/community?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Article JSON-LD 생성
 */
export function generateArticleJsonLd(options: {
  title: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}): ArticleJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.title,
    description: options.description,
    image: options.image,
    datePublished: options.datePublished,
    dateModified: options.dateModified,
    author: options.authorName
      ? {
          "@type": "Person",
          name: options.authorName,
        }
      : undefined,
  };
}

/**
 * FAQ JSON-LD 생성
 */
export function generateFAQJsonLd(
  faqs: Array<{ question: string; answer: string }>
): FAQJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
