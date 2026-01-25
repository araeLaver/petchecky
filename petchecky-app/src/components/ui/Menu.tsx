"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  ReactNode,
  KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

interface MenuProps {
  trigger: ReactNode;
  items: MenuItem[];
  onSelect?: (itemId: string) => void;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  className?: string;
  ariaLabel?: string;
}

/**
 * 접근성이 향상된 Menu 컴포넌트
 *
 * Features:
 * - 방향키로 메뉴 항목 탐색
 * - Enter/Space로 선택
 * - Escape로 닫기
 * - 외부 클릭 시 닫기
 * - 첫 글자로 검색
 * - ARIA 속성 완벽 지원
 *
 * @example
 * ```tsx
 * <Menu
 *   trigger={<button>메뉴 열기</button>}
 *   items={[
 *     { id: 'edit', label: '수정' },
 *     { id: 'delete', label: '삭제', danger: true },
 *   ]}
 *   onSelect={(id) => handleMenuAction(id)}
 * />
 * ```
 */
export function Menu({
  trigger,
  items,
  onSelect,
  placement = "bottom-start",
  className = "",
  ariaLabel,
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchString = useRef("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const enabledItems = items.filter((item) => !item.disabled && !item.divider);

  const openMenu = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    let top = rect.bottom + 4;
    let left = rect.left;

    if (placement.includes("end")) {
      left = rect.right;
    }
    if (placement.includes("top")) {
      top = rect.top - 4;
    }

    setPosition({ top, left });
    setIsOpen(true);
    setActiveIndex(0);
  }, [placement]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const selectItem = useCallback(
    (item: MenuItem) => {
      if (item.disabled) return;
      onSelect?.(item.id);
      closeMenu();
    },
    [onSelect, closeMenu]
  );

  // 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeMenu]);

  // Escape 키 처리
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscape as unknown as EventListener);
    return () =>
      document.removeEventListener("keydown", handleEscape as unknown as EventListener);
  }, [isOpen, closeMenu]);

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        e.preventDefault();
        openMenu();
        break;
      case "ArrowUp":
        e.preventDefault();
        openMenu();
        setActiveIndex(enabledItems.length - 1);
        break;
    }
  };

  const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % enabledItems.length);
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(
          (prev) => (prev - 1 + enabledItems.length) % enabledItems.length
        );
        break;

      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;

      case "End":
        e.preventDefault();
        setActiveIndex(enabledItems.length - 1);
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex >= 0 && enabledItems[activeIndex]) {
          selectItem(enabledItems[activeIndex]);
        }
        break;

      case "Tab":
        closeMenu();
        break;

      default:
        // 첫 글자 검색
        if (e.key.length === 1 && e.key.match(/\S/)) {
          if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
          }

          searchString.current += e.key.toLowerCase();

          const matchIndex = enabledItems.findIndex((item) =>
            item.label.toLowerCase().startsWith(searchString.current)
          );

          if (matchIndex !== -1) {
            setActiveIndex(matchIndex);
          }

          searchTimeout.current = setTimeout(() => {
            searchString.current = "";
          }, 500);
        }
    }
  };

  // 메뉴가 열릴 때 포커스 이동
  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [isOpen]);

  const menuContent = isOpen && (
    <div
      ref={menuRef}
      role="menu"
      aria-label={ariaLabel}
      aria-activedescendant={
        activeIndex >= 0 ? `menu-item-${enabledItems[activeIndex]?.id}` : undefined
      }
      tabIndex={-1}
      onKeyDown={handleMenuKeyDown}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        transform: placement.includes("end") ? "translateX(-100%)" : undefined,
      }}
      className={`
        z-50 min-w-[180px] rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5
        focus:outline-none ${className}
      `}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <div
              key={`divider-${index}`}
              role="separator"
              className="my-1 border-t border-gray-200"
            />
          );
        }

        const enabledIndex = enabledItems.findIndex((i) => i.id === item.id);
        const isActive = enabledIndex === activeIndex;

        return (
          <button
            key={item.id}
            id={`menu-item-${item.id}`}
            role="menuitem"
            type="button"
            disabled={item.disabled}
            aria-disabled={item.disabled}
            onClick={() => selectItem(item)}
            onMouseEnter={() => setActiveIndex(enabledIndex)}
            className={`
              flex w-full items-center gap-2 px-4 py-2 text-sm
              ${item.disabled ? "cursor-not-allowed text-gray-400" : "cursor-pointer"}
              ${item.danger && !item.disabled ? "text-red-600" : "text-gray-700"}
              ${isActive && !item.disabled ? "bg-gray-100" : ""}
              focus:outline-none
            `}
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {trigger}
      </button>

      {typeof window !== "undefined" && createPortal(menuContent, document.body)}
    </>
  );
}

export default Menu;
