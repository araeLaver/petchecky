"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface SkipLink {
  id: string;
  label: string;
}

const skipLinks: SkipLink[] = [
  { id: "main-content", label: "본문으로 건너뛰기" },
  { id: "main-nav", label: "메인 네비게이션으로 이동" },
  { id: "search", label: "검색으로 이동" },
];

export default function SkipNavigation() {
  const { t } = useLanguage();
  const [focusedLink, setFocusedLink] = useState<string | null>(null);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="fixed left-0 top-0 z-[100]"
      role="navigation"
      aria-label="스킵 링크"
    >
      <ul className="flex flex-col gap-1 p-1">
        {skipLinks.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleClick(link.id);
              }}
              onFocus={() => setFocusedLink(link.id)}
              onBlur={() => setFocusedLink(null)}
              className={`
                block whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
                shadow-lg transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${focusedLink === link.id ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
              `}
              tabIndex={0}
            >
              {link.id === "main-content" ? t.accessibility.skipToMain : link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 스킵 링크 대상 컴포넌트
 * 스킵 링크로 이동할 수 있는 랜드마크를 정의합니다.
 */
interface SkipTargetProps {
  id: string;
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
}

export function SkipTarget({
  id,
  children,
  as: Component = "div",
  className = "",
}: SkipTargetProps) {
  return (
    <Component
      id={id}
      tabIndex={-1}
      className={`outline-none focus:outline-none ${className}`}
    >
      {children}
    </Component>
  );
}
