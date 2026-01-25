"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FieldError, UseFormReturn, FieldValues, Path } from "react-hook-form";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// ValidationStatus 컴포넌트
// ============================================

type ValidationState = "idle" | "validating" | "valid" | "invalid";

interface ValidationStatusProps {
  state: ValidationState;
  message?: string;
  className?: string;
}

/**
 * 유효성 검사 상태 표시
 */
export function ValidationStatus({ state, message, className }: ValidationStatusProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const stateConfig = {
    idle: { icon: null, color: "text-gray-400" },
    validating: {
      icon: (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ),
      color: "text-blue-500",
    },
    valid: {
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: "text-green-500",
    },
    invalid: {
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      color: "text-red-500",
    },
  };

  const config = stateConfig[state];

  if (state === "idle") return null;

  return (
    <div className={`flex items-center gap-2 ${config.color} ${className || ""}`}>
      {prefersReducedMotion ? (
        <>{config.icon}</>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          {config.icon}
        </motion.div>
      )}
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}

// ============================================
// InputWithValidation 컴포넌트
// ============================================

interface InputWithValidationProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  isValidating?: boolean;
  isValid?: boolean;
  showValidIcon?: boolean;
}

/**
 * 유효성 검사 아이콘이 포함된 입력 필드
 */
export function InputWithValidation({
  error,
  isValidating,
  isValid,
  showValidIcon = true,
  className,
  ...props
}: InputWithValidationProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const hasError = !!error;
  const showValid = showValidIcon && isValid && !hasError && !isValidating;

  return (
    <div className="relative">
      <input
        className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            hasError
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : showValid
              ? "border-green-500 focus:ring-green-500 focus:border-green-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }
          ${className || ""}`}
        aria-invalid={hasError}
        {...props}
      />

      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        {isValidating && (
          <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}

        {!isValidating && showValid && (
          <motion.svg
            initial={prefersReducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            className="h-4 w-4 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </motion.svg>
        )}

        {!isValidating && hasError && (
          <motion.svg
            initial={prefersReducedMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            className="h-4 w-4 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </motion.svg>
        )}
      </div>
    </div>
  );
}

// ============================================
// PasswordStrength 컴포넌트
// ============================================

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

type StrengthLevel = "none" | "weak" | "fair" | "good" | "strong";

function getPasswordStrength(password: string): StrengthLevel {
  if (!password) return "none";

  let score = 0;

  // 길이 체크
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // 문자 타입 체크
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  if (score <= 5) return "good";
  return "strong";
}

const strengthConfig = {
  none: { label: "", color: "bg-gray-200", width: "0%" },
  weak: { label: "약함", color: "bg-red-500", width: "25%" },
  fair: { label: "보통", color: "bg-yellow-500", width: "50%" },
  good: { label: "양호", color: "bg-blue-500", width: "75%" },
  strong: { label: "강함", color: "bg-green-500", width: "100%" },
};

/**
 * 비밀번호 강도 표시기
 */
export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const strength = getPasswordStrength(password);
  const config = strengthConfig[strength];

  if (strength === "none") return null;

  return (
    <div className={className}>
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        {prefersReducedMotion ? (
          <div className={`h-full ${config.color}`} style={{ width: config.width }} />
        ) : (
          <motion.div
            className={`h-full ${config.color}`}
            initial={{ width: 0 }}
            animate={{ width: config.width }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
      <p
        className={`mt-1 text-xs ${
          strength === "weak"
            ? "text-red-500"
            : strength === "fair"
            ? "text-yellow-600"
            : strength === "good"
            ? "text-blue-500"
            : "text-green-500"
        }`}
      >
        비밀번호 강도: {config.label}
      </p>
    </div>
  );
}

// ============================================
// CharacterCount 컴포넌트
// ============================================

interface CharacterCountProps {
  current: number;
  max: number;
  min?: number;
  className?: string;
}

/**
 * 문자 수 카운터
 */
export function CharacterCount({ current, max, min = 0, className }: CharacterCountProps) {
  const isOverMax = current > max;
  const isBelowMin = current < min && current > 0;
  const percentage = Math.min(100, (current / max) * 100);

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${
            isOverMax ? "bg-red-500" : isBelowMin ? "bg-yellow-500" : "bg-blue-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={`text-xs ${
          isOverMax ? "text-red-500" : isBelowMin ? "text-yellow-600" : "text-gray-500"
        }`}
      >
        {current} / {max}
      </span>
    </div>
  );
}

// ============================================
// FormValidationSummary 컴포넌트
// ============================================

interface FormValidationSummaryProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  fieldLabels?: Record<string, string>;
  className?: string;
}

/**
 * 폼 유효성 검사 요약
 */
export function FormValidationSummary<T extends FieldValues>({
  form,
  fieldLabels = {},
  className,
}: FormValidationSummaryProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { errors, isSubmitted } = form.formState;
  const errorEntries = Object.entries(errors);

  if (!isSubmitted || errorEntries.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className || ""}`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-medium text-red-800">입력 오류가 있습니다</h3>
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
              {errorEntries.map(([field, error]) => {
                const fieldError = error as FieldError;
                const label = fieldLabels[field] || field;
                return (
                  <li key={field}>
                    <strong>{label}:</strong> {fieldError?.message}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// useFieldValidation 훅
// ============================================

interface UseFieldValidationOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  debounceMs?: number;
}

/**
 * 필드 유효성 검사 상태 훅
 */
export function useFieldValidation<T extends FieldValues>({
  form,
  name,
  debounceMs = 300,
}: UseFieldValidationOptions<T>) {
  const [isValidating, setIsValidating] = useState(false);
  const { trigger, formState } = form;
  const error = formState.errors[name as keyof typeof formState.errors] as FieldError | undefined;
  const isTouched = formState.touchedFields[name as keyof typeof formState.touchedFields];
  const isDirty = formState.dirtyFields[name as keyof typeof formState.dirtyFields];

  const validate = async () => {
    setIsValidating(true);
    await trigger(name);
    setIsValidating(false);
  };

  // 디바운스된 유효성 검사
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(validate, debounceMs);
    return () => clearTimeout(timer);
  }, [form.watch(name), debounceMs, isDirty]);

  return {
    error,
    isValidating,
    isValid: isTouched && !error && !isValidating,
    isTouched: Boolean(isTouched),
    isDirty: Boolean(isDirty),
    validate,
  };
}

// ============================================
// LiveValidationInput 컴포넌트
// ============================================

interface LiveValidationInputProps<T extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "form"> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  helperText?: string;
}

/**
 * 실시간 유효성 검사 입력 필드
 */
export function LiveValidationInput<T extends FieldValues>({
  form,
  name,
  label,
  helperText,
  className,
  ...props
}: LiveValidationInputProps<T>) {
  const { error, isValidating, isValid, isTouched } = useFieldValidation({ form, name });
  const { register } = form;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <InputWithValidation
        {...register(name)}
        {...props}
        error={error}
        isValidating={isValidating}
        isValid={isValid && isTouched}
      />

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// RequiredIndicator 컴포넌트
// ============================================

interface RequiredIndicatorProps {
  className?: string;
}

/**
 * 필수 항목 표시
 */
export function RequiredIndicator({ className }: RequiredIndicatorProps) {
  return (
    <span className={`text-red-500 ml-1 ${className || ""}`} aria-hidden="true">
      *
    </span>
  );
}

// ============================================
// OptionalIndicator 컴포넌트
// ============================================

interface OptionalIndicatorProps {
  className?: string;
}

/**
 * 선택 항목 표시
 */
export function OptionalIndicator({ className }: OptionalIndicatorProps) {
  return (
    <span className={`text-gray-400 text-sm ml-1 ${className || ""}`}>(선택)</span>
  );
}
