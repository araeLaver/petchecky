/**
 * Form Hooks
 *
 * 폼 상태 관리 및 제출 처리를 위한 커스텀 훅
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { z } from "zod";
import {
  useForm as useReactHookForm,
  UseFormProps,
  FieldValues,
  UseFormReturn,
  Path,
  PathValue,
  DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ============================================
// 타입 정의
// ============================================

export type FormStatus = "idle" | "submitting" | "success" | "error";

export interface UseFormWithStatusOptions<T extends FieldValues>
  extends Omit<UseFormProps<T>, "resolver"> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
  successTimeout?: number;
}

export interface UseFormWithStatusReturn<T extends FieldValues> {
  form: UseFormReturn<T>;
  status: FormStatus;
  errorMessage: string | null;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: () => void;
  setFieldValue: <K extends Path<T>>(name: K, value: PathValue<T, K>) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

// ============================================
// useFormWithStatus 훅
// ============================================

/**
 * 폼 상태 관리가 포함된 React Hook Form 래퍼
 *
 * @example
 * ```tsx
 * const {
 *   form,
 *   status,
 *   handleSubmit,
 *   isSubmitting,
 * } = useFormWithStatus({
 *   schema: loginSchema,
 *   onSubmit: async (data) => {
 *     await login(data);
 *   },
 *   onSuccess: () => router.push('/dashboard'),
 * });
 * ```
 */
export function useFormWithStatus<T extends FieldValues>({
  schema,
  onSubmit,
  onSuccess,
  onError,
  resetOnSuccess = false,
  successTimeout = 3000,
  defaultValues,
  ...formOptions
}: UseFormWithStatusOptions<T>): UseFormWithStatusReturn<T> {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useReactHookForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    defaultValues: defaultValues as DefaultValues<T>,
    mode: "onBlur",
    reValidateMode: "onChange",
    ...formOptions,
  });

  // 성공 타임아웃 정리
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault();

      const isValid = await form.trigger();
      if (!isValid) return;

      setStatus("submitting");
      setErrorMessage(null);

      try {
        const data = form.getValues();
        await onSubmit(data);
        setStatus("success");
        onSuccess?.(data);

        if (resetOnSuccess) {
          form.reset();
        }

        // 일정 시간 후 idle로 복귀
        successTimeoutRef.current = setTimeout(() => {
          setStatus("idle");
        }, successTimeout);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setStatus("error");
        setErrorMessage(err.message);
        onError?.(err);
      }
    },
    [form, onSubmit, onSuccess, onError, resetOnSuccess, successTimeout]
  );

  const reset = useCallback(() => {
    form.reset();
    setStatus("idle");
    setErrorMessage(null);
  }, [form]);

  const setFieldValue = useCallback(
    <K extends Path<T>>(name: K, value: PathValue<T, K>) => {
      form.setValue(name, value, { shouldValidate: true, shouldDirty: true });
    },
    [form]
  );

  return {
    form,
    status,
    errorMessage,
    handleSubmit,
    reset,
    setFieldValue,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
    isError: status === "error",
    isIdle: status === "idle",
  };
}

// ============================================
// useMultiStepForm 훅
// ============================================

export interface UseMultiStepFormOptions<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  steps: {
    fields: Path<T>[];
    schema?: z.ZodSchema<Partial<T>>;
  }[];
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onStepChange?: (step: number, direction: "next" | "prev") => void;
}

export interface UseMultiStepFormReturn<T extends FieldValues> {
  form: UseFormReturn<T>;
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  goToStep: (step: number) => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  stepProgress: number;
  isSubmitting: boolean;
  canGoNext: boolean;
}

