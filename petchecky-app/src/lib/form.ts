/**
 * Form Utilities
 *
 * React Hook Form과 Zod를 통합한 폼 유틸리티
 */

import { z, ZodError } from "zod";
import {
  useForm as useReactHookForm,
  UseFormProps,
  FieldValues,
  UseFormReturn,
  Path,
  FieldError,
  DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ============================================
// 타입 정의
// ============================================

export type FormStatus = "idle" | "submitting" | "success" | "error";

export interface FormState<T extends FieldValues> {
  form: UseFormReturn<T>;
  status: FormStatus;
  errorMessage: string | null;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseZodFormOptions<T extends FieldValues>
  extends Omit<UseFormProps<T>, "resolver"> {
  schema: z.ZodSchema<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// ============================================
// useZodForm 훅
// ============================================

/**
 * Zod 스키마와 통합된 React Hook Form 훅
 *
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * const { form, handleSubmit, status } = useZodForm({
 *   schema,
 *   onSubmit: async (data) => {
 *     await login(data);
 *   },
 * });
 * ```
 */
export function useZodForm<T extends FieldValues>({
  schema,
  onSubmit,
  onSuccess,
  onError,
  defaultValues,
  ...formOptions
}: UseZodFormOptions<T>) {
  const form = useReactHookForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    defaultValues: defaultValues as DefaultValues<T>,
    mode: "onBlur",
    reValidateMode: "onChange",
    ...formOptions,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit?.(data);
      onSuccess?.(data);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  });

  return {
    form,
    handleSubmit,
    register: form.register,
    control: form.control,
    formState: form.formState,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
    reset: form.reset,
    trigger: form.trigger,
    clearErrors: form.clearErrors,
    setError: form.setError,
  };
}

// ============================================
// 에러 메시지 유틸리티
// ============================================

/**
 * Zod 에러를 사용자 친화적인 메시지로 변환
 */
export function formatZodError(error: ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    formattedErrors[path] = issue.message;
  });

  return formattedErrors;
}

/**
 * 필드 에러 메시지 가져오기
 */
export function getFieldError(
  error: FieldError | undefined
): string | undefined {
  if (!error) return undefined;
  return error.message;
}

/**
 * 한국어 에러 메시지 매핑
 */
export const koreanErrorMessages = {
  required: "필수 입력 항목입니다",
  email: "올바른 이메일 주소를 입력해주세요",
  min: (min: number) => `최소 ${min}자 이상 입력해주세요`,
  max: (max: number) => `최대 ${max}자까지 입력 가능합니다`,
  minValue: (min: number) => `${min} 이상의 값을 입력해주세요`,
  maxValue: (max: number) => `${max} 이하의 값을 입력해주세요`,
  pattern: "올바른 형식으로 입력해주세요",
  url: "올바른 URL을 입력해주세요",
  phone: "올바른 전화번호를 입력해주세요",
  date: "올바른 날짜를 입력해주세요",
  password: "비밀번호는 8자 이상이어야 합니다",
  passwordMatch: "비밀번호가 일치하지 않습니다",
  number: "숫자만 입력해주세요",
  integer: "정수만 입력해주세요",
  positive: "양수만 입력해주세요",
};

// ============================================
// 공통 Zod 스키마
// ============================================

/**
 * 이메일 스키마
 */
export const emailSchema = z
  .string()
  .min(1, koreanErrorMessages.required)
  .email(koreanErrorMessages.email);

/**
 * 비밀번호 스키마
 */
export const passwordSchema = z
  .string()
  .min(1, koreanErrorMessages.required)
  .min(8, koreanErrorMessages.password);

/**
 * 비밀번호 확인 스키마
 */
export function createPasswordConfirmSchema(passwordField: string = "password") {
  return z.string().min(1, koreanErrorMessages.required);
}

/**
 * 전화번호 스키마
 */
export const phoneSchema = z
  .string()
  .min(1, koreanErrorMessages.required)
  .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, koreanErrorMessages.phone);

/**
 * URL 스키마
 */
export const urlSchema = z
  .string()
  .url(koreanErrorMessages.url)
  .or(z.literal(""));

/**
 * 필수 문자열 스키마
 */
export const requiredStringSchema = z
  .string()
  .min(1, koreanErrorMessages.required);

/**
 * 양수 스키마
 */
export const positiveNumberSchema = z
  .number()
  .positive(koreanErrorMessages.positive);

