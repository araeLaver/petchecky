"use client";

import { ReactNode, forwardRef, HTMLAttributes } from "react";

interface LandmarkProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  label?: string;
}

/**
 * Main 랜드마크 컴포넌트
 * 페이지의 주요 콘텐츠를 감싸는 컴포넌트
 *
 * @example
 * ```tsx
 * <Main id="main-content" label="펫 목록">
 *   <PetList />
 * </Main>
 * ```
 */
export const Main = forwardRef<HTMLElement, LandmarkProps>(
  ({ children, label, className = "", ...props }, ref) => {
    return (
      <main
        ref={ref}
        role="main"
        aria-label={label}
        tabIndex={-1}
        className={`outline-none focus:outline-none ${className}`}
        {...props}
      >
        {children}
      </main>
    );
  }
);

Main.displayName = "Main";

/**
 * Navigation 랜드마크 컴포넌트
 *
 * @example
 * ```tsx
 * <Navigation label="메인 메뉴">
 *   <NavLinks />
 * </Navigation>
 * ```
 */
export const Navigation = forwardRef<HTMLElement, LandmarkProps>(
  ({ children, label, className = "", ...props }, ref) => {
    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label={label}
        className={className}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

Navigation.displayName = "Navigation";

/**
 * Aside/Complementary 랜드마크 컴포넌트
 *
 * @example
 * ```tsx
 * <Aside label="관련 정보">
 *   <RelatedContent />
 * </Aside>
 * ```
 */
export const Aside = forwardRef<HTMLElement, LandmarkProps>(
  ({ children, label, className = "", ...props }, ref) => {
    return (
      <aside
        ref={ref}
        role="complementary"
        aria-label={label}
        className={className}
        {...props}
      >
        {children}
      </aside>
    );
  }
);

Aside.displayName = "Aside";

/**
 * Region 랜드마크 컴포넌트
 * 중요한 섹션을 표시하는 컴포넌트
 *
 * @example
 * ```tsx
 * <Region label="검색 결과">
 *   <SearchResults />
 * </Region>
 * ```
 */
export const Region = forwardRef<HTMLElement, LandmarkProps>(
  ({ children, label, className = "", ...props }, ref) => {
    return (
      <section
        ref={ref}
        role="region"
        aria-label={label}
        className={className}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Region.displayName = "Region";

/**
 * Search 랜드마크 컴포넌트
 *
 * @example
 * ```tsx
 * <Search label="사이트 검색">
 *   <SearchForm />
 * </Search>
 * ```
 */
export const Search = forwardRef<HTMLElement, LandmarkProps>(
  ({ children, label = "검색", className = "", ...props }, ref) => {
    return (
      <search
        ref={ref}
        role="search"
        aria-label={label}
        className={className}
        {...props}
      >
        {children}
      </search>
    );
  }
);

Search.displayName = "Search";

/**
 * Banner 랜드마크 컴포넌트 (Header)
 *
 * @example
 * ```tsx
 * <Banner>
 *   <Logo />
 *   <Navigation />
 * </Banner>
 * ```
 */
export const Banner = forwardRef<HTMLElement, LandmarkProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <header
        ref={ref}
        role="banner"
        className={className}
        {...props}
      >
        {children}
      </header>
    );
  }
);

Banner.displayName = "Banner";

/**
 * ContentInfo 랜드마크 컴포넌트 (Footer)
 *
 * @example
 * ```tsx
 * <ContentInfo>
 *   <Copyright />
 *   <FooterLinks />
 * </ContentInfo>
 * ```
 */
export const ContentInfo = forwardRef<HTMLElement, LandmarkProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <footer
        ref={ref}
        role="contentinfo"
        className={className}
        {...props}
      >
        {children}
      </footer>
    );
  }
);

ContentInfo.displayName = "ContentInfo";

/**
 * 시각적으로 숨기고 스크린 리더에만 표시
 */
export function ScreenReaderOnly({ children }: { children: ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

/**
 * 아이콘에 대한 접근성 텍스트 제공
 */
interface IconWithLabelProps {
  icon: ReactNode;
  label: string;
  className?: string;
}

export function IconWithLabel({ icon, label, className = "" }: IconWithLabelProps) {
  return (
    <span className={className}>
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * 외부 링크 표시
 */
interface ExternalLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export function ExternalLink({
  href,
  children,
  className = "",
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
      <span className="sr-only"> (새 창에서 열림)</span>
      <svg
        className="ml-1 inline-block h-3 w-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}

export default {
  Main,
  Navigation,
  Aside,
  Region,
  Search,
  Banner,
  ContentInfo,
  ScreenReaderOnly,
  IconWithLabel,
  ExternalLink,
};
