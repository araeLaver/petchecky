"use client";

import { useState, useCallback, useRef, ReactNode, KeyboardEvent } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  panelClassName?: string;
  ariaLabel?: string;
}

/**
 * 접근성이 향상된 Tabs 컴포넌트
 *
 * Features:
 * - 방향키로 탭 탐색
 * - Home/End 키로 처음/끝 탭 이동
 * - 자동 활성화 (포커스 시 탭 선택)
 * - 비활성화된 탭 스킵
 * - ARIA 속성 완벽 지원
 *
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'tab1', label: '정보', content: <InfoPanel /> },
 *     { id: 'tab2', label: '설정', content: <SettingsPanel /> },
 *   ]}
 *   defaultTabId="tab1"
 *   ariaLabel="설정 탭"
 * />
 * ```
 */
export function Tabs({
  tabs,
  defaultTabId,
  onChange,
  className = "",
  tabListClassName = "",
  tabClassName = "",
  activeTabClassName = "",
  panelClassName = "",
  ariaLabel,
}: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId || tabs[0]?.id);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const enabledTabs = tabs.filter((tab) => !tab.disabled);
  const activeIndex = enabledTabs.findIndex((tab) => tab.id === activeTabId);

  const focusTab = useCallback((tabId: string) => {
    const tabElement = tabRefs.current.get(tabId);
    if (tabElement) {
      tabElement.focus();
    }
  }, []);

  const selectTab = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
      onChange?.(tabId);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      let newIndex = activeIndex;
      let handled = false;

      switch (e.key) {
        case "ArrowLeft":
          handled = true;
          newIndex = (activeIndex - 1 + enabledTabs.length) % enabledTabs.length;
          break;

        case "ArrowRight":
          handled = true;
          newIndex = (activeIndex + 1) % enabledTabs.length;
          break;

        case "Home":
          handled = true;
          newIndex = 0;
          break;

        case "End":
          handled = true;
          newIndex = enabledTabs.length - 1;
          break;
      }

      if (handled) {
        e.preventDefault();
        const newTab = enabledTabs[newIndex];
        if (newTab) {
          selectTab(newTab.id);
          focusTab(newTab.id);
        }
      }
    },
    [activeIndex, enabledTabs, focusTab, selectTab]
  );

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className={className}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className={`flex border-b border-gray-200 ${tabListClassName}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              aria-disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && selectTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
                ${tab.disabled ? "cursor-not-allowed text-gray-400" : "cursor-pointer"}
                ${isActive ? `border-b-2 border-blue-500 text-blue-600 ${activeTabClassName}` : `text-gray-600 hover:text-gray-900 ${tabClassName}`}
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      {activeTab && (
        <div
          role="tabpanel"
          id={`panel-${activeTab.id}`}
          aria-labelledby={`tab-${activeTab.id}`}
          tabIndex={0}
          className={`focus:outline-none ${panelClassName}`}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}

export default Tabs;
