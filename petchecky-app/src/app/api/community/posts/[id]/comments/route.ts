import { NextRequest, NextResponse } from 'next/server';
import { getComments, createComment, deleteComment, getCommunityPost } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/lib/constants';
import { sanitizeContent, anonymizeEmail } from '@/lib/sanitize';

// Rate Limit 응답 헤더 생성
function createRateLimitHeaders(remaining: number, resetIn: number) {
  return {
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
  };
}

// GET: 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // 게시글 존재 확인
    const post = await getCommunityPost(id);
    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const comments = await getComments(id);

    return NextResponse.json(
      { comments },
      { headers: createRateLimitHeaders(remaining, resetIn) }
    );
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: '댓글을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// POST: 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      RATE_LIMITS.COMMENTS_PER_MINUTE,
      RATE_LIMITS.COMMENTS_WINDOW_MS
    );

    if (!allowed) {
      return NextResponse.json(
        { error: '댓글 작성이 너무 빈번합니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: createRateLimitHeaders(remaining, resetIn),
        }
      );
    }

    // 게시글 존재 확인
    const post = await getCommunityPost(id);
    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content, parent_id } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: '댓글 내용을 입력해주세요' },
        { status: 400 }
      );
    }

    // XSS 방지: 입력값 정제
    const sanitizedContent = sanitizeContent(content, 1000);

    if (!sanitizedContent) {
      return NextResponse.json(
        { error: '댓글 내용이 유효하지 않습니다' },
        { status: 400 }
      );
    }

    const comment = await createComment({
      post_id: id,
      user_id: user.id,
      content: sanitizedContent,
      author_name: anonymizeEmail(user.email || ''),
      parent_id: parent_id || undefined
    });

    if (!comment) {
      return NextResponse.json(
        { error: '댓글 작성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { comment },
      { headers: createRateLimitHeaders(remaining, resetIn) }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: '댓글 작성에 실패했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 댓글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: '댓글 ID가 필요합니다' },
        { status: 400 }
      );
    }

    const success = await deleteComment(commentId);

    if (!success) {
      return NextResponse.json(
        { error: '댓글 삭제에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: '댓글 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
