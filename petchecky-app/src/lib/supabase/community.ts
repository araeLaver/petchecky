import { supabase } from './client';

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: 'question' | 'tip' | 'daily' | 'review';
  pet_species?: 'dog' | 'cat';
  author_name: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  author_name: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// ============ 게시글 API ============

// 게시글 목록 조회
export async function getCommunityPosts(
  options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }
): Promise<CommunityPost[]> {
  let query = supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.category && options.category !== 'all') {
    query = query.eq('category', options.category);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return data || [];
}

// 게시글 상세 조회
export async function getCommunityPost(postId: string): Promise<CommunityPost | null> {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }
  return data;
}

// 게시글 조회수 증가
export async function incrementPostViews(postId: string): Promise<void> {
  try {
    const { data: post } = await supabase
      .from('community_posts')
      .select('views_count')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase
        .from('community_posts')
        .update({ views_count: (post.views_count || 0) + 1 })
        .eq('id', postId);
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
}

// 게시글 작성
export async function createCommunityPost(
  post: Omit<CommunityPost, 'id' | 'likes_count' | 'comments_count' | 'views_count' | 'created_at' | 'updated_at'>
): Promise<CommunityPost | null> {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(post)
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }
  return data;
}

// 게시글 수정
export async function updateCommunityPost(
  postId: string,
  updates: Partial<Pick<CommunityPost, 'title' | 'content' | 'category' | 'pet_species'>>
): Promise<CommunityPost | null> {
  const { data, error } = await supabase
    .from('community_posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    return null;
  }
  return data;
}

// 게시글 삭제
export async function deleteCommunityPost(postId: string): Promise<boolean> {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }
  return true;
}

// ============ 댓글 API ============

// 댓글 목록 조회
export async function getComments(postId: string): Promise<CommunityComment[]> {
  const { data, error } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data || [];
}

// 댓글 작성
export async function createComment(
  comment: Omit<CommunityComment, 'id' | 'created_at' | 'updated_at'>
): Promise<CommunityComment | null> {
  const { data, error } = await supabase
    .from('community_comments')
    .insert(comment)
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }
  return data;
}

// 댓글 수정
export async function updateComment(
  commentId: string,
  content: string
): Promise<CommunityComment | null> {
  const { data, error } = await supabase
    .from('community_comments')
    .update({ content })
    .eq('id', commentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating comment:', error);
    return null;
  }
  return data;
}

// 댓글 삭제
export async function deleteComment(commentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('community_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
  return true;
}

// ============ 좋아요 API ============

// 좋아요 상태 확인
export async function checkLikeStatus(postId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('community_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (error) {
    return false;
  }
  return !!data;
}

// 좋아요 토글
export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likes_count: number }> {
  const isLiked = await checkLikeStatus(postId, userId);

  if (isLiked) {
    // 좋아요 취소
    await supabase
      .from('community_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
  } else {
    // 좋아요 추가
    await supabase
      .from('community_likes')
      .insert({ post_id: postId, user_id: userId });
  }

  // 업데이트된 좋아요 수 조회
  const { data } = await supabase
    .from('community_posts')
    .select('likes_count')
    .eq('id', postId)
    .single();

  return {
    liked: !isLiked,
    likes_count: data?.likes_count || 0
  };
}
