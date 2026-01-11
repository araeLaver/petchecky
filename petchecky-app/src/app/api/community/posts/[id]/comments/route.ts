import { NextRequest, NextResponse } from 'next/server';
import { getComments, createComment, deleteComment, getCommunityPost } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';

// GET: 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json({ comments });
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

    const comment = await createComment({
      post_id: id,
      user_id: user.id,
      content: content.trim(),
      author_name: user.email?.split('@')[0] || '익명',
      parent_id: parent_id || undefined
    });

    if (!comment) {
      return NextResponse.json(
        { error: '댓글 작성에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment });
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
