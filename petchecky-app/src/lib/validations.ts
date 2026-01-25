import { z } from "zod";

// ============================================
// 보안 관련 상수
// ============================================

export const SECURITY_LIMITS = {
  // 파일 업로드 제한
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB for images
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf"],

  // 텍스트 입력 제한
  MAX_TEXT_LENGTH: 10000,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 5000,

  // API 제한
  MAX_ARRAY_LENGTH: 100,
  MAX_TAGS: 10,
} as const;

// ============================================
// 보안 유틸리티 함수
// ============================================

/**
 * HTML 태그 제거 (XSS 방지)
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * 위험한 문자 이스케이프
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * SQL Injection 패턴 감지
 */
export function hasSqlInjection(input: string): boolean {
  const patterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/i,
    /(\%3D)|(=)[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  ];
  return patterns.some((pattern) => pattern.test(input));
}

/**
 * 안전한 문자열 검증 스키마
 */
export const safeStringSchema = (maxLength: number = SECURITY_LIMITS.MAX_TEXT_LENGTH) =>
  z
    .string()
    .max(maxLength)
    .refine((val) => !hasSqlInjection(val), {
      message: "유효하지 않은 문자가 포함되어 있습니다",
    })
    .transform(stripHtmlTags);

// ============================================
// 파일 업로드 스키마
// ============================================

/**
 * 이미지 파일 검증 스키마
 */
export const imageFileSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(SECURITY_LIMITS.MAX_IMAGE_SIZE, "이미지는 10MB 이하여야 합니다"),
  type: z.enum(SECURITY_LIMITS.ALLOWED_IMAGE_TYPES as unknown as [string, ...string[]], {
    message: "지원하지 않는 이미지 형식입니다 (JPG, PNG, GIF, WebP만 가능)",
  }),
});

/**
 * Base64 이미지 검증 스키마
 */
export const base64ImageSchema = z
  .string()
  .refine(
    (val) => {
      // data:image 형식 또는 순수 base64 검증
      if (val.startsWith("data:image/")) {
        const base64Part = val.split(",")[1];
        if (!base64Part) return false;
        // Base64 크기 대략 계산 (실제 크기의 약 4/3)
        const sizeInBytes = (base64Part.length * 3) / 4;
        return sizeInBytes <= SECURITY_LIMITS.MAX_IMAGE_SIZE;
      }
      return false;
    },
    { message: "유효하지 않은 이미지 형식이거나 크기가 너무 큽니다" }
  );

/**
 * 문서 파일 검증 스키마
 */
export const documentFileSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(SECURITY_LIMITS.MAX_FILE_SIZE, "파일은 5MB 이하여야 합니다"),
  type: z.enum(SECURITY_LIMITS.ALLOWED_DOCUMENT_TYPES as unknown as [string, ...string[]], {
    message: "지원하지 않는 파일 형식입니다 (PDF만 가능)",
  }),
});

// ============================================
// API 요청 스키마
// ============================================

/**
 * 페이지네이션 스키마
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * 정렬 스키마
 */
