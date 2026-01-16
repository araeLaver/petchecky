import { NextRequest, NextResponse } from 'next/server';
import { getCommunityPosts, createCommunityPost } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';
import {
  checkRateLimit,
  getClientIdentifier,
  RATE_LIMITS,
} from '@/lib/rateLimit';
import { sanitizeTitle, sanitizeContent, anonymizeEmail } from '@/lib/sanitize';

// Rate Limit 응답 헤더 생성
function createRateLimitHeaders(remaining: number, resetIn: number) {
  return {
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
  };
}

// GET: 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    // Rate Limiting (IP 기반)
    const identifier = getClientIdentifier(request);
    const { allowed, remaining, resetIn } = checkRateLimit(
      identifier,
      RATE_LIMITS.READS_PER_MINUTE,
      RATE_LIMITS.READS_WINDOW_MS
    );

    if (!allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: createRateLimitHeaders(remaining, resetIn),
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await getCommunityPosts({ category, limit, offset });

    return NextResponse.json(
      { posts },
      { headers: createRateLimitHeaders(remaining, resetIn) }
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: '게시글을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// POST: 게시글 작성
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('authorization');
    const { user, error: authError } = await authenticateRequest(authHeader);

    if (authError || !user) {
      return NextResponse.json(
        { error: authError || '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // Rate Limiting (사용자 기반)
    const identifier = getClientIdentifier(request, user.id);
    const { allowed, remaining, resetIn } = checkRateLimit(
      identifier,
      RATE_LIMITS.POSTS_PER_MINUTE,
      RATE_LIMITS.POSTS_WINDOW_MS
    );

    if (!allowed) {
      return NextResponse.json(
        { error: '게시글 작성이 너무 빈번합니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: createRateLimitHeaders(remaining, resetIn),
        }
      );
    }

    const body = await request.json();
    const { title, content, category, pet_species } = body;

    // 유효성 검사
    if (!title?.trim() || !content?.trim() || !category) {
      return NextResponse.json(
        { error: '제목, 내용, 카테고리는 필수입니다' },
        { status: 400 }
      );
    }

    if (!['question', 'tip', 'daily', 'review'].includes(category)) {
      return NextResponse.json(
        { error: '올바른 카테고리를 선택해주세요' },
        { status: 400 }
      );
    }

    // XSS 방지: 입력값 정제
    const sanitizedTitle = sanitizeTitle(title);
    const sanitizedContent = sanitizeContent(content);

    if (!sanitizedTitle || !sanitizedContent) {
      return NextResponse.json(
        { error: '제목 또는 내용이 유효하지 않습니다' },
        { status: 400 }
      );
    }

    const post = await createCommunityPost({
      user_id: user.id,
      title: sanitizedTitle,
      content: sanitizedContent,
      category,
      pet_species: pet_species || null,
      author_name: anonymizeEmail(user.email || '')
    });

    if (!post) {
      return NextResponse.json(
        { error: '게시글 작성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { post },
      { headers: createRateLimitHeaders(remaining, resetIn) }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: '게시글 작성에 실패했습니다' },
      { status: 500 }
    );
  }
}
