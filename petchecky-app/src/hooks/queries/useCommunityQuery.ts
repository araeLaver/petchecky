"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_nickname: string;
  category: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
}

interface PostsResponse {
  posts: Post[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

interface CreatePostData {
  title: string;
  content: string;
  category: string;
}

/**
 * 게시글 목록을 가져오는 함수
 */
async function fetchPosts(params: {
  page?: number;
  category?: string;
  search?: string;
  token?: string | null;
}): Promise<PostsResponse> {
  const { page = 1, category, search, token } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "10",
  });

  if (category) queryParams.append("category", category);
  if (search) queryParams.append("search", search);

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`/api/community/posts?${queryParams}`, { headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "게시글을 불러오는데 실패했습니다.");
  }

  return data;
}

/**
 * 게시글 상세 정보를 가져오는 함수
 */
async function fetchPost(id: string, token?: string | null): Promise<Post> {
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`/api/community/posts/${id}`, { headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "게시글을 불러오는데 실패했습니다.");
  }

  return data.post;
}

/**
 * 게시글 작성 함수
 */
async function createPost(data: CreatePostData, token: string): Promise<Post> {
  const response = await fetch("/api/community/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "게시글 작성에 실패했습니다.");
  }

  return result.post;
}

/**
 * 좋아요 토글 함수
 */
async function toggleLike(postId: string, token: string): Promise<{ liked: boolean; likeCount: number }> {
  const response = await fetch(`/api/community/posts/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "좋아요 처리에 실패했습니다.");
  }

  return data;
}

/**
 * 커뮤니티 게시글 목록 Query Hook
 */
export function useCommunityPostsQuery(params: {
  page?: number;
  category?: string;
  search?: string;
  token?: string | null;
}) {
  return useQuery({
    queryKey: ["community", "posts", params.category, params.search, params.page],
    queryFn: () => fetchPosts(params),
    staleTime: 2 * 60 * 1000, // 2분
  });
}

/**
 * 커뮤니티 게시글 무한 스크롤 Query Hook
 */
export function useCommunityPostsInfiniteQuery(params: {
  category?: string;
  search?: string;
  token?: string | null;
}) {
  return useInfiniteQuery({
    queryKey: ["community", "posts", "infinite", params.category, params.search],
    queryFn: ({ pageParam }) =>
      fetchPosts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
    staleTime: 2 * 60 * 1000, // 2분
  });
}

/**
 * 게시글 상세 Query Hook
 */
export function useCommunityPostQuery(id: string, token?: string | null) {
  return useQuery({
    queryKey: ["community", "post", id],
    queryFn: () => fetchPost(id, token),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1분
  });
}

/**
 * 게시글 작성 Mutation Hook
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, token }: { data: CreatePostData; token: string }) =>
      createPost(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });
}

/**
 * 좋아요 토글 Mutation Hook
 */
export function useToggleLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, token }: { postId: string; token: string }) =>
      toggleLike(postId, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["community", "post", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });
}
