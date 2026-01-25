import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { PushNotificationProvider } from "@/contexts/PushNotificationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import OfflineIndicator from "@/components/OfflineIndicator";
import ToastContainer from "@/components/Toast";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SkipNavigation from "@/components/SkipNavigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { checkEnvVariables } from "@/lib/env";
import { SITE_CONFIG, DEFAULT_KEYWORDS, generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/lib/seo";
import { SoftwareAppJsonLd, MedicalServiceJsonLd } from "@/components/JsonLd";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

// 서버 사이드에서 환경변수 검증
checkEnvVariables();

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    template: `%s | ${SITE_CONFIG.name}`,
    default: `${SITE_CONFIG.name} - AI가 체크하는 우리 아이 건강`,
  },
  description: SITE_CONFIG.description,
  keywords: DEFAULT_KEYWORDS,
  authors: [SITE_CONFIG.author],
  creator: SITE_CONFIG.author.name,
  publisher: SITE_CONFIG.author.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: `${SITE_CONFIG.name} - AI가 체크하는 우리 아이 건강`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} - AI가 체크하는 우리 아이 건강`,
    description: SITE_CONFIG.description,
    site: SITE_CONFIG.twitterHandle,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      "ko-KR": SITE_CONFIG.url,
      "en-US": `${SITE_CONFIG.url}/en`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || "",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3B82F6",
};

// JSON-LD 구조화 데이터
const organizationJsonLd = generateOrganizationJsonLd();
const websiteJsonLd = generateWebsiteJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
          strategy="beforeInteractive"
        />
        {/* JSON-LD 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <SoftwareAppJsonLd />
        <MedicalServiceJsonLd
          services={[
            { name: "AI 증상 분석", description: "반려동물 증상을 AI가 분석하여 가능한 원인과 대응 방법을 안내합니다.", url: `${SITE_CONFIG.url}` },
            { name: "AI 이미지 분석", description: "반려동물 사진을 AI가 분석하여 건강 상태를 체크합니다.", url: `${SITE_CONFIG.url}/image-analysis` },
            { name: "응급 상황 가이드", description: "반려동물 응급 상황 시 대처 방법을 안내합니다.", url: `${SITE_CONFIG.url}/emergency` },
            { name: "동물병원 찾기", description: "가까운 동물병원을 찾고 리뷰를 확인할 수 있습니다.", url: `${SITE_CONFIG.url}/hospital-review` },
          ]}
        />
      </head>
      <body className={`${notoSansKr.variable} font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <SubscriptionProvider>
                  <PushNotificationProvider>
                    <ToastProvider>
                      <SkipNavigation />
                      <ServiceWorkerRegistration />
                      <OfflineIndicator />
                      <WebVitalsReporter />
                      <PWAInstallPrompt delay={10000} minVisits={2} />
                      <ToastContainer />
                      <ErrorBoundary>
                        <div id="main-content">
                          {children}
                        </div>
                      </ErrorBoundary>
                    </ToastProvider>
                  </PushNotificationProvider>
                </SubscriptionProvider>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