/**
 * 날짜 스키마
 */
export const dateSchema = z.coerce.date({
  error: koreanErrorMessages.date,
});

// ============================================
// 폼 상태 유틸리티
// ============================================

/**
 * 폼 필드 상태 계산
 */
export function getFieldState<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: Path<T>
) {
  const { touchedFields, dirtyFields, errors } = form.formState;
  const isTouched = touchedFields[name as keyof typeof touchedFields];
  const isDirty = dirtyFields[name as keyof typeof dirtyFields];
  const error = errors[name as keyof typeof errors] as FieldError | undefined;

  return {
    isTouched: Boolean(isTouched),
    isDirty: Boolean(isDirty),
    error,
    hasError: Boolean(error),
    errorMessage: error?.message,
  };
}

/**
 * 전체 폼 유효성 상태
 */
export function getFormState<T extends FieldValues>(form: UseFormReturn<T>) {
  const { isValid, isDirty, isSubmitting, isSubmitted, isSubmitSuccessful, errors } =
    form.formState;

  return {
    isValid,
    isDirty,
    isSubmitting,
    isSubmitted,
    isSubmitSuccessful,
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length,
  };
}

// ============================================
// 폼 초기화 유틸리티
// ============================================

/**
 * 폼 데이터를 FormData로 변환
 */
export function toFormData<T extends Record<string, unknown>>(data: T): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof FileList) {
      Array.from(value).forEach((file) => {
        formData.append(key, file);
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object") {
          formData.append(`${key}[${index}]`, JSON.stringify(item));
        } else {
          formData.append(`${key}[${index}]`, String(item));
        }
      });
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}

/**
 * FormData를 객체로 변환
 */
export function fromFormData<T extends Record<string, unknown>>(
  formData: FormData
): Partial<T> {
  const result: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    // 배열 처리 (예: items[0], items[1])
    const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      if (!result[arrayKey]) {
        result[arrayKey] = [];
      }
      (result[arrayKey] as unknown[])[parseInt(index, 10)] = value;
    } else {
      result[key] = value;
    }
  });

  return result as Partial<T>;
}

// ============================================
// 디바운스 유틸리티
// ============================================

/**
 * 디바운스된 유효성 검사
 */
export function createDebouncedValidator<T>(
  validate: (value: T) => Promise<boolean>,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (value: T): Promise<boolean> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        const result = await validate(value);
        resolve(result);
      }, delay);
    });
  };
}

// ============================================
// 파일 유효성 검사
// ============================================

export interface FileValidationOptions {
  maxSize?: number; // bytes
  allowedTypes?: string[];
  maxFiles?: number;
}

/**
 * 파일 유효성 검사 스키마 생성
 */
export function createFileSchema(options: FileValidationOptions = {}) {
  const { maxSize = 5 * 1024 * 1024, allowedTypes, maxFiles = 1 } = options;

  return z.custom<FileList | File | null>((value) => {
    if (!value) return true;

    const files = value instanceof FileList ? Array.from(value) : [value];

    if (files.length > maxFiles) {
      return false;
    }

    for (const file of files) {
      if (!(file instanceof File)) continue;

      if (file.size > maxSize) {
        return false;
      }

      if (allowedTypes && !allowedTypes.includes(file.type)) {
        return false;
      }
    }

    return true;
  });
}

// ============================================
// 조건부 필드 유틸리티
// ============================================

/**
 * 조건부 필수 필드 스키마
 */
export function conditionalRequired<T extends z.ZodTypeAny>(
  schema: T,
  condition: boolean
): T | z.ZodOptional<T> {
  return condition ? schema : schema.optional();
}

/**
 * 값에 따른 조건부 스키마
 */
export function createConditionalSchema<T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  conditionalFields: {
    when: string;
    is: unknown;
    then: Partial<T>;
  }[]
) {
  return baseSchema.superRefine((data, ctx) => {
    conditionalFields.forEach(({ when, is, then }) => {
      const fieldValue = (data as Record<string, unknown>)[when];
      if (fieldValue === is) {
        Object.entries(then).forEach(([key, schema]) => {
          const value = (data as Record<string, unknown>)[key];
          const result = (schema as z.ZodTypeAny).safeParse(value);
          if (!result.success) {
            result.error.issues.forEach((issue) => {
              ctx.addIssue({
                ...issue,
                path: [key, ...issue.path],
              });
            });
          }
        });
      }
    });
  });
}
