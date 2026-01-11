/**
 * Community Posts API Route Tests
 *
 * Tests for the community posts API endpoints:
 * - GET: Fetch posts with filtering and pagination
 * - POST: Create new posts with authentication
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  getCommunityPosts: jest.fn(),
  createCommunityPost: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authenticateRequest: jest.fn(),
}));

import { getCommunityPosts, createCommunityPost } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';

const mockGetCommunityPosts = getCommunityPosts as jest.MockedFunction<typeof getCommunityPosts>;
const mockCreateCommunityPost = createCommunityPost as jest.MockedFunction<typeof createCommunityPost>;
const mockAuthenticateRequest = authenticateRequest as jest.MockedFunction<typeof authenticateRequest>;

// Helper to create mock NextRequest
function createMockRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: object;
  } = {}
): NextRequest {
  const { method = 'GET', headers = {}, body } = options;

  return {
    url,
    method,
    headers: {
      get: (key: string) => headers[key.toLowerCase()] || null,
    },
    json: async () => body,
  } as unknown as NextRequest;
}

// Sample post data
const samplePost = {
  id: '123',
  user_id: 'user-1',
  title: 'Test Post',
  content: 'Test content',
  category: 'question' as const,
  pet_species: 'dog' as const,
  author_name: 'testuser',
  likes_count: 0,
  comments_count: 0,
  views_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('Community Posts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/community/posts', () => {
    it('should return posts with default parameters', async () => {
      mockGetCommunityPosts.mockResolvedValue([samplePost]);

      const request = createMockRequest('http://localhost/api/community/posts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.posts).toHaveLength(1);
      expect(data.posts[0].title).toBe('Test Post');
      expect(mockGetCommunityPosts).toHaveBeenCalledWith({
        category: 'all',
        limit: 20,
        offset: 0,
      });
    });

    it('should filter posts by category', async () => {
      mockGetCommunityPosts.mockResolvedValue([samplePost]);

      const request = createMockRequest(
        'http://localhost/api/community/posts?category=question'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetCommunityPosts).toHaveBeenCalledWith({
        category: 'question',
        limit: 20,
        offset: 0,
      });
    });

    it('should handle pagination parameters', async () => {
      mockGetCommunityPosts.mockResolvedValue([]);

      const request = createMockRequest(
        'http://localhost/api/community/posts?limit=10&offset=20'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetCommunityPosts).toHaveBeenCalledWith({
        category: 'all',
        limit: 10,
        offset: 20,
      });
    });

    it('should return empty array when no posts found', async () => {
      mockGetCommunityPosts.mockResolvedValue([]);

      const request = createMockRequest('http://localhost/api/community/posts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.posts).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockGetCommunityPosts.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('http://localhost/api/community/posts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/community/posts', () => {
    const validPostBody = {
      title: 'New Post',
      content: 'Post content',
      category: 'question',
      pet_species: 'dog',
    };

    const authenticatedUser = {
      user: { id: 'user-1', email: 'test@example.com' },
      subscription: { isPremium: false, isPremiumPlus: false, planType: null, currentPeriodEnd: null },
      error: null,
    };

    it('should create post for authenticated user', async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);
      mockCreateCommunityPost.mockResolvedValue(samplePost);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: validPostBody,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.post).toBeDefined();
      expect(mockCreateCommunityPost).toHaveBeenCalledWith({
        user_id: 'user-1',
        title: 'New Post',
        content: 'Post content',
        category: 'question',
        pet_species: 'dog',
        author_name: 'test',
      });
    });

    it('should return 401 for unauthenticated request', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        user: null,
        subscription: { isPremium: false, isPremiumPlus: false, planType: null, currentPeriodEnd: null },
        error: null,
      });

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        body: validPostBody,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('로그인');
    });

    it('should return 401 for invalid token', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        user: null,
        subscription: { isPremium: false, isPremiumPlus: false, planType: null, currentPeriodEnd: null },
        error: '유효하지 않은 인증 토큰입니다.',
      });

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer invalid-token' },
        body: validPostBody,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });

    it('should return 400 for missing title', async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: { ...validPostBody, title: '' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('필수');
    });

    it('should return 400 for missing content', async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: { ...validPostBody, content: '' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('필수');
    });

    it('should return 400 for missing category', async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: { title: 'Test', content: 'Content' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('필수');
    });

    it('should return 400 for invalid category', async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: { ...validPostBody, category: 'invalid' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('카테고리');
    });

    it('should handle whitespace-only title', async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: { ...validPostBody, title: '   ' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('필수');
    });

    it('should trim title and content', async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);
      mockCreateCommunityPost.mockResolvedValue(samplePost);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: { ...validPostBody, title: '  Trimmed Title  ', content: '  Trimmed Content  ' },
      });

      await POST(request);

      expect(mockCreateCommunityPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Trimmed Title',
          content: 'Trimmed Content',
        })
      );
    });

    it('should handle null pet_species', async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);
      mockCreateCommunityPost.mockResolvedValue(samplePost);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: { title: 'Test', content: 'Content', category: 'question' },
      });

      await POST(request);

      expect(mockCreateCommunityPost).toHaveBeenCalledWith(
        expect.objectContaining({
          pet_species: null,
        })
      );
    });

    it('should return 500 when database insert fails', async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);
      mockCreateCommunityPost.mockResolvedValue(null);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: validPostBody,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('실패');
    });

    it('should handle unexpected errors', async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);
      mockCreateCommunityPost.mockRejectedValue(new Error('Unexpected error'));

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: validPostBody,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should use email prefix as author_name', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        ...authenticatedUser,
        user: { id: 'user-1', email: 'myname@example.com' },
      });
      mockCreateCommunityPost.mockResolvedValue(samplePost);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: validPostBody,
      });

      await POST(request);

      expect(mockCreateCommunityPost).toHaveBeenCalledWith(
        expect.objectContaining({
          author_name: 'myname',
        })
      );
    });

    it('should use "익명" when email is not available', async () => {
      mockAuthenticateRequest.mockResolvedValue({
        ...authenticatedUser,
        user: { id: 'user-1', email: '' },
      });
      mockCreateCommunityPost.mockResolvedValue(samplePost);

      const request = createMockRequest('http://localhost/api/community/posts', {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: validPostBody,
      });

      await POST(request);

      expect(mockCreateCommunityPost).toHaveBeenCalledWith(
        expect.objectContaining({
          author_name: '익명',
        })
      );
    });
  });
});
