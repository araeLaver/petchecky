/**
 * 테스트 데이터 팩토리
 *
 * 일관된 테스트 데이터 생성을 위한 팩토리 함수들
 */

// ============================================
// ID Generator
// ============================================

let idCounter = 0;

export function generateId(prefix: string = "id"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

// ============================================
// User Factory
// ============================================

export interface MockUser {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  phone?: string;
  createdAt: string;
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: generateId("user"),
    email: `user${idCounter}@example.com`,
    name: `테스트 사용자 ${idCounter}`,
    profileImage: undefined,
    phone: undefined,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================
// Pet Factory
// ============================================

export interface MockPet {
  id: string;
  name: string;
  type: "dog" | "cat" | "bird" | "fish" | "other";
  breed?: string;
  birthDate?: string;
  weight?: number;
  gender?: "male" | "female";
  imageUrl?: string;
  ownerId: string;
  createdAt: string;
}

export function createMockPet(overrides: Partial<MockPet> = {}): MockPet {
  return {
    id: generateId("pet"),
    name: `멍멍이 ${idCounter}`,
    type: "dog",
    breed: "골든 리트리버",
    birthDate: "2022-01-01",
    weight: 25,
    gender: "male",
    imageUrl: undefined,
    ownerId: generateId("user"),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockCat(overrides: Partial<MockPet> = {}): MockPet {
  return createMockPet({
    name: `나비 ${idCounter}`,
    type: "cat",
    breed: "러시안 블루",
    weight: 4,
    ...overrides,
  });
}

// ============================================
// Health Record Factory
// ============================================

export interface MockHealthRecord {
  id: string;
  petId: string;
  type: "vaccination" | "checkup" | "treatment" | "surgery";
  date: string;
  description: string;
  vetName?: string;
  notes?: string;
  createdAt: string;
}

export function createMockHealthRecord(
  overrides: Partial<MockHealthRecord> = {}
): MockHealthRecord {
  return {
    id: generateId("health"),
    petId: generateId("pet"),
    type: "vaccination",
    date: new Date().toISOString().split("T")[0],
    description: "정기 예방접종",
    vetName: "행복동물병원",
    notes: undefined,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================
// Walk Record Factory
// ============================================

export interface MockWalkRecord {
  id: string;
  petId: string;
  date: string;
  duration: number; // minutes
  distance: number; // km
  startTime: string;
  endTime: string;
  route?: string;
  notes?: string;
  createdAt: string;
}

export function createMockWalkRecord(
  overrides: Partial<MockWalkRecord> = {}
): MockWalkRecord {
  return {
    id: generateId("walk"),
    petId: generateId("pet"),
    date: new Date().toISOString().split("T")[0],
    duration: 30,
    distance: 2.5,
    startTime: "08:00",
    endTime: "08:30",
    route: "공원 산책로",
    notes: undefined,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================
// Community Post Factory
// ============================================

export interface MockPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: "general" | "question" | "tip" | "photo";
  images?: string[];
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  updatedAt?: string;
}

export function createMockPost(overrides: Partial<MockPost> = {}): MockPost {
  return {
    id: generateId("post"),
    authorId: generateId("user"),
    authorName: `작성자 ${idCounter}`,
    title: `테스트 게시글 ${idCounter}`,
    content: "테스트 게시글 내용입니다.",
    category: "general",
    images: undefined,
    likes: 0,
    comments: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: undefined,
    ...overrides,
  };
}

// ============================================
// Comment Factory
// ============================================

export interface MockComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  parentId?: string;
  likes: number;
  createdAt: string;
}

export function createMockComment(overrides: Partial<MockComment> = {}): MockComment {
  return {
    id: generateId("comment"),
    postId: generateId("post"),
    authorId: generateId("user"),
    authorName: `댓글 작성자 ${idCounter}`,
    content: "테스트 댓글 내용입니다.",
    parentId: undefined,
    likes: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================
// Notification Factory
// ============================================

export interface MockNotification {
  id: string;
  userId: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export function createMockNotification(
  overrides: Partial<MockNotification> = {}
): MockNotification {
  return {
    id: generateId("notification"),
    userId: generateId("user"),
    type: "info",
    title: "알림 제목",
    message: "알림 내용입니다.",
    read: false,
    link: undefined,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================
// API Response Factory
// ============================================

export interface MockApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export function createMockApiResponse<T>(
  data: T,
  overrides: Partial<MockApiResponse<T>> = {}
): MockApiResponse<T> {
  return {
    success: true,
    data,
    error: undefined,
    meta: undefined,
    ...overrides,
  };
}

export function createMockApiError(
  code: string,
  message: string
): MockApiResponse<never> {
  return {
    success: false,
    error: { code, message },
  };
}

// ============================================
// Batch Factory
// ============================================

/**
 * 여러 개의 mock 데이터 생성
 */
export function createMany<T>(
  factory: (overrides?: Partial<T>) => T,
  count: number,
  overrides?: Partial<T>
): T[] {
  return Array.from({ length: count }, () => factory(overrides));
}

// ============================================
// Date Utilities
// ============================================

export function createPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export function createFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}

export function createDateString(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split("T")[0];
}
