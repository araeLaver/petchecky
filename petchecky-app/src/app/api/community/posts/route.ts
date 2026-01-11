import { NextRequest, NextResponse } from 'next/server';
import { getCommunityPosts, createCommunityPost } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';

// GET: 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await getCommunityPosts({ category, limit, offset });

    return NextResponse.json({ posts });
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

    const post = await createCommunityPost({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category,
      pet_species: pet_species || null,
      author_name: user.email?.split('@')[0] || '익명'
    });

    if (!post) {
      return NextResponse.json(
        { error: '게시글 작성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: '게시글 작성에 실패했습니다' },
      { status: 500 }
    );
  }
}
