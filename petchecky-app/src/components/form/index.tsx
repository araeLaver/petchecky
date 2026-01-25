"use client";

import {
  ReactNode,
  forwardRef,
  useId,
  createContext,
  useContext,
} from "react";
import {
  useFormContext,
  Controller,
  FieldValues,
  Path,
  ControllerRenderProps,
  ControllerFieldState,
  UseFormStateReturn,
} from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// Form Context
// ============================================

interface FormFieldContextValue {
  id: string;
  name: string;
  hasError: boolean;
  errorMessage?: string;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormField() {
  const context = useContext(FormFieldContext);
  if (!context) {
    throw new Error("useFormField must be used within a FormField");
  }
  return context;
}

// ============================================
// FormField 컴포넌트
// ============================================

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  children: (props: {
    field: ControllerRenderProps<T, Path<T>>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<T>;
  }) => ReactNode;
}

/**
 * React Hook Form Controller 래퍼
 *
 * @example
 * ```tsx
 * <FormField name="email">
 *   {({ field }) => <Input {...field} type="email" />}
 * </FormField>
 * ```
 */
export function FormField<T extends FieldValues>({
  name,
  children,
}: FormFieldProps<T>) {
  const { control } = useFormContext<T>();
  const id = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={(renderProps) => {
        const hasError = !!renderProps.fieldState.error;
        const errorMessage = renderProps.fieldState.error?.message;

        return (
          <FormFieldContext.Provider value={{ id, name, hasError, errorMessage }}>
            {children(renderProps)}
          </FormFieldContext.Provider>
        );
      }}
    />
  );
}

// ============================================
// FormItem 컴포넌트
// ============================================

interface FormItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * 폼 필드 컨테이너
 */
export function FormItem({ children, className }: FormItemProps) {
  return <div className={`space-y-2 ${className || ""}`}>{children}</div>;
}

// ============================================
// FormLabel 컴포넌트
// ============================================

interface FormLabelProps {
  children: ReactNode;
  required?: boolean;
  className?: string;
}

/**
 * 폼 레이블
 */
export function FormLabel({ children, required, className }: FormLabelProps) {
  const { id, hasError } = useFormField();

  return (
    <label
      htmlFor={id}
      className={`block text-sm font-medium ${
        hasError ? "text-red-600" : "text-gray-700"
      } ${className || ""}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

// ============================================
// FormControl 컴포넌트
// ============================================

interface FormControlProps {
  children: ReactNode;
}

/**
 * 폼 컨트롤 래퍼 - aria 속성 자동 적용
 */
export function FormControl({ children }: FormControlProps) {
  const { id, hasError, errorMessage } = useFormField();

  // children에 props 전달
  if (!children || typeof children !== "object") return <>{children}</>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const child = children as React.ReactElement<any>;

  return (
    <>
      {React.cloneElement(child, {
        id,
        "aria-invalid": hasError,
        "aria-describedby": hasError ? `${id}-error` : undefined,
      })}
    </>
  );
}

import React from "react";

// ============================================
// FormDescription 컴포넌트
// ============================================

interface FormDescriptionProps {
  children: ReactNode;
  className?: string;
}

/**
 * 폼 필드 설명
 */
export function FormDescription({ children, className }: FormDescriptionProps) {
  const { id } = useFormField();

  return (
    <p id={`${id}-description`} className={`text-sm text-gray-500 ${className || ""}`}>
      {children}
    </p>
  );
}

// ============================================
// FormMessage 컴포넌트 (에러 메시지)
// ============================================

interface FormMessageProps {
  className?: string;
}

/**
 * 폼 에러 메시지 (애니메이션 포함)
 */
export function FormMessage({ className }: FormMessageProps) {
  const { id, hasError, errorMessage } = useFormField();
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!hasError || !errorMessage) return null;

  if (prefersReducedMotion) {
    return (
      <p
        id={`${id}-error`}
        role="alert"
        className={`text-sm text-red-600 ${className || ""}`}
      >
        {errorMessage}
      </p>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={errorMessage}
        id={`${id}-error`}
        role="alert"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`text-sm text-red-600 ${className || ""}`}
      >
        {errorMessage}
      </motion.p>
    </AnimatePresence>
  );
}

// ============================================
// Input 컴포넌트
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }
          ${className || ""}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// ============================================
// Textarea 컴포넌트
// ============================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors resize-y
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }
          ${className || ""}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

// ============================================
// Select 컴포넌트
// ============================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, error, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }
          ${className || ""}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";

// ============================================
// Checkbox 컴포넌트
// ============================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`h-4 w-4 rounded border-gray-300 text-blue-600
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
            disabled:cursor-not-allowed
            ${error ? "border-red-500" : ""}
            ${className || ""}`}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className={`text-sm ${error ? "text-red-600" : "text-gray-700"}`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

// ============================================
// Radio 컴포넌트
// ============================================

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  error,
  orientation = "vertical",
  className,
}: RadioGroupProps) {
  return (
    <div
      className={`${orientation === "horizontal" ? "flex gap-4" : "space-y-2"} ${className || ""}`}
      role="radiogroup"
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center gap-2 cursor-pointer ${
            option.disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={option.disabled}
            className={`h-4 w-4 border-gray-300 text-blue-600
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
              ${error ? "border-red-500" : ""}`}
          />
          <span className={`text-sm ${error ? "text-red-600" : "text-gray-700"}`}>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

// ============================================
// FormActions 컴포넌트
// ============================================

interface FormActionsProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

/**
 * 폼 버튼 컨테이너
 */
export function FormActions({ children, className, align = "right" }: FormActionsProps) {
  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div className={`flex gap-3 pt-4 ${alignClass[align]} ${className || ""}`}>{children}</div>
  );
}

// ============================================
// SubmitButton 컴포넌트
// ============================================

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

export function SubmitButton({
  children,
  isLoading,
  loadingText = "처리 중...",
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg font-medium
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors
        ${className || ""}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
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
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// ============================================
// FormSuccess 컴포넌트
// ============================================

interface FormSuccessProps {
  message?: string;
  show: boolean;
  className?: string;
}

/**
 * 폼 성공 메시지
 */
export function FormSuccess({ message, show, className }: FormSuccessProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!show) return null;

  if (prefersReducedMotion) {
    return (
      <div
        role="status"
        className={`p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 ${
          className || ""
        }`}
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{message || "성공적으로 처리되었습니다."}</span>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          role="status"
          className={`p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 ${
            className || ""
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{message || "성공적으로 처리되었습니다."}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// FormError 컴포넌트
// ============================================

interface FormErrorProps {
  message?: string;
  show: boolean;
  className?: string;
}

/**
 * 폼 에러 메시지 (전체)
 */
export function FormError({ message, show, className }: FormErrorProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!show) return null;

  if (prefersReducedMotion) {
    return (
      <div
        role="alert"
        className={`p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ${
          className || ""
        }`}
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{message || "오류가 발생했습니다."}</span>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          role="alert"
          className={`p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ${
            className || ""
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{message || "오류가 발생했습니다."}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
