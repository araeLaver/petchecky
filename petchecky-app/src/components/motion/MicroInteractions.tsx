"use client";

import { ReactNode, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// Ripple 효과
// ============================================

interface RippleProps {
  color?: string;
  duration?: number;
}

interface RippleInstance {
  id: number;
  x: number;
  y: number;
  size: number;
}

/**
 * 버튼 등에 리플 효과 추가
 *
 * @example
 * ```tsx
 * const { ripples, onClick, RippleContainer } = useRipple();
 * <button onClick={onClick}>
 *   <RippleContainer />
 *   Click me
 * </button>
 * ```
 */
export function useRipple({ color = "rgba(255, 255, 255, 0.3)", duration = 600 }: RippleProps = {}) {
  const [ripples, setRipples] = useState<RippleInstance[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;

      const id = Date.now();
      setRipples((prev) => [...prev, { id, x, y, size }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, duration);
    },
    [duration, prefersReducedMotion]
  );

  const RippleContainer = useCallback(
    () => (
      <span className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration / 1000 }}
              style={{
                position: "absolute",
                left: ripple.x - ripple.size / 2,
                top: ripple.y - ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
          ))}
        </AnimatePresence>
      </span>
    ),
    [ripples, color, duration]
  );

  return { ripples, onClick, RippleContainer };
}

// ============================================
// RippleButton 컴포넌트
// ============================================

interface RippleButtonProps {
  children: ReactNode;
  rippleColor?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

export function RippleButton({
  children,
  rippleColor = "rgba(255, 255, 255, 0.3)",
  className,
  onClick: onClickProp,
  disabled,
  type = "button",
  "aria-label": ariaLabel,
}: RippleButtonProps) {
  const { onClick, RippleContainer } = useRipple({ color: rippleColor });
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick(e);
    onClickProp?.(e);
  };

  if (prefersReducedMotion) {
    return (
      <button
        className={className}
        onClick={onClickProp}
        disabled={disabled}
        type={type}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      disabled={disabled}
      type={type}
      aria-label={ariaLabel}
    >
      <RippleContainer />
      {children}
    </motion.button>
  );
}

// ============================================
// Loading 스피너
// ============================================

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const spinnerSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function Spinner({ size = "md", color = "currentColor", className }: SpinnerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={`${spinnerSizes[size]} border-2 border-current border-t-transparent rounded-full ${className}`}
        style={{ color }}
        role="status"
        aria-label="로딩 중"
      />
    );
  }

  return (
    <motion.div
      className={`${spinnerSizes[size]} border-2 border-current border-t-transparent rounded-full ${className}`}
      style={{ color }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      role="status"
      aria-label="로딩 중"
    />
  );
}

// ============================================
// Pulse 로딩 도트
// ============================================

interface PulseDotsProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const dotSizes = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-3 h-3",
};

