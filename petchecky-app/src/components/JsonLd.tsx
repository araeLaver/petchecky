/**
 * JSON-LD Structured Data Component
 *
 * 검색엔진 최적화를 위한 구조화 데이터 컴포넌트
 */

import { SITE_CONFIG } from "@/lib/seo";

// ============================================
// 타입 정의
// ============================================

interface BaseJsonLd {
  "@context": "https://schema.org";
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceItem {
  name: string;
  description: string;
  url?: string;
}

// ============================================
// JSON-LD 래퍼 컴포넌트
// ============================================

function JsonLdScript({ data }: { data: BaseJsonLd & Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============================================
// 빵 부스러기 (Breadcrumb)
// ============================================

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLdScript data={data} />;
}

// ============================================
// FAQ 페이지
// ============================================

export function FAQJsonLd({ faqs }: { faqs: FAQItem[] }) {
  const data = {
    "@context": "https://schema.org" as const,
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

  return <JsonLdScript data={data} />;
}

// ============================================
// 서비스 (소프트웨어 애플리케이션)
// ============================================

export function SoftwareAppJsonLd() {
  const data = {
    "@context": "https://schema.org" as const,
    "@type": "SoftwareApplication",
    name: SITE_CONFIG.name,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
  };

  return <JsonLdScript data={data} />;
}

// ============================================
// 의료 서비스
// ============================================

export function MedicalServiceJsonLd({ services }: { services: ServiceItem[] }) {
  const data = {
    "@context": "https://schema.org" as const,
    "@type": "MedicalBusiness",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    medicalSpecialty: "Veterinary",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "펫체키 서비스",
      itemListElement: services.map((service) => ({
        "@type": "OfferCatalog",
        name: service.name,
        description: service.description,
        url: service.url,
      })),
    },
  };

  return <JsonLdScript data={data} />;
}

// ============================================
// 게시글 (Article)
// ============================================

export function ArticleJsonLd({
  title,
  description,
  image,
  datePublished,
  dateModified,
  authorName,
  url,
}: {
  title: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  url?: string;
}) {
  const data = {
    "@context": "https://schema.org" as const,
    "@type": "Article",
    headline: title,
    description,
    image: image || `${SITE_CONFIG.url}/og-image.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: authorName || SITE_CONFIG.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url || SITE_CONFIG.url,
    },
  };

  return <JsonLdScript data={data} />;
}

// ============================================
// 동물병원 (로컬 비즈니스)
// ============================================

export function VetClinicJsonLd({
  name,
  address,
  phone,
  rating,
  reviewCount,
  priceRange,
  openingHours,
}: {
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  openingHours?: string[];
}) {
  const data = {
    "@context": "https://schema.org" as const,
    "@type": "VeterinaryCare",
    name,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressCountry: "KR",
    },
    telephone: phone,
    priceRange: priceRange || "$$",
    openingHoursSpecification: openingHours?.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.split(" ")[0],
      opens: hours.split(" ")[1]?.split("-")[0],
      closes: hours.split(" ")[1]?.split("-")[1],
    })),
    aggregateRating: rating
      ? {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount: reviewCount || 0,
        }
      : undefined,
  };

  return <JsonLdScript data={data} />;
}

// ============================================
// 제품 (구독 플랜)
// ============================================

export function ProductJsonLd({
  name,
  description,
  price,
  currency = "KRW",
}: {
  name: string;
  description: string;
  price: number;
  currency?: string;
}) {
  const data = {
    "@context": "https://schema.org" as const,
    "@type": "Product",
    name,
    description,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
    },
  };

  return <JsonLdScript data={data} />;
}

// ============================================
// How-To (가이드)
// ============================================

export function HowToJsonLd({
  name,
  description,
  steps,
  totalTime,
}: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string; // ISO 8601 duration format (e.g., "PT10M" for 10 minutes)
}) {
  const data = {
    "@context": "https://schema.org" as const,
    "@type": "HowTo",
    name,
    description,
    totalTime,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };

  return <JsonLdScript data={data} />;
}

// ============================================
// 이벤트
// ============================================

export function EventJsonLd({
  name,
  description,
  startDate,
  endDate,
  location,
  organizer,
  url,
}: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  organizer?: string;
  url?: string;
}) {
  const data = {
    "@context": "https://schema.org" as const,
    "@type": "Event",
    name,
    description,
    startDate,
    endDate,
    location: location
      ? {
          "@type": "Place",
          name: location,
        }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: organizer || SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    url: url || SITE_CONFIG.url,
  };

  return <JsonLdScript data={data} />;
}
