"use client";

import { useState, useCallback, useRef, ReactNode, KeyboardEvent } from "react";

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpandedIds?: string[];
  onChange?: (expandedIds: string[]) => void;
  className?: string;
  itemClassName?: string;
  headerClassName?: string;
  panelClassName?: string;
}

/**
 * 접근성이 향상된 Accordion 컴포넌트
 *
 * Features:
 * - 방향키로 헤더 간 이동
 * - Enter/Space로 패널 토글
 * - Home/End로 처음/끝 이동
 * - 다중 확장 지원
 * - ARIA 속성 완벽 지원
 *
 * @example
 * ```tsx
 * <Accordion
 *   items={[
 *     { id: 'faq1', title: '자주 묻는 질문 1', content: <p>답변 1</p> },
 *     { id: 'faq2', title: '자주 묻는 질문 2', content: <p>답변 2</p> },
 *   ]}
 *   allowMultiple
 * />
 * ```
 */
export function Accordion({
  items,
  allowMultiple = false,
  defaultExpandedIds = [],
  onChange,
  className = "",
  itemClassName = "",
  headerClassName = "",
  panelClassName = "",
}: AccordionProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const enabledItems = items.filter((item) => !item.disabled);

  const toggleItem = useCallback(
    (itemId: string) => {
      setExpandedIds((prev) => {
        let newExpanded: string[];

        if (prev.includes(itemId)) {
          newExpanded = prev.filter((id) => id !== itemId);
        } else {
          newExpanded = allowMultiple ? [...prev, itemId] : [itemId];
        }

        onChange?.(newExpanded);
        return newExpanded;
      });
    },
    [allowMultiple, onChange]
  );

  const focusButton = useCallback((index: number) => {
    const button = buttonRefs.current.get(index);
    if (button) {
      button.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, itemIndex: number) => {
      const enabledIndex = enabledItems.findIndex(
        (item) => item.id === items[itemIndex].id
      );

      let newIndex = enabledIndex;
      let handled = false;

      switch (e.key) {
        case "ArrowUp":
          handled = true;
          newIndex =
            (enabledIndex - 1 + enabledItems.length) % enabledItems.length;
          break;

        case "ArrowDown":
          handled = true;
          newIndex = (enabledIndex + 1) % enabledItems.length;
          break;

        case "Home":
          handled = true;
          newIndex = 0;
          break;

        case "End":
          handled = true;
          newIndex = enabledItems.length - 1;
          break;
      }

      if (handled) {
        e.preventDefault();
        const targetItem = enabledItems[newIndex];
        const targetIndex = items.findIndex((item) => item.id === targetItem.id);
        setFocusedIndex(targetIndex);
        focusButton(targetIndex);
      }
    },
    [enabledItems, items, focusButton]
  );

  return (
    <div className={`divide-y divide-gray-200 ${className}`}>
      {items.map((item, index) => {
        const isExpanded = expandedIds.includes(item.id);
        const headerId = `accordion-header-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className={itemClassName}>
            <h3>
              <button
                ref={(el) => {
                  if (el) buttonRefs.current.set(index, el);
                }}
                id={headerId}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={panelId}
                aria-disabled={item.disabled}
                disabled={item.disabled}
                onClick={() => !item.disabled && toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setFocusedIndex(index)}
                className={`
                  flex w-full items-center justify-between py-4 text-left text-base font-medium
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                  ${item.disabled ? "cursor-not-allowed text-gray-400" : "text-gray-900 hover:text-gray-600"}
                  ${headerClassName}
                `}
              >
                <span>{item.title}</span>
                <svg
                  className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isExpanded}
              className={`
                overflow-hidden transition-all
                ${isExpanded ? "pb-4" : "h-0"}
                ${panelClassName}
              `}
            >
              <div className="text-gray-600">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Accordion;
