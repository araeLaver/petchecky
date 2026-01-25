/**
 * Reservation API Route Tests
 *
 * Tests for the reservation API endpoint:
 * - POST: Create new reservation
 * - GET: Fetch user's reservations with pagination
 * - Input validation
 * - Authentication
 * - Error handling
 */

import { NextRequest } from "next/server";
import { POST, GET } from "../route";

// Mock dependencies
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

jest.mock("@/lib/auth", () => ({
  authenticateRequest: jest.fn(),
  sanitizeUserInput: jest.fn((input: string) => input),
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
    })),
  },
}));

jest.mock("@/lib/errors", () => ({
  ApiErrors: {
    invalidInput: jest.fn((lang, msg) => ({
      status: 400,
      json: () => Promise.resolve({ message: msg }),
    })),
    unauthorized: jest.fn(() => ({
      status: 401,
      json: () => Promise.resolve({ message: "인증이 필요합니다" }),
    })),
    serverError: jest.fn(() => ({
      status: 500,
      json: () => Promise.resolve({ message: "서버 오류가 발생했습니다" }),
    })),
  },
  getErrorMessage: jest.fn((e) => e?.message || "Unknown error"),
}));

import { authenticateRequest, supabaseAdmin } from "@/lib/auth";

const mockAuthenticateRequest = authenticateRequest as jest.MockedFunction<
  typeof authenticateRequest
>;

// Helper to create mock NextRequest
function createMockRequest(
  body: object | null,
  headers: Record<string, string> = {},
  url = "http://localhost/api/reservation"
): NextRequest {
  return {
    url,
    method: body ? "POST" : "GET",
    headers: {
      get: (key: string) => headers[key.toLowerCase()] || null,
    },
    json: async () => body,
  } as unknown as NextRequest;
}

// Sample data
const validReservationBody = {
  hospitalId: "hospital-1",
  hospitalName: "행복 동물병원",
  hospitalAddress: "서울시 강남구 테헤란로 123",
  hospitalPhone: "02-1234-5678",
  petName: "멍멍이",
  petSpecies: "dog" as const,
  symptoms: "밥을 잘 안 먹어요",
  preferredDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // 내일
  preferredTime: "14:00",
  contactPhone: "010-1234-5678",
  notes: "오후가 좋아요",
};

const authenticatedUser = {
  user: { id: "user-1", email: "test@example.com" },
  subscription: { isPremium: false, isPremiumPlus: false },
  error: null,
};

const guestUser = {
  user: null,
  subscription: { isPremium: false, isPremiumPlus: false },
  error: null,
};

describe("Reservation API - POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock chain
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({
      data: { id: "res-1", ...validReservationBody, status: "pending" },
      error: null,
    });
  });

  describe("Successful reservations", () => {
    it("should create reservation for authenticated user", async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest(validReservationBody, {
        authorization: "Bearer valid-token",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("예약 요청이 접수");
      expect(data.reservation).toBeDefined();
    });

    it("should create reservation for guest user", async () => {
      mockAuthenticateRequest.mockResolvedValue(guestUser);

      const request = createMockRequest(validReservationBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Input validation", () => {
    beforeEach(() => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);
    });

    it("should return 400 for missing hospital ID", async () => {
      const body = { ...validReservationBody, hospitalId: "" };
      const request = createMockRequest(body);

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should return 400 for missing pet name", async () => {
      const body = { ...validReservationBody, petName: "" };
      const request = createMockRequest(body);

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should return 400 for missing preferred date", async () => {
      const body = { ...validReservationBody, preferredDate: "" };
      const request = createMockRequest(body);

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should return 400 for missing preferred time", async () => {
      const body = { ...validReservationBody, preferredTime: "" };
      const request = createMockRequest(body);

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should return 400 for missing contact phone", async () => {
      const body = { ...validReservationBody, contactPhone: "" };
      const request = createMockRequest(body);

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid phone format", async () => {
      const body = { ...validReservationBody, contactPhone: "invalid" };
      const request = createMockRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("연락처");
    });

    it("should return 400 for past date", async () => {
      const pastDate = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];
      const body = { ...validReservationBody, preferredDate: pastDate };
      const request = createMockRequest(body);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("오늘 이후");
    });
  });

  describe("Error handling", () => {
    it("should handle table not found gracefully", async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: "42P01", message: "Table not found" },
      });

      const request = createMockRequest(validReservationBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should return 500 for database errors", async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: "SOME_ERROR", message: "Database error" },
      });

      const request = createMockRequest(validReservationBody);
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});