/**
 * 다단계 폼을 위한 훅
 *
 * @example
 * ```tsx
 * const {
 *   form,
 *   currentStep,
 *   nextStep,
 *   prevStep,
 *   isLastStep,
 * } = useMultiStepForm({
 *   schema: registrationSchema,
 *   steps: [
 *     { fields: ['email', 'password'] },
 *     { fields: ['name', 'phone'] },
 *     { fields: ['address', 'city'] },
 *   ],
 *   onSubmit: async (data) => {
 *     await register(data);
 *   },
 * });
 * ```
 */
export function useMultiStepForm<T extends FieldValues>({
  schema,
  steps,
  defaultValues,
  onSubmit,
  onStepChange,
}: UseMultiStepFormOptions<T>): UseMultiStepFormReturn<T> {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useReactHookForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    defaultValues: defaultValues as DefaultValues<T>,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const stepProgress = ((currentStep + 1) / totalSteps) * 100;

  // 현재 단계 필드들의 유효성 검사
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const currentFields = steps[currentStep].fields;
    const result = await form.trigger(currentFields);
    return result;
  }, [form, steps, currentStep]);

  // 다음 단계로 이동
  const nextStep = useCallback(async (): Promise<boolean> => {
    const isValid = await validateCurrentStep();
    if (!isValid) return false;

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
      onStepChange?.(currentStep + 1, "next");
    }
    return true;
  }, [validateCurrentStep, isLastStep, currentStep, onStepChange]);

  // 이전 단계로 이동
  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
      onStepChange?.(currentStep - 1, "prev");
    }
  }, [isFirstStep, currentStep, onStepChange]);

  // 특정 단계로 이동
  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  // 폼 제출
  const handleSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault();

      if (!isLastStep) {
        await nextStep();
        return;
      }

      const isValid = await form.trigger();
      if (!isValid) return;

      setIsSubmitting(true);
      try {
        const data = form.getValues();
        await onSubmit(data);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, isLastStep, nextStep, onSubmit]
  );

  // 다음 단계로 이동 가능 여부
  const currentFields = steps[currentStep]?.fields || [];
  const errors = form.formState.errors;
  const canGoNext = currentFields.every(
    (field) => !errors[field as keyof typeof errors]
  );

  return {
    form,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    stepProgress,
    isSubmitting,
    canGoNext,
  };
}

// ============================================
// useFieldArray 확장 훅
// ============================================

export interface UseFieldArrayWithValidationOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  minItems?: number;
  maxItems?: number;
  defaultItem: PathValue<T, Path<T>> extends (infer U)[] ? U : never;
}

/**
 * 유효성 검사가 포함된 동적 필드 배열 훅
 *
 * @example
 * ```tsx
 * const { fields, append, remove, canAdd, canRemove } = useFieldArrayWithValidation({
 *   form,
 *   name: 'pets',
 *   minItems: 1,
 *   maxItems: 5,
 *   defaultItem: { name: '', breed: '' },
 * });
 * ```
 */