export function PulseDots({ size = "md", color = "currentColor", className }: PulseDotsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={`flex gap-1 ${className}`} role="status" aria-label="로딩 중">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${dotSizes[size]} rounded-full`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-1 ${className}`} role="status" aria-label="로딩 중">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${dotSizes[size]} rounded-full`}
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// Progress Bar
// ============================================

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  height?: "sm" | "md" | "lg";
  className?: string;
}

const progressHeights = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  color = "#3b82f6",
  height = "md",
  className,
}: ProgressBarProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        <div
          className={`w-full bg-gray-200 rounded-full overflow-hidden ${progressHeights[height]}`}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        {showLabel && (
          <span className="text-sm text-gray-600 mt-1">{Math.round(percentage)}%</span>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${progressHeights[height]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <motion.span
          className="text-sm text-gray-600 mt-1 block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  );
}

// ============================================
// Animated Counter
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 0.5,
  formatter = (v) => v.toLocaleString(),
  className,
}: AnimatedCounterProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (v) => formatter(Math.round(v)));
  const [displayValue, setDisplayValue] = useState(formatter(0));

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on("change", (v) => setDisplayValue(v));
    return unsubscribe;
  }, [value, spring, display]);

  if (prefersReducedMotion) {
    return <span className={className}>{formatter(value)}</span>;
  }

  return <motion.span className={className}>{displayValue}</motion.span>;
}

// ============================================
// Toggle Switch
// ============================================

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const toggleSizes = {
  sm: { track: "w-8 h-4", thumb: "w-3 h-3", translate: "translate-x-4" },
  md: { track: "w-11 h-6", thumb: "w-5 h-5", translate: "translate-x-5" },
  lg: { track: "w-14 h-7", thumb: "w-6 h-6", translate: "translate-x-7" },
};

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
  className,
}: ToggleSwitchProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sizeConfig = toggleSizes[size];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) onChange(!checked);
    }
  };

  if (prefersReducedMotion) {
    return (
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`${sizeConfig.track} relative rounded-full transition-colors ${
          checked ? "bg-blue-500" : "bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 ${sizeConfig.thumb} rounded-full bg-white shadow-sm transition-transform ${
            checked ? sizeConfig.translate : ""
          }`}
        />
      </button>
    );
  }

  return (
    <motion.button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onKeyDown={handleKeyDown}
      className={`${sizeConfig.track} relative rounded-full ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      animate={{ backgroundColor: checked ? "#3b82f6" : "#d1d5db" }}
      transition={{ duration: 0.2 }}
    >
      <motion.span
        className={`absolute top-0.5 left-0.5 ${sizeConfig.thumb} rounded-full bg-white shadow-sm`}
        animate={{ x: checked ? (size === "sm" ? 16 : size === "md" ? 20 : 28) : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

// ============================================
// Checkbox 애니메이션
// ============================================

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function AnimatedCheckbox({
  checked,
  onChange,
  disabled = false,
  label,
  className,
}: AnimatedCheckboxProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1 },
  };

  return (
    <label
      className={`inline-flex items-center gap-2 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${className}`}
    >
      <button
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"
        }`}
      >
        {prefersReducedMotion ? (
          checked && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )
        ) : (
          <AnimatePresence>
            {checked && (
              <motion.svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={checkVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.2 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        )}
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}

// ============================================
// Shake 애니메이션
// ============================================

interface ShakeProps {
  children: ReactNode;
  trigger: boolean;
  intensity?: "light" | "medium" | "strong";
  className?: string;
}

const shakeIntensities = {
  light: [-2, 2, -2, 2, 0],
  medium: [-5, 5, -5, 5, 0],
  strong: [-10, 10, -10, 10, 0],
};

export function Shake({ children, trigger, intensity = "medium", className }: ShakeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={trigger ? { x: shakeIntensities[intensity] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Bounce 애니메이션
// ============================================

interface BounceProps {
  children: ReactNode;
  trigger?: boolean;
  className?: string;
}

export function Bounce({ children, trigger = false, className }: BounceProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={trigger ? { y: [0, -10, 0] } : { y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Skeleton 로딩
// ============================================

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  className?: string;
}

const roundedClasses = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({ width, height, rounded = "md", className }: SkeletonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={`bg-gray-200 ${roundedClasses[rounded]} ${className}`}
        style={{ width, height }}
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.div
      className={`bg-gray-200 ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="true"
    />
  );
}

// ============================================
// Notification Badge
// ============================================

interface NotificationBadgeProps {
  count: number;
  max?: number;
  color?: string;
  className?: string;
}

export function NotificationBadge({
  count,
  max = 99,
  color = "#ef4444",
  className,
}: NotificationBadgeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const displayCount = count > max ? `${max}+` : count.toString();

  if (count === 0) return null;

  if (prefersReducedMotion) {
    return (
      <span
        className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white rounded-full ${className}`}
        style={{ backgroundColor: color }}
        aria-label={`${count}개의 알림`}
      >
        {displayCount}
      </span>
    );
  }

  return (
    <motion.span
      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white rounded-full ${className}`}
      style={{ backgroundColor: color }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
      aria-label={`${count}개의 알림`}
    >
      {displayCount}
    </motion.span>
  );
}

// ============================================
// Heart Like 애니메이션
// ============================================

interface HeartLikeProps {
  liked: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const heartSizes = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function HeartLike({ liked, onToggle, size = "md", className }: HeartLikeProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <button
        onClick={onToggle}
        className={`${heartSizes[size]} ${className}`}
        aria-label={liked ? "좋아요 취소" : "좋아요"}
      >
        <svg
          viewBox="0 0 24 24"
          fill={liked ? "#ef4444" : "none"}
          stroke={liked ? "#ef4444" : "currentColor"}
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    );
  }

  return (
    <motion.button
      onClick={onToggle}
      className={`${heartSizes[size]} ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
    >
      <motion.svg
        viewBox="0 0 24 24"
        animate={{
          fill: liked ? "#ef4444" : "transparent",
          stroke: liked ? "#ef4444" : "currentColor",
          scale: liked ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </motion.svg>
    </motion.button>
  );
}
