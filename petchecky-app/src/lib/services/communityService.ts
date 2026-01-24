// 커뮤니티 API 서비스

import { apiClient, ApiError } from "./apiClient";

// 게시글 타입
export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: "question" | "tip" | "daily" | "review";
  pet_species?: "dog" | "cat";
  author_name: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
}

// 댓글 타입
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  author_name: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

// 게시글 목록 응답
export interface PostsResponse {
  posts: Post[];
}

// 게시글 상세 응답
export interface PostDetailResponse {
  post: Post;
}

// 댓글 목록 응답
export interface CommentsResponse {
  comments: Comment[];
}

// 게시글 작성 요청
export interface CreatePostRequest {
  title: string;
  content: string;
  category: string;
  pet_species?: string;
}

// 댓글 작성 요청
export interface CreateCommentRequest {
  content: string;
  parent_id?: string;
}

// 좋아요 토글 응답
export interface LikeResponse {
  liked: boolean;
  likes_count: number;
}

// 서비스 결과 타입
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * 커뮤니티 서비스
 */
export const communityService = {
  // ============ 게시글 API ============

  /**
   * 게시글 목록 조회
   */
  async getPosts(
    params?: {
      category?: string;
      limit?: number;
      offset?: number;
    },
    token?: string | null
  ): Promise<ServiceResult<Post[]>> {
    const queryParams = new URLSearchParams();
    if (params?.category && params.category !== "all") {
      queryParams.append("category", params.category);
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append("offset", params.offset.toString());
    }

    const url = `/api/community/posts${queryParams.toString() ? `?${queryParams}` : ""}`;
    const response = await apiClient.get<PostsResponse>(url, { token });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data?.posts || [] };
  },

  /**
   * 게시글 상세 조회
   */
  async getPost(postId: string, token?: string | null): Promise<ServiceResult<Post>> {
    const response = await apiClient.get<PostDetailResponse>(
      `/api/community/posts/${postId}`,
      { token }
    );

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (!response.data?.post) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "게시글을 찾을 수 없습니다.",
          status: 404,
        },
      };
    }

    return { success: true, data: response.data.post };
  },

  /**
   * 게시글 작성
   */
  async createPost(
    data: CreatePostRequest,
    token: string
  ): Promise<ServiceResult<Post>> {
    const response = await apiClient.post<PostDetailResponse>(
      "/api/community/posts",
      data,
      { token }
    );

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (!response.data?.post) {
      return {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "게시글 작성에 실패했습니다.",
          status: 500,
        },
      };
    }

    return { success: true, data: response.data.post };
  },

  /**
   * 게시글 수정
   */
  async updatePost(
    postId: string,
    data: Partial<CreatePostRequest>,
    token: string
  ): Promise<ServiceResult<Post>> {
    const response = await apiClient.put<PostDetailResponse>(
      `/api/community/posts/${postId}`,
      data,
      { token }
    );

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data?.post };
  },

  /**
   * 게시글 삭제
   */
  async deletePost(postId: string, token: string): Promise<ServiceResult<void>> {
    const response = await apiClient.delete(
      `/api/community/posts/${postId}`,
      { token }
    );

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },

  // ============ 댓글 API ============

  /**
   * 댓글 목록 조회
   */
  async getComments(
    postId: string,
    token?: string | null
  ): Promise<ServiceResult<Comment[]>> {
    const response = await apiClient.get<CommentsResponse>(
      `/api/community/posts/${postId}/comments`,
      { token }
    );

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data?.comments || [] };
  },

  /**
   * 댓글 작성
   */
  async createComment(
    postId: string,
    data: CreateCommentRequest,
    token: string
  ): Promise<ServiceResult<Comment>> {
    const response = await apiClient.post<{ comment: Comment }>(
      `/api/community/posts/${postId}/comments`,
      data,
      { token }
    );

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data?.comment };
  },

  /**
   * 댓글 삭제
   */
  async deleteComment(
    postId: string,
    commentId: string,
    token: string
  ): Promise<ServiceResult<void>> {
    const response = await apiClient.delete(
      `/api/community/posts/${postId}/comments?commentId=${commentId}`,
      { token }
    );

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },

  // ============ 좋아요 API ============

  /**
   * 좋아요 토글
   */
  async toggleLike(postId: string, token: string): Promise<ServiceResult<LikeResponse>> {
    const response = await apiClient.post<LikeResponse>(
      `/api/community/posts/${postId}/like`,
      undefined,
      { token }
    );

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  },
};

export default communityService;
