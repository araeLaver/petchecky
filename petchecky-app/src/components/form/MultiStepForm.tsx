"use client";

import { ReactNode, createContext, useContext } from "react";
import { FormProvider, UseFormReturn, FieldValues } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// Multi-Step Form Context
// ============================================

interface MultiStepFormContextValue {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  goToStep: (step: number) => void;
  stepProgress: number;
  isSubmitting: boolean;
}

const MultiStepFormContext = createContext<MultiStepFormContextValue | null>(null);

export function useMultiStepFormContext() {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error("useMultiStepFormContext must be used within MultiStepFormProvider");
  }
  return context;
}

// ============================================
// MultiStepFormProvider 컴포넌트
// ============================================

interface MultiStepFormProviderProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  goToStep: (step: number) => void;
  stepProgress: number;
  isSubmitting: boolean;
  children: ReactNode;
}

export function MultiStepFormProvider<T extends FieldValues>({
  form,
  currentStep,
  totalSteps,
  isFirstStep,
  isLastStep,
  nextStep,
  prevStep,
  goToStep,
  stepProgress,
  isSubmitting,
  children,
}: MultiStepFormProviderProps<T>) {
  return (
    <FormProvider {...form}>
      <MultiStepFormContext.Provider
        value={{
          currentStep,
          totalSteps,
          isFirstStep,
          isLastStep,
          nextStep,
          prevStep,
          goToStep,
          stepProgress,
          isSubmitting,
        }}
      >
        {children}
      </MultiStepFormContext.Provider>
    </FormProvider>
  );
}

// ============================================
// StepIndicator 컴포넌트
// ============================================

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  clickable?: boolean;
  className?: string;
}

/**
 * 단계 표시기
 *
 * @example
 * ```tsx
 * <StepIndicator
 *   steps={['기본 정보', '상세 정보', '확인']}
 *   currentStep={1}
 *   onStepClick={goToStep}
 * />
 * ```
 */
export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  clickable = false,
  className,
}: StepIndicatorProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center">
            {/* Step Circle */}
            <button
              type="button"
              onClick={() => clickable && onStepClick?.(index)}
              disabled={!clickable}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full
                transition-colors duration-200
                ${
                  isCompleted
                    ? "bg-blue-600 text-white"
                    : isCurrent
                    ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600"
                    : "bg-gray-200 text-gray-500"
                }
                ${clickable ? "cursor-pointer hover:opacity-80" : "cursor-default"}
              `}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}

              {/* Current step indicator */}
              {isCurrent && !prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 rounded-full ring-4 ring-blue-200"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </button>

            {/* Step Label */}
            <span
              className={`hidden sm:block ml-2 text-sm font-medium
                ${isCurrent ? "text-blue-600" : isCompleted ? "text-gray-700" : "text-gray-500"}
              `}
            >
              {step}
            </span>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="mx-4 h-0.5 w-8 sm:w-16 bg-gray-200 relative">
                {isCompleted && (
                  <motion.div
                    className="absolute inset-0 bg-blue-600"
                    initial={prefersReducedMotion ? { width: "100%" } : { width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// ProgressBar 컴포넌트
// ============================================

interface StepProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
}

/**
 * 진행률 바
 */
export function StepProgressBar({ progress, className, showLabel = true }: StepProgressBarProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className={className}>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        {prefersReducedMotion ? (
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        ) : (
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
      {showLabel && (
        <p className="mt-2 text-sm text-gray-500 text-center">
          {Math.round(progress)}% 완료
        </p>
      )}
    </div>
  );
}

// ============================================
// StepContent 컴포넌트
// ============================================

interface StepContentProps {
  step: number;
  currentStep: number;
  children: ReactNode;
  className?: string;
}

/**
 * 단계별 콘텐츠 래퍼 (애니메이션 포함)
 */
export function StepContent({ step, currentStep, children, className }: StepContentProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isVisible = step === currentStep;

  if (!isVisible) return null;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// StepNavigation 컴포넌트
// ============================================

interface StepNavigationProps {
  onPrev?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  className?: string;
}

/**
 * 단계 네비게이션 버튼
 */
export function StepNavigation({
  onPrev,
  onNext,
  onSubmit,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
  prevLabel = "이전",
  nextLabel = "다음",
  submitLabel = "완료",
  className,
}: StepNavigationProps) {
  return (
    <div className={`flex justify-between pt-6 ${className || ""}`}>
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep}
        className={`px-4 py-2 text-gray-600 border border-gray-300 rounded-lg
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors`}
      >
        {prevLabel}
      </button>

      {isLastStep ? (
        <button
          type="submit"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors`}
        >
          {isSubmitting ? (
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
              처리 중...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors`}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

// ============================================
// useMultiStepNavigation 훅
// ============================================

/**
 * 다단계 폼 네비게이션 헬퍼 훅
 */
export function useMultiStepNavigation() {
  const context = useMultiStepFormContext();

  return {
    ...context,
    canGoNext: !context.isLastStep,
    canGoPrev: !context.isFirstStep,
  };
}
