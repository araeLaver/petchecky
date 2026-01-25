import { http, HttpResponse, delay } from "msw";

// ============================================
// Mock Data
// ============================================

const mockPets = [
  {
    id: "pet-1",
    name: "멍멍이",
    type: "dog",
    breed: "골든 리트리버",
    birthDate: "2021-03-15",
    weight: 28.5,
    gender: "male",
    imageUrl: "/images/pets/dog1.jpg",
    createdAt: "2023-01-10T09:00:00Z",
  },
  {
    id: "pet-2",
    name: "나비",
    type: "cat",
    breed: "러시안 블루",
    birthDate: "2022-06-20",
    weight: 4.2,
    gender: "female",
    imageUrl: "/images/pets/cat1.jpg",
    createdAt: "2023-02-15T14:30:00Z",
  },
];

const mockHealthRecords = [
  {
    id: "health-1",
    petId: "pet-1",
    type: "vaccination",
    date: "2024-01-15",
    description: "광견병 예방접종",
    vetName: "행복동물병원",
    notes: "다음 접종 예정일: 2025-01-15",
  },
  {
    id: "health-2",
    petId: "pet-1",
    type: "checkup",
    date: "2024-02-01",
    description: "정기 건강검진",
    vetName: "행복동물병원",
    notes: "건강 양호",
  },
];

const mockWalkRecords = [
  {
    id: "walk-1",
    petId: "pet-1",
    date: "2024-01-20",
    duration: 45,
    distance: 2.5,
    startTime: "08:00",
    endTime: "08:45",
    route: "공원 산책로",
  },
  {
    id: "walk-2",
    petId: "pet-1",
    date: "2024-01-20",
    duration: 30,
    distance: 1.8,
    startTime: "18:00",
    endTime: "18:30",
    route: "동네 한 바퀴",
  },
];

const mockUser = {
  id: "user-1",
  email: "user@example.com",
  name: "홍길동",
  profileImage: "/images/profile.jpg",
  createdAt: "2023-01-01T00:00:00Z",
};

// ============================================
// API Handlers
// ============================================

export const handlers = [
  // ============================================
  // Auth Handlers
  // ============================================

  http.post("/api/auth/login", async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as { email: string; password: string };

    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUser,
          token: "mock-jwt-token",
        },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        },
      },
      { status: 401 }
    );
  }),

  http.post("/api/auth/logout", async () => {
    await delay(200);
    return HttpResponse.json({ success: true });
  }),

  http.get("/api/auth/me", async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: mockUser,
    });
  }),

  // ============================================
  // Pet Handlers
  // ============================================

  http.get("/api/pets", async () => {
    await delay(400);
    return HttpResponse.json({
      success: true,
      data: mockPets,
    });
  }),

  http.get("/api/pets/:petId", async ({ params }) => {
    await delay(300);

    const pet = mockPets.find((p) => p.id === params.petId);

    if (!pet) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "반려동물을 찾을 수 없습니다.",
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: pet,
    });
  }),

  http.post("/api/pets", async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as Record<string, unknown>;
    const newPet = {
      id: `pet-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        data: newPet,
      },
      { status: 201 }
    );
  }),

  http.put("/api/pets/:petId", async ({ params, request }) => {
    await delay(400);

    const body = (await request.json()) as Record<string, unknown>;
    const petIndex = mockPets.findIndex((p) => p.id === params.petId);

    if (petIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "반려동물을 찾을 수 없습니다.",
          },
        },
        { status: 404 }
      );
    }

    const updatedPet = { ...mockPets[petIndex], ...body };

    return HttpResponse.json({
      success: true,
      data: updatedPet,
    });
  }),

  http.delete("/api/pets/:petId", async ({ params }) => {
    await delay(300);

    const petIndex = mockPets.findIndex((p) => p.id === params.petId);

    if (petIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "반려동물을 찾을 수 없습니다.",
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: "삭제되었습니다.",
    });
  }),

  // ============================================
  // Health Record Handlers
  // ============================================

  http.get("/api/pets/:petId/health", async ({ params }) => {
    await delay(400);

    const records = mockHealthRecords.filter((r) => r.petId === params.petId);

    return HttpResponse.json({
      success: true,
      data: records,
    });
  }),

  http.post("/api/pets/:petId/health", async ({ params, request }) => {
    await delay(500);

    const body = (await request.json()) as Record<string, unknown>;
    const newRecord = {
      id: `health-${Date.now()}`,
      petId: params.petId,
      ...body,
    };

    return HttpResponse.json(
      {
        success: true,
        data: newRecord,
      },
      { status: 201 }
    );
  }),

  // ============================================
  // Walk Record Handlers
  // ============================================

  http.get("/api/pets/:petId/walks", async ({ params }) => {
    await delay(400);

    const records = mockWalkRecords.filter((r) => r.petId === params.petId);

    return HttpResponse.json({
      success: true,
      data: records,
    });
  }),

  http.post("/api/pets/:petId/walks", async ({ params, request }) => {
    await delay(500);

    const body = (await request.json()) as Record<string, unknown>;
    const newRecord = {
      id: `walk-${Date.now()}`,
      petId: params.petId,
      ...body,
    };

    return HttpResponse.json(
      {
        success: true,
        data: newRecord,
      },
      { status: 201 }
    );
  }),

  // ============================================
  // Statistics Handlers
  // ============================================

  http.get("/api/pets/:petId/stats", async () => {
    await delay(500);

    return HttpResponse.json({
      success: true,
      data: {
        totalWalks: 45,
        totalDistance: 112.5,
        averageDuration: 38,
        weeklyWalks: [
          { day: "월", count: 2 },
          { day: "화", count: 2 },
          { day: "수", count: 1 },
          { day: "목", count: 2 },
          { day: "금", count: 2 },
          { day: "토", count: 3 },
          { day: "일", count: 3 },
        ],
        weightHistory: [
          { date: "2024-01", weight: 27.5 },
          { date: "2024-02", weight: 28.0 },
          { date: "2024-03", weight: 28.5 },
        ],
      },
    });
  }),

  // ============================================
  // Error Simulation Handlers
  // ============================================

  http.get("/api/test/error", async () => {
    await delay(200);
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "테스트 에러입니다.",
        },
      },
      { status: 500 }
    );
  }),

  http.get("/api/test/timeout", async () => {
    await delay(30000); // 30초 딜레이로 타임아웃 시뮬레이션
    return HttpResponse.json({ success: true });
  }),
];