export const sortSchema = z.object({
  sortBy: z.string().max(50).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type SortInput = z.infer<typeof sortSchema>;

/**
 * 검색 스키마
 */
export const searchSchema = z.object({
  query: safeStringSchema(200).optional(),
  filters: z.record(z.string(), z.string()).optional(),
});

export type SearchInput = z.infer<typeof searchSchema>;

// ============================================
// 기존 스키마 (보안 강화)
// ============================================

/**
 * 펫 프로필 스키마
 */
export const petProfileSchema = z.object({
  name: z.string()
    .min(1, "이름을 입력해주세요")
    .max(20, "이름은 20자 이하로 입력해주세요"),
  species: z.enum(["dog", "cat"], { message: "종류를 선택해주세요" }),
  breed: z.string()
    .min(1, "품종을 입력해주세요")
    .max(50, "품종은 50자 이하로 입력해주세요"),
  age: z.number()
    .min(0, "나이는 0 이상이어야 합니다")
    .max(30, "나이는 30 이하로 입력해주세요"),
  weight: z.number()
    .min(0, "체중은 0 이상이어야 합니다")
    .max(100, "체중은 100kg 이하로 입력해주세요")
    .optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  neutered: z.boolean().optional(),
  birthDate: z.string().optional(),
  profileImage: z.string().optional(),
});

export type PetProfileInput = z.infer<typeof petProfileSchema>;

/**
 * 커뮤니티 게시글 스키마
 */
export const communityPostSchema = z.object({
  title: z.string()
    .min(2, "제목은 2자 이상 입력해주세요")
    .max(100, "제목은 100자 이하로 입력해주세요"),
  content: z.string()
    .min(10, "내용은 10자 이상 입력해주세요")
    .max(5000, "내용은 5000자 이하로 입력해주세요"),
  category: z.enum(["question", "share", "concern", "tip"], { message: "카테고리를 선택해주세요" }),
  petType: z.enum(["dog", "cat", "all"]).optional(),
  tags: z.array(z.string().max(20)).max(5, "태그는 최대 5개까지 가능합니다").optional(),
});

export type CommunityPostInput = z.infer<typeof communityPostSchema>;

/**
 * 댓글 스키마
 */
export const commentSchema = z.object({
  content: z.string()
    .min(1, "댓글을 입력해주세요")
    .max(1000, "댓글은 1000자 이하로 입력해주세요"),
});

export type CommentInput = z.infer<typeof commentSchema>;

/**
 * 알레르기 스키마
 */
export const allergySchema = z.object({
  name: z.string()
    .min(1, "알레르겐을 입력해주세요")
    .max(50, "알레르겐은 50자 이하로 입력해주세요"),
  type: z.enum(["food", "environmental", "medication", "contact"], { message: "알레르기 유형을 선택해주세요" }),
  severity: z.enum(["mild", "moderate", "severe"]),
  symptoms: z.array(z.string()).optional(),
  diagnosedDate: z.string().optional(),
  notes: z.string().max(500, "메모는 500자 이하로 입력해주세요").optional(),
});

export type AllergyInput = z.infer<typeof allergySchema>;

/**
 * 진료 기록 스키마
 */
export const vetRecordSchema = z.object({
  date: z.string().min(1, "진료 날짜를 선택해주세요"),
  hospital: z.string()
    .min(1, "병원명을 입력해주세요")
    .max(100, "병원명은 100자 이하로 입력해주세요"),
  diagnosis: z.string().max(500, "진단명은 500자 이하로 입력해주세요").optional(),
  treatment: z.string().max(1000, "치료 내용은 1000자 이하로 입력해주세요").optional(),
  cost: z.number().min(0, "비용은 0 이상이어야 합니다").optional(),
  nextVisit: z.string().optional(),
  notes: z.string().max(1000, "메모는 1000자 이하로 입력해주세요").optional(),
});

export type VetRecordInput = z.infer<typeof vetRecordSchema>;

/**
 * 약물 기록 스키마
 */
export const medicationSchema = z.object({
  name: z.string()
    .min(1, "약물명을 입력해주세요")
    .max(100, "약물명은 100자 이하로 입력해주세요"),
  dosage: z.string()
    .min(1, "용량을 입력해주세요")
    .max(50, "용량은 50자 이하로 입력해주세요"),
  frequency: z.string()
    .min(1, "투여 빈도를 입력해주세요")
    .max(50, "투여 빈도는 50자 이하로 입력해주세요"),
  startDate: z.string().min(1, "시작일을 선택해주세요"),
  endDate: z.string().optional(),
  prescribedBy: z.string().max(100, "처방 수의사는 100자 이하로 입력해주세요").optional(),
  notes: z.string().max(500, "메모는 500자 이하로 입력해주세요").optional(),
});

export type MedicationInput = z.infer<typeof medicationSchema>;

/**
 * 예약 스키마
 */
export const reservationSchema = z.object({
  hospitalId: z.string().min(1, "병원을 선택해주세요"),
  date: z.string().min(1, "예약 날짜를 선택해주세요"),
  time: z.string().min(1, "예약 시간을 선택해주세요"),
  petId: z.string().min(1, "펫을 선택해주세요"),
  reason: z.string()
    .min(5, "예약 사유를 5자 이상 입력해주세요")
    .max(500, "예약 사유는 500자 이하로 입력해주세요"),
  contact: z.string()
    .regex(/^[0-9]{10,11}$/, "올바른 전화번호 형식을 입력해주세요")
    .optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

/**
 * 유효성 검사 헬퍼 함수
 */
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });

  return { success: false, errors };
}

/**
 * 단일 필드 유효성 검사
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  field: keyof T & string,
  value: unknown
): string | null {
  try {
    const partialSchema = z.object({ [field]: (schema as z.ZodObject<z.ZodRawShape>).shape[field] });
    partialSchema.parse({ [field]: value });
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || "유효하지 않은 값입니다";
    }
    return "유효성 검사 오류";
  }
}
