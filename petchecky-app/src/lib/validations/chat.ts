// 채팅 API 입력 검증 스키마 (Zod)

import { z } from "zod";
import { LIMITS, FILE_LIMITS } from "@/lib/constants";

// 펫 프로필 스키마
export const PetProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, "펫 이름을 입력해주세요")
    .max(LIMITS.PET_NAME_MAX_LENGTH, `이름은 ${LIMITS.PET_NAME_MAX_LENGTH}자 이내로 입력해주세요`),
  species: z.enum(["dog", "cat"], {
    message: "종류는 dog 또는 cat만 가능합니다",
  }),
  breed: z.string()
    .min(1, "품종을 입력해주세요")
    .max(LIMITS.PET_NAME_MAX_LENGTH, `품종은 ${LIMITS.PET_NAME_MAX_LENGTH}자 이내로 입력해주세요`),
  age: z.number()
    .min(0, "나이는 0 이상이어야 합니다")
    .max(100, "나이는 100 이하여야 합니다"),
  weight: z.number()
    .min(0, "체중은 0 이상이어야 합니다")
    .max(200, "체중은 200kg 이하여야 합니다"),
});

// 채팅 메시지 스키마
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(LIMITS.MESSAGE_MAX_LENGTH),
  severity: z.enum(["low", "medium", "high"]).optional(),
});

// 이미지 데이터 스키마
export const ImageDataSchema = z.object({
  data: z.string()
    .min(1, "이미지 데이터가 비어있습니다")
    .refine(
      (data) => {
        // Base64 형식 검증 (대략적인 크기 체크)
        const estimatedSize = (data.length * 3) / 4;
        return estimatedSize <= FILE_LIMITS.MAX_IMAGE_SIZE;
      },
      { message: `이미지 크기는 ${FILE_LIMITS.MAX_IMAGE_SIZE / 1024 / 1024}MB 이하여야 합니다` }
    ),
  mimeType: z.string()
    .refine(
      (type) => FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(type as typeof FILE_LIMITS.ALLOWED_IMAGE_TYPES[number]),
      { message: "지원하지 않는 이미지 형식입니다 (JPEG, PNG, GIF, WebP만 가능)" }
    ),
});

// 채팅 API 요청 스키마
export const ChatRequestSchema = z.object({
  message: z.string()
    .min(1, "메시지를 입력해주세요")
    .max(LIMITS.MESSAGE_MAX_LENGTH, `메시지는 ${LIMITS.MESSAGE_MAX_LENGTH}자 이내로 입력해주세요`),
  petProfile: PetProfileSchema,
  history: z.array(ChatMessageSchema)
    .max(LIMITS.MESSAGE_HISTORY_COUNT, `히스토리는 최대 ${LIMITS.MESSAGE_HISTORY_COUNT}개까지 가능합니다`)
    .default([]),
  image: ImageDataSchema.optional(),
});

// 타입 추론
export type ChatRequestInput = z.infer<typeof ChatRequestSchema>;
export type PetProfileInput = z.infer<typeof PetProfileSchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
export type ImageDataInput = z.infer<typeof ImageDataSchema>;

// 검증 결과 타입
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// 검증 함수
export function validateChatRequest(data: unknown): ValidationResult<ChatRequestInput> {
  const result = ChatRequestSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors: Record<string, string[]> = {};
  const issues = result.error.issues || [];

  for (const issue of issues) {
    const path = issue.path.join(".");
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  // 첫 번째 에러 메시지를 기본 에러로 사용
  const firstError = issues[0]?.message || "입력값이 올바르지 않습니다";

  return {
    success: false,
    error: firstError,
    fieldErrors,
  };
}
