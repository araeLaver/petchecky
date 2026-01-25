import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";

/**
 * 동적 사이트맵 생성
 *
 * Next.js가 자동으로 /sitemap.xml 경로에서 이 함수를 호출합니다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const lastModified = new Date();

  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/community`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/emergency`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image-analysis`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/health-tracking`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/health-insights`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/vaccination`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/medication`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/vet-records`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/vet-consultation`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hospital-review`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/allergy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/diet`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/walk`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/training`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/expense`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/insurance`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/pet-sitter`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/qr-pet-id`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 동적 페이지 (커뮤니티 게시글) - 실제 구현 시 DB에서 조회
  // const dynamicPages = await getDynamicPages();

  return [...staticPages];
}

/**
 * 동적 페이지 조회 (예: 커뮤니티 게시글)
 * 실제 구현 시 활성화
 */
// async function getDynamicPages(): Promise<MetadataRoute.Sitemap> {
//   try {
//     // 최근 게시글 목록 조회 (최대 1000개)
//     const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/community/posts?limit=1000`, {
//       next: { revalidate: 3600 }, // 1시간 캐시
//     });
//
//     if (!response.ok) return [];
//
//     const data = await response.json();
//     const posts = data.posts || [];
//
//     return posts.map((post: { id: string; updated_at?: string; created_at: string }) => ({
//       url: `${SITE_CONFIG.url}/community/${post.id}`,
//       lastModified: new Date(post.updated_at || post.created_at),
//       changeFrequency: 'weekly' as const,
//       priority: 0.6,
//     }));
//   } catch (error) {
//     console.error('Failed to fetch dynamic pages for sitemap:', error);
//     return [];
//   }
// }
