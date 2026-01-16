import {
  checkRateLimit,
  resetRateLimitStore,
  resetRateLimitFor,
  getClientIdentifier,
  RATE_LIMITS,
} from '../rateLimit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const result = checkRateLimit('test-user', 5, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetIn).toBeLessThanOrEqual(60000);
    });

    it('should decrement remaining count on each request', () => {
      const identifier = 'test-user-2';

      const result1 = checkRateLimit(identifier, 5, 60000);
      expect(result1.remaining).toBe(4);

      const result2 = checkRateLimit(identifier, 5, 60000);
      expect(result2.remaining).toBe(3);

      const result3 = checkRateLimit(identifier, 5, 60000);
      expect(result3.remaining).toBe(2);
    });

    it('should block requests exceeding limit', () => {
      const identifier = 'test-user-3';
      const maxRequests = 3;

      // 3번 허용
      checkRateLimit(identifier, maxRequests, 60000);
      checkRateLimit(identifier, maxRequests, 60000);
      checkRateLimit(identifier, maxRequests, 60000);

      // 4번째 거부
      const result = checkRateLimit(identifier, maxRequests, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const identifier = 'test-user-4';
      const windowMs = 100; // 100ms for testing

      // 제한까지 사용
      checkRateLimit(identifier, 2, windowMs);
      checkRateLimit(identifier, 2, windowMs);

      // 제한 초과
      const blockedResult = checkRateLimit(identifier, 2, windowMs);
      expect(blockedResult.allowed).toBe(false);

      // 윈도우 만료 대기
      await new Promise((resolve) => setTimeout(resolve, 150));

      // 리셋 후 다시 허용
      const result = checkRateLimit(identifier, 2, windowMs);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should use default values when not specified', () => {
      const result = checkRateLimit('default-test');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9); // default maxRequests = 10
    });

    it('should track different identifiers separately', () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      // user1: 3번 요청
      checkRateLimit(user1, 5, 60000);
      checkRateLimit(user1, 5, 60000);
      const result1 = checkRateLimit(user1, 5, 60000);

      // user2: 1번 요청
      const result2 = checkRateLimit(user2, 5, 60000);

      expect(result1.remaining).toBe(2); // 5 - 3
      expect(result2.remaining).toBe(4); // 5 - 1
    });
  });

  describe('resetRateLimitFor', () => {
    it('should reset rate limit for specific identifier', () => {
      const identifier = 'reset-test';

      // 제한까지 사용
      checkRateLimit(identifier, 2, 60000);
      checkRateLimit(identifier, 2, 60000);

      // 제한 초과
      expect(checkRateLimit(identifier, 2, 60000).allowed).toBe(false);

      // 리셋
      resetRateLimitFor(identifier);

      // 다시 허용
      const result = checkRateLimit(identifier, 2, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('getClientIdentifier', () => {
    it('should use userId when provided', () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('192.168.1.1'),
        },
      };

      const result = getClientIdentifier(mockRequest, 'user-123');
      expect(result).toBe('user:user-123');
    });

    it('should use x-forwarded-for when no userId', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((name: string) => {
            if (name === 'x-forwarded-for') return '10.0.0.1, 192.168.1.1';
            return null;
          }),
        },
      };

      const result = getClientIdentifier(mockRequest);
      expect(result).toBe('ip:10.0.0.1');
    });

    it('should use x-real-ip as fallback', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((name: string) => {
            if (name === 'x-real-ip') return '172.16.0.1';
            return null;
          }),
        },
      };

      const result = getClientIdentifier(mockRequest);
      expect(result).toBe('ip:172.16.0.1');
    });

    it('should use anonymous when no IP available', () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      };

      const result = getClientIdentifier(mockRequest);
      expect(result).toBe('ip:anonymous');
    });
  });

  describe('RATE_LIMITS constants', () => {
    it('should have expected rate limit values', () => {
      expect(RATE_LIMITS.POSTS_PER_MINUTE).toBe(5);
      expect(RATE_LIMITS.COMMENTS_PER_MINUTE).toBe(10);
      expect(RATE_LIMITS.LIKES_PER_MINUTE).toBe(30);
      expect(RATE_LIMITS.READS_PER_MINUTE).toBe(60);
    });
  });
});
