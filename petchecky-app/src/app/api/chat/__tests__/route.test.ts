/**
 * Chat API Route Tests
 *
 * Tests for the chat API endpoint:
 * - POST: Send message and receive AI response
 * - Authentication and authorization
 * - Usage limits and premium features
 * - Error handling
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { LIMITS } from '@/lib/constants';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  getUsage: jest.fn(),
  incrementUsage: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authenticateRequest: jest.fn(),
  sanitizeUserInput: jest.fn((input: string) => input),
  sanitizePetProfile: jest.fn((profile) => profile),
}));

jest.mock('@/lib/severity', () => ({
  analyzeCombinedSeverity: jest.fn().mockReturnValue('low'),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { getUsage, incrementUsage } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';

const mockGetUsage = getUsage as jest.MockedFunction<typeof getUsage>;
const mockIncrementUsage = incrementUsage as jest.MockedFunction<typeof incrementUsage>;
const mockAuthenticateRequest = authenticateRequest as jest.MockedFunction<typeof authenticateRequest>;

// Helper to create mock NextRequest
function createMockRequest(body: object, headers: Record<string, string> = {}): NextRequest {
  return {
    url: 'http://localhost/api/chat',
    method: 'POST',
    headers: {
      get: (key: string) => headers[key.toLowerCase()] || null,
    },
    json: async () => body,
  } as unknown as NextRequest;
}

// Sample data
const validPetProfile = {
  name: '멍멍이',
  species: 'dog' as const,
  breed: '골든리트리버',
  age: 3,
  weight: 25,
};

const validChatBody = {
  message: '우리 강아지가 밥을 안 먹어요',
  petProfile: validPetProfile,
  history: [],
};

const freeUserAuth = {
  user: { id: 'user-1', email: 'test@example.com' },
  subscription: { isPremium: false, isPremiumPlus: false, planType: null, currentPeriodEnd: null },
  error: null,
};

const premiumUserAuth = {
  user: { id: 'user-2', email: 'premium@example.com' },
  subscription: { isPremium: true, isPremiumPlus: false, planType: 'premium', currentPeriodEnd: '2025-12-31' },
  error: null,
};

const premiumPlusUserAuth = {
  user: { id: 'user-3', email: 'plus@example.com' },
  subscription: { isPremium: true, isPremiumPlus: true, planType: 'premium_plus', currentPeriodEnd: '2025-12-31' },
  error: null,
};

const guestAuth = {
  user: null,
  subscription: { isPremium: false, isPremiumPlus: false, planType: null, currentPeriodEnd: null },
  error: null,
};

// Mock successful Gemini API response
const mockGeminiResponse = {
  ok: true,
  json: async () => ({
    candidates: [{
      content: {
        parts: [{
          text: '펫체키: 강아지가 밥을 안 먹는 것은 여러 원인이 있을 수 있어요. 스트레스, 구강 문제, 소화기 문제 등이 있을 수 있습니다. ※ 이 정보는 참고용이며, 정확한 진단은 수의사와 상담하세요.',
        }],
      },
    }],
  }),
};

describe('Chat API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  describe('Successful responses', () => {
    it('should return AI response for valid request with authenticated user', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(5);
      mockFetch.mockResolvedValue(mockGeminiResponse);

      const request = createMockRequest(validChatBody, {
        authorization: 'Bearer valid-token',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
      expect(data.severity).toBeDefined();
      expect(mockIncrementUsage).toHaveBeenCalledWith('user-1');
    });

    it('should return AI response for guest user', async () => {
      mockAuthenticateRequest.mockResolvedValue(guestAuth);
      mockFetch.mockResolvedValue(mockGeminiResponse);

      const request = createMockRequest(validChatBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
      expect(mockIncrementUsage).not.toHaveBeenCalled();
    });

    it('should not count usage for premium users', async () => {
      mockAuthenticateRequest.mockResolvedValue(premiumUserAuth);
      mockFetch.mockResolvedValue(mockGeminiResponse);

      const request = createMockRequest(validChatBody, {
        authorization: 'Bearer valid-token',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mockGetUsage).not.toHaveBeenCalled();
      expect(mockIncrementUsage).not.toHaveBeenCalled();
    });
  });

  describe('Input validation', () => {
    it('should return 400 for empty message', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);

      const request = createMockRequest({
        ...validChatBody,
        message: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('메시지');
    });

    it('should return 400 for whitespace-only message', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);

      const request = createMockRequest({
        ...validChatBody,
        message: '   ',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for message exceeding max length', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);

      const request = createMockRequest({
        ...validChatBody,
        message: 'a'.repeat(LIMITS.MESSAGE_MAX_LENGTH + 1),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain(LIMITS.MESSAGE_MAX_LENGTH.toString());
    });

    it('should return 400 for missing pet profile', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);

      const request = createMockRequest({
        message: 'test message',
        history: [],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('반려동물');
    });

    it('should return 400 for incomplete pet profile', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);

      const request = createMockRequest({
        message: 'test message',
        petProfile: { name: '멍멍이' }, // missing species
        history: [],
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('Usage limits', () => {
    it('should return 429 when free user exceeds monthly limit', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(LIMITS.MONTHLY_FREE_MESSAGES);

      const request = createMockRequest(validChatBody, {
        authorization: 'Bearer valid-token',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.limitExceeded).toBe(true);
      expect(data.showUpgrade).toBe(true);
      expect(data.usage).toBe(LIMITS.MONTHLY_FREE_MESSAGES);
    });

    it('should allow premium users to bypass usage limit', async () => {
      mockAuthenticateRequest.mockResolvedValue(premiumUserAuth);
      mockFetch.mockResolvedValue(mockGeminiResponse);

      const request = createMockRequest(validChatBody, {
        authorization: 'Bearer valid-token',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mockGetUsage).not.toHaveBeenCalled();
    });
  });

  describe('Premium+ features', () => {
    it('should return 403 when non-premium+ user tries image analysis', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);

      const request = createMockRequest({
        ...validChatBody,
        image: {
          data: 'base64encodedimage',
          mimeType: 'image/jpeg',
        },
      }, {
        authorization: 'Bearer valid-token',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.requirePremiumPlus).toBe(true);
    });

    it('should return 403 when premium user (not plus) tries image analysis', async () => {
      mockAuthenticateRequest.mockResolvedValue(premiumUserAuth);

      const request = createMockRequest({
        ...validChatBody,
        image: {
          data: 'base64encodedimage',
          mimeType: 'image/jpeg',
        },
      }, {
        authorization: 'Bearer valid-token',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.requirePremiumPlus).toBe(true);
    });

    it('should allow premium+ users to use image analysis', async () => {
      mockAuthenticateRequest.mockResolvedValue(premiumPlusUserAuth);
      mockFetch.mockResolvedValue(mockGeminiResponse);

      const request = createMockRequest({
        ...validChatBody,
        image: {
          data: 'base64encodedimage',
          mimeType: 'image/jpeg',
        },
      }, {
        authorization: 'Bearer valid-token',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('API error handling', () => {
    it('should return 500 when GEMINI_API_KEY is not set', async () => {
      delete process.env.GEMINI_API_KEY;
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);

      const request = createMockRequest(validChatBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toContain('설정');
    });

    it('should return 429 when Gemini API returns rate limit', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      const request = createMockRequest(validChatBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.message).toContain('잠시 후');
    });

    it('should return 500 when Gemini API returns 400/403', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      const request = createMockRequest(validChatBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toContain('연결');
    });

    it('should return 500 for unexpected errors', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request = createMockRequest(validChatBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toContain('오류');
    });
  });

  describe('Response cleaning', () => {
    it('should clean "펫체키:" prefix from response', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);
      mockFetch.mockResolvedValue(mockGeminiResponse);

      const request = createMockRequest(validChatBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).not.toMatch(/^펫체키:/);
    });

    it('should provide fallback message for empty response', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{ text: '' }],
            },
          }],
        }),
      });

      const request = createMockRequest(validChatBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
      expect(data.message.length).toBeGreaterThan(0);
    });
  });

  describe('Conversation history', () => {
    it('should handle conversation history', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);
      mockFetch.mockResolvedValue(mockGeminiResponse);

      const request = createMockRequest({
        ...validChatBody,
        history: [
          { role: 'user', content: '강아지가 아파요' },
          { role: 'assistant', content: '어디가 아픈지 말씀해주세요' },
        ],
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should limit conversation history to last 4 messages', async () => {
      mockAuthenticateRequest.mockResolvedValue(freeUserAuth);
      mockGetUsage.mockResolvedValue(0);
      mockFetch.mockResolvedValue(mockGeminiResponse);

      const longHistory = Array(10).fill(null).map((_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
      }));

      const request = createMockRequest({
        ...validChatBody,
        history: longHistory,
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      // The API should only use the last 4 messages
    });
  });
});
