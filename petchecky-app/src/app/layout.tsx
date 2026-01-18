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

// 서버 사이드에서 환경변수 검증
checkEnvVariables();

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "펫체키 - AI가 체크하는 우리 아이 건강",
  description: "반려동물이 아파 보일 때, AI가 증상을 분석하고 적절한 대응 방법을 알려드립니다. 강아지, 고양이 건강 상담 서비스.",
  keywords: ["펫체키", "반려동물", "AI", "건강", "증상", "상담", "강아지", "고양이", "수의사", "펫케어"],
  authors: [{ name: "PetChecky" }],
  creator: "PetChecky",
  publisher: "PetChecky",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "펫체키 - AI가 체크하는 우리 아이 건강",
    description: "반려동물이 아파 보일 때, AI가 증상을 분석하고 적절한 대응 방법을 알려드립니다.",
    url: "https://petchecky.com",
    siteName: "펫체키",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "펫체키 - AI가 체크하는 우리 아이 건강",
    description: "반려동물이 아파 보일 때, AI가 증상을 분석하고 적절한 대응 방법을 알려드립니다.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3B82F6",
};

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
