import { NextRequest, NextResponse } from 'next/server';
import { getCommunityPost, updateCommunityPost, deleteCommunityPost, supabase } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';

// GET: 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getCommunityPost(id);

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 조회수 증가
    await supabase
      .from('community_posts')
      .update({ views_count: post.views_count + 1 })
      .eq('id', id);

    return NextResponse.json({ post: { ...post, views_count: post.views_count + 1 } });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: '게시글을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// PATCH: 게시글 수정
export async function PATCH(
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

    // 게시글 존재 및 권한 확인
    const existingPost = await getCommunityPost(id);
    if (!existingPost) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category, pet_species } = body;

    const post = await updateCommunityPost(id, {
      ...(title && { title: title.trim() }),
      ...(content && { content: content.trim() }),
      ...(category && { category }),
      ...(pet_species !== undefined && { pet_species })
    });

    if (!post) {
      return NextResponse.json(
        { error: '게시글 수정에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: '게시글 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 게시글 삭제
export async function DELETE(
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

    // 게시글 존재 및 권한 확인
    const existingPost = await getCommunityPost(id);
    if (!existingPost) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다' },
        { status: 403 }
      );
    }

    const success = await deleteCommunityPost(id);

    if (!success) {
      return NextResponse.json(
        { error: '게시글 삭제에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: '게시글 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
