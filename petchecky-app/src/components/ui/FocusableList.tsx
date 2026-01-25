"use client";

import { useRef, useCallback, useState, ReactNode, KeyboardEvent } from "react";
import { getFocusableElements } from "@/lib/accessibility";

interface FocusableListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isActive: boolean) => ReactNode;
  onSelect?: (item: T, index: number) => void;
  orientation?: "horizontal" | "vertical";
  loop?: boolean;
  className?: string;
  itemClassName?: string;
  role?: "listbox" | "menu" | "tablist" | "list";
  ariaLabel?: string;
  id?: string;
}

/**
 * 키보드로 탐색 가능한 리스트 컴포넌트
 *
 * Features:
 * - 방향키로 항목 탐색
 * - Home/End 키로 처음/끝으로 이동
 * - Enter/Space로 선택
 * - 옵션으로 루프 지원
 *
 * @example
 * ```tsx
 * <FocusableList
 *   items={menuItems}
 *   renderItem={(item, index, isActive) => (
 *     <span className={isActive ? 'bg-blue-100' : ''}>{item.label}</span>
 *   )}
 *   onSelect={(item) => handleSelect(item)}
 *   ariaLabel="메뉴"
 * />
 * ```
 */
export function FocusableList<T>({
  items,
  renderItem,
  onSelect,
  orientation = "vertical",
  loop = true,
  className = "",
  itemClassName = "",
  role = "listbox",
  ariaLabel,
  id,
}: FocusableListProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLUListElement>(null);

  const focusItem = useCallback((index: number) => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll<HTMLElement>('[role="option"], [role="menuitem"], [role="tab"], li');
    if (items[index]) {
      items[index].focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      const isVertical = orientation === "vertical";
      const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
      const nextKey = isVertical ? "ArrowDown" : "ArrowRight";

      let newIndex = activeIndex;
      let handled = false;

      switch (e.key) {
        case prevKey:
          handled = true;
          if (loop) {
            newIndex = (activeIndex - 1 + items.length) % items.length;
          } else {
            newIndex = Math.max(0, activeIndex - 1);
          }
          break;

        case nextKey:
          handled = true;
          if (loop) {
            newIndex = (activeIndex + 1) % items.length;
          } else {
            newIndex = Math.min(items.length - 1, activeIndex + 1);
          }
          break;

        case "Home":
          handled = true;
          newIndex = 0;
          break;

        case "End":
          handled = true;
          newIndex = items.length - 1;
          break;

        case "Enter":
        case " ":
          handled = true;
          e.preventDefault();
          onSelect?.(items[activeIndex], activeIndex);
          break;
      }

      if (handled) {
        e.preventDefault();
        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex);
          focusItem(newIndex);
        }
      }
    },
    [activeIndex, items, loop, onSelect, orientation, focusItem]
  );

  const getItemRole = () => {
    switch (role) {
      case "menu":
        return "menuitem";
      case "tablist":
        return "tab";
      case "listbox":
      default:
        return "option";
    }
  };

  const itemRole = getItemRole();

  return (
    <ul
      ref={containerRef}
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-orientation={orientation}
      aria-activedescendant={`${id}-item-${activeIndex}`}
      onKeyDown={handleKeyDown}
      className={className}
    >
      {items.map((item, index) => (
        <li
          key={index}
          id={`${id}-item-${index}`}
          role={itemRole}
          tabIndex={index === activeIndex ? 0 : -1}
          aria-selected={index === activeIndex}
          onClick={() => {
            setActiveIndex(index);
            onSelect?.(item, index);
          }}
          onFocus={() => setActiveIndex(index)}
          className={`outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${itemClassName}`}
        >
          {renderItem(item, index, index === activeIndex)}
        </li>
      ))}
    </ul>
  );
}

export default FocusableList;
