import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";

/**
 * robots.txt 생성
 *
 * Next.js가 자동으로 /robots.txt 경로에서 이 함수를 호출합니다.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/settings/",
          "/subscription/success",
          "/subscription/fail",
          "/messages",
          "/reminders",
          "/*.json$",
          "/*?*", // 쿼리 파라미터 포함 URL 차단
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/settings/",
          "/subscription/success",
          "/subscription/fail",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/settings/",
        ],
      },
      // 악성 봇 차단
      {
        userAgent: "AhrefsBot",
        disallow: "/",
      },
      {
        userAgent: "SemrushBot",
        disallow: "/",
      },
      {
        userAgent: "MJ12bot",
        disallow: "/",
      },
      {
        userAgent: "DotBot",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