export function useFieldArrayWithValidation<T extends FieldValues>({
  form,
  name,
  minItems = 0,
  maxItems = Infinity,
  defaultItem,
}: UseFieldArrayWithValidationOptions<T>) {
  const { watch, setValue, getValues } = form;

  const fields = watch(name) as unknown[];
  const fieldCount = fields?.length || 0;

  const canAdd = fieldCount < maxItems;
  const canRemove = fieldCount > minItems;

  const append = useCallback(() => {
    if (!canAdd) return;
    const currentValues = getValues(name) as unknown[];
    setValue(name, [...(currentValues || []), defaultItem] as PathValue<T, Path<T>>, {
      shouldValidate: true,
    });
  }, [canAdd, getValues, setValue, name, defaultItem]);

  const remove = useCallback(
    (index: number) => {
      if (!canRemove) return;
      const currentValues = getValues(name) as unknown[];
      setValue(
        name,
        currentValues.filter((_, i) => i !== index) as PathValue<T, Path<T>>,
        { shouldValidate: true }
      );
    },
    [canRemove, getValues, setValue, name]
  );

  const insert = useCallback(
    (index: number) => {
      if (!canAdd) return;
      const currentValues = getValues(name) as unknown[];
      const newValues = [...currentValues];
      newValues.splice(index, 0, defaultItem);
      setValue(name, newValues as PathValue<T, Path<T>>, { shouldValidate: true });
    },
    [canAdd, getValues, setValue, name, defaultItem]
  );

  const move = useCallback(
    (from: number, to: number) => {
      const currentValues = getValues(name) as unknown[];
      const newValues = [...currentValues];
      const [removed] = newValues.splice(from, 1);
      newValues.splice(to, 0, removed);
      setValue(name, newValues as PathValue<T, Path<T>>, { shouldValidate: true });
    },
    [getValues, setValue, name]
  );

  const swap = useCallback(
    (indexA: number, indexB: number) => {
      const currentValues = getValues(name) as unknown[];
      const newValues = [...currentValues];
      [newValues[indexA], newValues[indexB]] = [newValues[indexB], newValues[indexA]];
      setValue(name, newValues as PathValue<T, Path<T>>, { shouldValidate: true });
    },
    [getValues, setValue, name]
  );

  return {
    fields: fields || [],
    fieldCount,
    append,
    remove,
    insert,
    move,
    swap,
    canAdd,
    canRemove,
  };
}

// ============================================
// useAutoSave 훅
// ============================================

export interface UseAutoSaveOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSave: (data: T) => Promise<void> | void;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * 폼 자동 저장 훅
 *
 * @example
 * ```tsx
 * const { isSaving, lastSaved } = useAutoSave({
 *   form,
 *   onSave: async (data) => {
 *     await saveDraft(data);
 *   },
 *   debounceMs: 1000,
 * });
 * ```
 */
export function useAutoSave<T extends FieldValues>({
  form,
  onSave,
  debounceMs = 1000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { watch, formState } = form;

  useEffect(() => {
    if (!enabled) return;

    const subscription = watch((data) => {
      if (!formState.isDirty) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await onSave(data as T);
          setLastSaved(new Date());
        } finally {
          setIsSaving(false);
        }
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watch, formState.isDirty, onSave, debounceMs, enabled]);

  return { isSaving, lastSaved };
}

// ============================================
// useFormPersist 훅
// ============================================

export interface UseFormPersistOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  storageKey: string;
  exclude?: Path<T>[];
  storage?: Storage;
}

/**
 * 폼 데이터 로컬 스토리지 저장 훅
 *
 * @example
 * ```tsx
 * useFormPersist({
 *   form,
 *   storageKey: 'registration-form',
 *   exclude: ['password', 'confirmPassword'],
 * });
 * ```
 */
export function useFormPersist<T extends FieldValues>({
  form,
  storageKey,
  exclude = [],
  storage = typeof window !== "undefined" ? localStorage : undefined,
}: UseFormPersistOptions<T>) {
  const { watch, reset, getValues } = form;

  // 초기 로드 시 저장된 데이터 복원
  useEffect(() => {
    if (!storage) return;

    try {
      const savedData = storage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        reset({ ...getValues(), ...parsed }, { keepDefaultValues: true });
      }
    } catch {
      // 파싱 실패 시 무시
    }
  }, [storage, storageKey, reset, getValues]);

  // 데이터 변경 시 저장
  useEffect(() => {
    if (!storage) return;

    const subscription = watch((data) => {
      const dataToSave = { ...data };

      // 제외 필드 삭제
      exclude.forEach((field) => {
        delete dataToSave[field as keyof typeof dataToSave];
      });

      try {
        storage.setItem(storageKey, JSON.stringify(dataToSave));
      } catch {
        // 저장 실패 시 무시
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, storage, storageKey, exclude]);

  // 저장된 데이터 삭제
  const clear = useCallback(() => {
    storage?.removeItem(storageKey);
  }, [storage, storageKey]);

  return { clear };
}
