"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// FieldArray 컴포넌트
// ============================================

interface FieldArrayProps<T> {
  fields: T[];
  keyExtractor: (field: T, index: number) => string | number;
  renderField: (field: T, index: number, remove: () => void) => ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
  canAdd?: boolean;
  canRemove?: boolean;
  addLabel?: string;
  emptyMessage?: string;
  className?: string;
  maxItems?: number;
  minItems?: number;
}

/**
 * 동적 필드 배열 컴포넌트
 *
 * @example
 * ```tsx
 * <FieldArray
 *   fields={pets}
 *   keyExtractor={(pet) => pet.id}
 *   renderField={(pet, index, remove) => (
 *     <div>
 *       <Input {...register(`pets.${index}.name`)} />
 *       <button onClick={remove}>삭제</button>
 *     </div>
 *   )}
 *   onAdd={addPet}
 *   onRemove={removePet}
 *   addLabel="반려동물 추가"
 * />
 * ```
 */
export function FieldArray<T>({
  fields,
  keyExtractor,
  renderField,
  onAdd,
  onRemove,
  canAdd = true,
  canRemove = true,
  addLabel = "항목 추가",
  emptyMessage = "항목이 없습니다",
  className,
  maxItems,
  minItems = 0,
}: FieldArrayProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMaxReached = maxItems !== undefined && fields.length >= maxItems;
  const isMinReached = fields.length <= minItems;

  return (
    <div className={className}>
      {fields.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p>{emptyMessage}</p>
        </div>
      ) : prefersReducedMotion ? (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={keyExtractor(field, index)}>
              {renderField(field, index, () => {
                if (!isMinReached) onRemove(index);
              })}
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <motion.div
                key={keyExtractor(field, index)}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {renderField(field, index, () => {
                  if (!isMinReached) onRemove(index);
                })}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {canAdd && !isMaxReached && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg
            text-gray-500 hover:border-blue-400 hover:text-blue-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {addLabel}
        </button>
      )}

      {maxItems !== undefined && (
        <p className="mt-2 text-sm text-gray-500">
          {fields.length} / {maxItems}
        </p>
      )}
    </div>
  );
}

// ============================================
// ReorderableFieldArray 컴포넌트
// ============================================

interface ReorderableFieldArrayProps<T> {
  fields: T[];
  onReorder: (fields: T[]) => void;
  keyExtractor: (field: T) => string | number;
  renderField: (field: T, index: number, dragHandle: ReactNode) => ReactNode;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  canAdd?: boolean;
  addLabel?: string;
  className?: string;
}

/**
 * 드래그로 순서 변경 가능한 필드 배열
 *
 * @example
 * ```tsx
 * <ReorderableFieldArray
 *   fields={items}
 *   onReorder={setItems}
 *   keyExtractor={(item) => item.id}
 *   renderField={(item, index, dragHandle) => (
 *     <div className="flex items-center gap-2">
 *       {dragHandle}
 *       <Input {...register(`items.${index}.value`)} />
 *     </div>
 *   )}
 * />
 * ```
 */
export function ReorderableFieldArray<T>({
  fields,
  onReorder,
  keyExtractor,
  renderField,
  onAdd,
  onRemove,
  canAdd = true,
  addLabel = "항목 추가",
  className,
}: ReorderableFieldArrayProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const DragHandle = () => (
    <div className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600">
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 8h16M4 16h16"
        />
      </svg>
    </div>
  );

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={keyExtractor(field)} className="flex items-center gap-2">
              {renderField(field, index, <DragHandle />)}
            </div>
          ))}
        </div>

        {canAdd && onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg
              text-gray-500 hover:border-blue-400 hover:text-blue-500
              transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {addLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Reorder.Group axis="y" values={fields} onReorder={onReorder} className="space-y-2">
        {fields.map((field, index) => (
          <Reorder.Item
            key={keyExtractor(field)}
            value={field}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
            whileDrag={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
          >
            {renderField(field, index, <DragHandle />)}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {canAdd && onAdd && (
        <motion.button
          type="button"
          onClick={onAdd}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg
            text-gray-500 hover:border-blue-400 hover:text-blue-500
            transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {addLabel}
        </motion.button>
      )}
    </div>
  );
}

// ============================================
// FieldArrayItem 컴포넌트
// ============================================

interface FieldArrayItemProps {
  children: ReactNode;
  onRemove?: () => void;
  canRemove?: boolean;
  className?: string;
}

/**
 * 필드 배열 아이템 래퍼
 */
export function FieldArrayItem({
  children,
  onRemove,
  canRemove = true,
  className,
}: FieldArrayItemProps) {
  return (
    <div
      className={`relative p-4 bg-white rounded-lg border border-gray-200 ${className || ""}`}
    >
      {children}

      {canRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500
            focus:outline-none focus:ring-2 focus:ring-red-500 rounded
            transition-colors"
          aria-label="삭제"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// ============================================
// ConditionalField 컴포넌트
// ============================================

interface ConditionalFieldProps {
  show: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * 조건부 필드 래퍼 (애니메이션 포함)
 *
 * @example
 * ```tsx
 * <ConditionalField show={hasOther}>
 *   <Input {...register('otherReason')} placeholder="기타 사유" />
 * </ConditionalField>
 * ```
 */
export function ConditionalField({ show, children, className }: ConditionalFieldProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!show) return null;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// FieldGroup 컴포넌트
// ============================================

interface FieldGroupProps {
  legend?: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * 필드 그룹 (fieldset)
 *
 * @example
 * ```tsx
 * <FieldGroup legend="연락처 정보" collapsible>
 *   <Input {...register('phone')} />
 *   <Input {...register('email')} />
 * </FieldGroup>
 * ```
 */
export function FieldGroup({
  legend,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
}: FieldGroupProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!collapsible) {
    return (
      <fieldset className={`border border-gray-200 rounded-lg p-4 ${className || ""}`}>
        {legend && (
          <legend className="px-2 text-sm font-medium text-gray-700">{legend}</legend>
        )}
        {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
        {children}
      </fieldset>
    );
  }

  return (
    <details open={defaultOpen} className={`group ${className || ""}`}>
      <summary
        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer
          hover:bg-gray-100 transition-colors"
      >
        <div>
          {legend && <span className="font-medium text-gray-700">{legend}</span>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <svg
          className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="p-4 border border-t-0 border-gray-200 rounded-b-lg">{children}</div>
    </details>
  );
}

// ============================================
// DependentField 컴포넌트
// ============================================

interface DependentFieldProps<T> {
  watchValue: T;
  condition: (value: T) => boolean;
  children: ReactNode;
  className?: string;
}

/**
 * 다른 필드 값에 의존하는 필드
 *
 * @example
 * ```tsx
 * const petType = watch('petType');
 *
 * <DependentField
 *   watchValue={petType}
 *   condition={(type) => type === 'dog'}
 * >
 *   <Select {...register('breed')} options={dogBreeds} />
 * </DependentField>
 * ```
 */
export function DependentField<T>({
  watchValue,
  condition,
  children,
  className,
}: DependentFieldProps<T>) {
  const shouldShow = condition(watchValue);

  return (
    <ConditionalField show={shouldShow} className={className}>
      {children}
    </ConditionalField>
  );
}
