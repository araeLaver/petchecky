import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  age: number;
  weight: number;
  created_at: string;
  updated_at: string;
}

export interface ChatRecord {
  id: string;
  user_id: string;
  pet_id: string;
  pet_name: string;
  pet_species: 'dog' | 'cat';
  preview: string;
  severity: 'low' | 'medium' | 'high' | null;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    severity?: 'low' | 'medium' | 'high';
  }>;
  created_at: string;
}

// ============ 펫 프로필 API ============

// 사용자의 펫 목록 조회
export async function getPets(userId: string): Promise<Pet[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pets:', error);
    return [];
  }
  return data || [];
}

// 펫 추가
export async function addPet(pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>): Promise<Pet | null> {
  const { data, error } = await supabase
    .from('pets')
    .insert(pet)
    .select()
    .single();

  if (error) {
    console.error('Error adding pet:', error);
    return null;
  }
  return data;
}

// 펫 수정
export async function updatePet(id: string, pet: Partial<Omit<Pet, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Pet | null> {
  const { data, error } = await supabase
    .from('pets')
    .update(pet)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pet:', error);
    return null;
  }
  return data;
}

// 펫 삭제
export async function deletePet(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting pet:', error);
    return false;
  }
  return true;
}

// ============ 상담 기록 API ============

// 사용자의 상담 기록 조회
export async function getChatRecords(userId: string): Promise<ChatRecord[]> {
  const { data, error } = await supabase
    .from('chat_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching chat records:', error);
    return [];
  }
  return data || [];
}

// 상담 기록 추가
export async function addChatRecord(record: Omit<ChatRecord, 'id' | 'created_at'>): Promise<ChatRecord | null> {
  const { data, error } = await supabase
    .from('chat_records')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Error adding chat record:', error);
    return null;
  }
  return data;
}

// 상담 기록 삭제
export async function deleteChatRecord(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting chat record:', error);
    return false;
  }
  return true;
}

// ============ 사용량 관리 API ============

export const MONTHLY_FREE_LIMIT = 20;

export interface UsageRecord {
  id: string;
  user_id: string;
  year_month: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// 현재 월 문자열 생성 (예: '2025-01')
function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// 사용량 조회
export async function getUsage(userId: string): Promise<number> {
  const yearMonth = getCurrentYearMonth();

  const { data, error } = await supabase
    .from('usage_records')
    .select('usage_count')
    .eq('user_id', userId)
    .eq('year_month', yearMonth)
    .single();

  if (error) {
    // 레코드가 없는 경우 0 반환
    if (error.code === 'PGRST116') {
      return 0;
    }
    console.error('Error fetching usage:', error);
    return 0;
  }

  return data?.usage_count || 0;
}

// 사용량 증가
export async function incrementUsage(userId: string): Promise<boolean> {
  const yearMonth = getCurrentYearMonth();

  // upsert로 처리 (없으면 생성, 있으면 증가)
  const { data: existing } = await supabase
    .from('usage_records')
    .select('id, usage_count')
    .eq('user_id', userId)
    .eq('year_month', yearMonth)
    .single();

  if (existing) {
    // 기존 레코드 업데이트
    const { error } = await supabase
      .from('usage_records')
      .update({
        usage_count: existing.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating usage:', error);
      return false;
    }
  } else {
    // 새 레코드 생성
    const { error } = await supabase
      .from('usage_records')
      .insert({
        user_id: userId,
        year_month: yearMonth,
        usage_count: 1
      });

    if (error) {
      console.error('Error creating usage record:', error);
      return false;
    }
  }

  return true;
}

// 남은 무료 횟수 조회
export async function getRemainingUsage(userId: string): Promise<number> {
  const used = await getUsage(userId);
  return Math.max(0, MONTHLY_FREE_LIMIT - used);
}

// 사용 가능 여부 체크
export async function canUseService(userId: string): Promise<boolean> {
  const used = await getUsage(userId);
  return used < MONTHLY_FREE_LIMIT;
}

// ============ 커뮤니티 API ============

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