describe("Reservation API - GET", () => {
  const mockReservations = [
    { id: "res-1", status: "pending", created_at: "2024-01-15" },
    { id: "res-2", status: "confirmed", created_at: "2024-01-10" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock chain for GET - query object that supports chaining
    const createQueryMock = () => {
      const queryMock: Record<string, jest.Mock> = {};

      queryMock.eq = jest.fn().mockReturnThis();
      queryMock.order = jest.fn().mockReturnThis();
      queryMock.limit = jest.fn().mockReturnThis();
      queryMock.range = jest.fn().mockReturnThis();

      // Make all methods return the same object for chaining
      Object.keys(queryMock).forEach(key => {
        queryMock[key].mockReturnValue(queryMock);
      });

      // Final resolution - use Promise.resolve with the queryMock having then
      queryMock.then = (resolve: (value: unknown) => unknown) => Promise.resolve({
        data: mockReservations,
        error: null,
        count: 2,
      }).then(resolve);

      return queryMock;
    };

    const fromMock = supabaseAdmin.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnValue(createQueryMock()),
      insert: mockInsert,
    });
  });

  describe("Authentication", () => {
    it("should return 401 for unauthenticated requests", async () => {
      mockAuthenticateRequest.mockResolvedValue({
        user: null,
        error: "No token",
        subscription: { isPremium: false, isPremiumPlus: false },
      });

      const request = createMockRequest(null);
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("should return reservations for authenticated user", async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest(null, {
        authorization: "Bearer valid-token",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reservations).toBeDefined();
      expect(data.total).toBeDefined();
    });
  });

  describe("Pagination", () => {
    it("should use default pagination values", async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest(
        null,
        { authorization: "Bearer valid-token" },
        "http://localhost/api/reservation"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.limit).toBe(20);
      expect(data.offset).toBe(0);
    });

    it("should respect custom limit", async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest(
        null,
        { authorization: "Bearer valid-token" },
        "http://localhost/api/reservation?limit=10"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.limit).toBe(10);
    });

    it("should cap limit at 50", async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest(
        null,
        { authorization: "Bearer valid-token" },
        "http://localhost/api/reservation?limit=100"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.limit).toBe(50);
    });

    it("should handle offset parameter", async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      const request = createMockRequest(
        null,
        { authorization: "Bearer valid-token" },
        "http://localhost/api/reservation?offset=10"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.offset).toBe(10);
    });
  });

  describe("Error handling", () => {
    it("should return empty array for table not found", async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      // Create error query mock
      const createErrorQueryMock = () => {
        const queryMock: Record<string, jest.Mock> = {};
        queryMock.eq = jest.fn().mockReturnThis();
        queryMock.order = jest.fn().mockReturnThis();
        queryMock.limit = jest.fn().mockReturnThis();
        queryMock.range = jest.fn().mockReturnThis();
        Object.keys(queryMock).forEach(key => {
          queryMock[key].mockReturnValue(queryMock);
        });
        queryMock.then = (resolve: (value: unknown) => unknown) => Promise.resolve({
          data: null,
          error: { code: "42P01", message: "Table not found" },
          count: 0,
        }).then(resolve);
        return queryMock;
      };

      const fromMock = supabaseAdmin.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnValue(createErrorQueryMock()),
      });

      const request = createMockRequest(null, {
        authorization: "Bearer valid-token",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reservations).toEqual([]);
      expect(data.total).toBe(0);
    });

    it("should return 500 for database errors", async () => {
      mockAuthenticateRequest.mockResolvedValue(authenticatedUser);

      // Create error query mock for database error
      const createDbErrorQueryMock = () => {
        const queryMock: Record<string, jest.Mock> = {};
        queryMock.eq = jest.fn().mockReturnThis();
        queryMock.order = jest.fn().mockReturnThis();
        queryMock.limit = jest.fn().mockReturnThis();
        queryMock.range = jest.fn().mockReturnThis();
        Object.keys(queryMock).forEach(key => {
          queryMock[key].mockReturnValue(queryMock);
        });
        queryMock.then = (resolve: (value: unknown) => unknown, reject: (e: Error) => unknown) =>
          Promise.resolve({
            data: null,
            error: { code: "SOME_ERROR", message: "Database error" },
            count: 0,
          }).then(resolve);
        return queryMock;
      };

      const fromMock = supabaseAdmin.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnValue(createDbErrorQueryMock()),
      });

      const request = createMockRequest(null, {
        authorization: "Bearer valid-token",
      });

      const response = await GET(request);
      expect(response.status).toBe(500);
    });
  });
});
