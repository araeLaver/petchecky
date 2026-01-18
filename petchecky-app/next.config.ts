import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24, // 24시간
  },

  // 압축 활성화
  compress: true,

  // 빌드 최적화
  reactStrictMode: true,
  poweredByHeader: false,

  // 실험적 기능
  experimental: {
    // CSS 최적화
    optimizeCss: true,
  },

  // 헤더 설정
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // 보안 헤더
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        // 정적 리소스 캐싱
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // 폰트 캐싱
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      // 예시: 구버전 URL 리다이렉트
      // {
      //   source: "/old-page",
      //   destination: "/new-page",
      //   permanent: true,
      // },
    ];
  },
};

// Sentry 설정
const sentryWebpackPluginOptions = {
  // Sentry 소스맵 업로드 비활성화 (필요 시 활성화)
  silent: true,
  // 빌드 에러 시 Sentry 에러 무시
  hideSourceMaps: true,
};

export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  sentryWebpackPluginOptions
);
