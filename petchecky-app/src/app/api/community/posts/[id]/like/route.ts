import { NextRequest, NextResponse } from 'next/server';
import { toggleLike, checkLikeStatus, getCommunityPost } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';

// GET: 좋아요 상태 확인
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 인증 확인
    const authHeader = request.headers.get('authorization');
    const { user } = await authenticateRequest(authHeader);

    if (!user) {
      return NextResponse.json({ liked: false });
    }

    const liked = await checkLikeStatus(id, user.id);

    return NextResponse.json({ liked });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ liked: false });
  }
}

// POST: 좋아요 토글
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

    // 게시글 존재 확인
    const post = await getCommunityPost(id);
    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const result = await toggleLike(id, user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: '좋아요 처리에 실패했습니다' },
      { status: 500 }
    );
  }
}
