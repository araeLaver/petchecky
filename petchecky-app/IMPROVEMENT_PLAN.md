# 펫체키 개선 계획

## 완료된 단계

### Phase 1 ✅
- Zod 검증 스키마 추가
- Rate Limiting 구현
- 타입 통합 및 정리
- 컴포넌트 분리 (ChatInterface → ChatForm, MessageList, ChatHeader)

### Phase 2 ✅
- API 서비스 레이어 구축 (apiClient, chatService, communityService)
- Hook 테스트 커버리지 (useChat, usePets, useLocalStorage)
- Context Provider 최적화 (useMemo, useCallback)
- 코드 문서화

### Phase 3 ✅
- Loading UX 개선 (PageLoading, AsyncBoundary, EmptyState)
- 접근성(A11y) 컴포넌트 (Modal, Button, VisuallyHidden)
- 키보드 네비게이션 훅 (useKeyboardNavigation)
- E2E 테스트 설정 (Playwright)

---

## Phase 4: 성능 최적화 및 모니터링 ✅

### 4.1 이미지 최적화 ✅
- [x] Next.js Image 컴포넌트 활용 (base64 이미지는 eslint-disable 처리)
- [x] 이미지 lazy loading 적용 (Next.js Image 기본 적용)
- [x] WebP/AVIF 포맷 자동 변환 (next.config.ts에서 설정)
- [x] 썸네일 생성 로직 (sharp 라이브러리 활용)

### 4.2 번들 최적화 ✅
- [x] 동적 import로 코드 스플리팅 (모달, 차트 등 적용)
- [x] 사용하지 않는 의존성 제거 (depcheck 확인 완료)
- [x] Tree shaking 최적화 (Next.js 기본 적용)
- [x] Bundle Analyzer로 번들 크기 분석 (npm run analyze 설정)

### 4.3 캐싱 전략 ✅
- [x] React Query 캐싱 최적화 (staleTime: 5분, gcTime: 30분)
- [x] Service Worker 캐싱 전략 (OfflineIndicator 구현)
- [x] API 응답 캐싱 (React Query로 처리)
- [x] 정적 자산 캐싱 헤더 설정 (next.config.ts에서 설정)

### 4.4 모니터링 강화 ✅
- [x] Sentry 에러 트래킹 설정 (클라이언트/서버/엣지 설정)
- [x] 성능 메트릭 수집 (Sentry tracing 10% 샘플링)
- [x] 개인정보 필터링 적용 (beforeSend에서 처리)
- [x] 에러 무시 규칙 설정 (네트워크 에러 등)

### 4.5 데이터베이스 최적화 ✅
- [x] Supabase 쿼리 최적화 (SELECT * → 필요한 컬럼만 조회)
- [x] 인덱스 추가 (supabase/migrations/001_optimize_queries.sql)
- [x] N+1 쿼리 문제 해결 (RPC 함수 + fallback 패턴)
  - incrementPostViews: 2쿼리 → 1쿼리
  - toggleLike: 4쿼리 → 2쿼리
  - incrementUsage: 2쿼리 → 1쿼리
- [x] 페이지네이션 개선 (reservation API, chat records)

---

## Phase 5: 기능 고도화

### 5.1 오프라인 지원 ✅
- [x] IndexedDB 활용 오프라인 데이터 저장 (indexedDB.ts 확장)
- [x] 오프라인 상태 UI 개선 (OfflineIndicator + useOfflineSync 훅)
- [x] 동기화 충돌 해결 로직 (timestamp 기반 자동 해결)

### 5.2 알림 시스템 ✅
- [x] Push Notification 구현 (src/lib/notifications.ts)
- [x] 이메일 알림 (sendEmailNotification 함수)
- [x] 인앱 알림 센터 (NotificationCenter 컴포넌트, useNotifications 훅)

### 5.3 다국어 지원 강화 ✅
- [x] 번역 키 정리 (TypeScript 기반 타입 검증)
- [x] 누락된 번역 추가 (중복 키 정리 완료)
- [x] 중국어(zh) 언어 추가
- [x] RTL 언어 지원 인프라 (direction, isRtl 속성 추가)

### 5.4 테스트 커버리지 확대 ✅
- [x] 컴포넌트 테스트 추가 (NotificationCenter 테스트)
- [x] API 통합 테스트 (Reservation API route 테스트)
- [x] Hook 테스트 추가 (useOfflineSync, useNotifications)
- [ ] 시각적 회귀 테스트 (Chromatic) - 선택적

---

## Phase 6: 보안 강화 ✅

### 6.1 보안 헤더 설정 ✅
- [x] CSP (Content Security Policy) 설정 (next.config.ts)
- [x] X-Frame-Options, X-Content-Type-Options 등 보안 헤더
- [x] HSTS (HTTP Strict Transport Security) 설정
- [x] Referrer-Policy, Permissions-Policy 설정

### 6.2 입력 검증 강화 ✅
- [x] API 요청 본문 크기 제한 (middleware.ts - 10MB)
- [x] 파일 업로드 검증 (validations.ts - imageFileSchema, documentFileSchema)
- [x] SQL Injection 방지 (middleware.ts, validations.ts - hasSqlInjection)
- [x] XSS 방지 (middleware.ts - hasXssPattern, validations.ts - stripHtmlTags, escapeHtml)

### 6.3 인증/인가 강화 ✅
- [x] CSRF 토큰 구현 (security.ts - generateCsrfToken, verifyCsrfToken)
- [x] 세션 관리 개선 (auth.ts - trackSessionActivity, isSessionValid)
- [x] API 키 보호 (security.ts - validateApiKey, secureCompare)
- [x] 민감한 데이터 암호화 (security.ts - encryptData, decryptData)
- [x] RBAC 구현 (auth.ts - UserRole, hasPermission, authorizeApiAccess)
- [x] 로그인 시도 제한 (auth.ts - recordLoginAttempt, isLoginLocked)

### 6.4 보안 모니터링 ✅
- [x] 보안 로깅 구현 (securityLogger.ts - logSecurityEvent)
- [x] 의심스러운 활동 감지 (securityLogger.ts - detectSuspiciousActivity, isIpBlacklisted)
- [x] 보안 감사 체크리스트 (securityLogger.ts - performSecurityAudit, getSecurityAuditSummary)

---

## Phase 7: SEO 최적화 ✅

### 7.1 메타데이터 및 Open Graph 설정 ✅
- [x] SEO 설정 중앙화 (src/lib/seo.ts - SITE_CONFIG, PAGE_SEO)
- [x] 메타데이터 생성 함수 (generatePageMetadata, generateDynamicMetadata)
- [x] 페이지별 메타데이터 레이아웃 (15+ 페이지에 개별 layout.tsx 추가)
- [x] Open Graph 이미지 설정 및 Twitter Cards 지원

### 7.2 사이트맵 및 robots.txt ✅
- [x] 동적 사이트맵 생성 (src/app/sitemap.ts)
- [x] robots.txt 생성 (src/app/robots.ts)
- [x] 악성 봇 차단 (AhrefsBot, SemrushBot 등)
- [x] 검색엔진별 최적화 규칙 (Googlebot, Bingbot)

### 7.3 구조화된 데이터 (JSON-LD) ✅
- [x] JSON-LD 컴포넌트 (src/components/JsonLd.tsx)
- [x] Organization 및 Website 스키마 (layout.tsx)
- [x] SoftwareApplication 스키마
- [x] MedicalService 스키마
- [x] FAQ 및 HowTo 스키마 (응급 페이지)
- [x] Article, Product, Event 스키마 지원

### 7.4 성능 및 Core Web Vitals 최적화 ✅
- [x] Web Vitals 모니터링 (src/lib/webVitals.ts)
- [x] LCP, INP, CLS, TTFB, FCP 측정 및 보고
- [x] Sentry 연동 (성능 저하 시 경고)
- [x] 최적화 팁 생성 함수 (getOptimizationTips)

---

## Phase 8: PWA 완성 ✅

### 8.1 manifest.json 고도화 ✅
- [x] 다양한 아이콘 크기 (72x72 ~ 512x512, maskable 포함)
- [x] 앱 바로가기 (shortcuts) - AI 상담, 응급, 커뮤니티, 이미지 분석
- [x] 스크린샷 설정 (모바일 3장, 데스크톱 1장)
- [x] Share Target API 설정 (이미지 공유 지원)
- [x] Launch Handler 설정 (기존 창 재사용)
- [x] Edge Side Panel 지원

### 8.2 Service Worker 고도화 ✅
- [x] 다중 캐시 전략 (Static, Dynamic, Image, API 분리)
- [x] Navigation Preload 지원
- [x] Share Target 핸들링 (POST /share 처리)
- [x] 캐시 크기 제한 및 자동 정리 (trimCache)
- [x] 네트워크 타임아웃 설정 (API 5초)
- [x] Periodic Background Sync 지원

### 8.3 앱 설치 프롬프트 구현 ✅
- [x] PWAInstallPrompt 컴포넌트 (src/components/PWAInstallPrompt.tsx)
- [x] beforeinstallprompt 이벤트 처리
- [x] iOS Safari 설치 가이드 (공유 → 홈 화면에 추가)
- [x] 방문 횟수 기반 표시 (최소 2회 방문 후)
- [x] 영구/일시적 닫기 옵션 (7일 후 재표시)

### 8.4 오프라인 페이지 개선 ✅
- [x] 전용 오프라인 페이지 (src/app/offline/page.tsx)
- [x] 온라인 복구 시 자동 새로고침
- [x] 오프라인에서 이용 가능한 기능 안내
- [x] 연결 문제 해결 방법 가이드
- [x] 재시도 버튼 및 로딩 상태

---

## Phase 9: CI/CD 파이프라인 ✅

### 9.1 GitHub Actions 워크플로우 설정 ✅
- [x] CI 워크플로우 (.github/workflows/ci.yml)
- [x] Node.js 20 설정 및 npm 캐싱
- [x] Concurrency 설정 (중복 실행 방지)
- [x] 병렬 job 실행 (lint, test, build, e2e, security)

### 9.2 자동 테스트 및 린트 검사 ✅
- [x] ESLint 자동 실행
- [x] TypeScript 타입 체크 (tsc --noEmit)
- [x] 유닛 테스트 + 커버리지 리포트
- [x] E2E 테스트 (Playwright)
- [x] 보안 취약점 감사 (npm audit)
- [x] Codecov 커버리지 업로드

### 9.3 Preview 배포 환경 ✅
- [x] PR Preview 배포 워크플로우 (.github/workflows/preview.yml)
- [x] Vercel Preview 자동 배포
- [x] PR 댓글로 Preview URL 공유
- [x] Lighthouse 성능 점수 자동 측정

### 9.4 프로덕션 배포 자동화 ✅
- [x] 프로덕션 배포 워크플로우 (.github/workflows/deploy.yml)
- [x] main 브랜치 푸시 시 자동 배포
- [x] 수동 배포 트리거 (workflow_dispatch)
- [x] 배포 후 헬스체크 (/api/health)
- [x] Slack 알림 설정 (선택적)
- [x] Dependabot 자동 의존성 업데이트

---

## Phase 10: 접근성(A11y) 심화 ✅

### 10.1 ARIA 속성 및 시맨틱 마크업 강화 ✅
- [x] 접근성 유틸리티 라이브러리 (src/lib/accessibility.ts)
- [x] 접근성 React 훅 (src/hooks/useAccessibility.ts)
- [x] 스킵 네비게이션 개선 (SkipNavigation.tsx, SkipTarget)
- [x] 접근성 CSS 스타일 (globals.css - sr-only, focus-visible, 고대비 모드)

### 10.2 키보드 네비게이션 개선 ✅
- [x] FocusableList 컴포넌트 - 방향키로 리스트 탐색
- [x] Tabs 컴포넌트 - 접근성 있는 탭 UI
- [x] Menu 컴포넌트 - 키보드 드롭다운 메뉴
- [x] Accordion 컴포넌트 - 접근성 있는 아코디언

### 10.3 스크린 리더 최적화 ✅
- [x] LiveAnnouncerProvider - 스크린 리더 공지 컨텍스트
- [x] LoadingAnnouncer, ResultAnnouncer - 상태 공지 컴포넌트
- [x] Landmarks 컴포넌트 (Main, Navigation, Aside, Region, Search, Banner, ContentInfo)
- [x] ScreenReaderOnly, IconWithLabel, ExternalLink 유틸리티

### 10.4 색상 대비 및 시각적 접근성 ✅
- [x] 색상 대비 유틸리티 (src/lib/colorContrast.ts)
- [x] WCAG 2.1 AA/AAA 대비 검증 함수
- [x] FocusRing, FocusableCard 컴포넌트
- [x] StatusIndicator - 색상+아이콘 상태 표시
- [x] 고대비 모드 지원 (HighContrastText)

---

## Phase 11: Storybook 문서화 ✅

### 11.1 Storybook 설정 강화 ✅
- [x] 다크 모드/라이트 모드 전환 데코레이터
- [x] 뷰포트 설정 (Mobile, Tablet, Desktop)
- [x] 접근성 애드온 설정 (a11y rules)
- [x] 언어 전환 글로벌 타입 추가
- [x] autodocs 태그 활성화

### 11.2 UI 컴포넌트 Stories 작성 ✅
- [x] Button.stories.tsx - 모든 변형, 크기, 상태
- [x] Modal.stories.tsx - 기본, 폼, 확인 다이얼로그
- [x] Tabs.stories.tsx - 기본, 비활성화, 풍부한 콘텐츠
- [x] Menu.stories.tsx - 기본, 아이콘, 프로필 메뉴
- [x] Accordion.stories.tsx - 기본, 다중 열기, 풍부한 콘텐츠

### 11.3 접근성 컴포넌트 Stories 작성 ✅
- [x] FocusableList.stories.tsx - 세로/가로, 알림 목록
- [x] StatusIndicator.stories.tsx - 모든 상태, 실제 사용 예시
- [x] FocusableCard, FocusRing 예시

### 11.4 Storybook 빌드 및 배포 설정 ✅
- [x] GitHub Actions 워크플로우 (.github/workflows/storybook.yml)
- [x] Chromatic 시각적 테스트 통합
- [x] GitHub Pages 배포 설정
- [x] 컴포넌트 변경 시 자동 빌드

---

## Phase 12: 애니메이션/UX 개선 ✅

### 12.1 Framer Motion 설정 및 유틸리티 ✅
- [x] framer-motion 라이브러리 설치
- [x] 재사용 가능한 애니메이션 Variants (src/lib/animations.ts)
  - fade, scale, slide, stagger 애니메이션
  - 버튼/카드 호버 효과
  - 모달/드로어/토스트 애니메이션
  - 스켈레톤/로딩 애니메이션
- [x] Motion 래퍼 컴포넌트 (src/components/motion/index.tsx)
  - FadeIn, FadeInUp, FadeInDown, FadeInLeft, FadeInRight
  - ScaleIn, PopIn, SlideInFromBottom, SlideInFromRight
  - StaggerList, StaggerItem, MotionButton, MotionCard
- [x] 감소된 모션 환경설정 지원 (usePrefersReducedMotion)

### 12.2 페이지 전환 애니메이션 ✅
- [x] PageTransition 컴포넌트 - 7가지 전환 효과
- [x] RouteTransition - Next.js App Router 통합
- [x] LayoutTransition - 레이아웃 애니메이션
- [x] SharedElement - 공유 요소 전환
- [x] PresenceTransition - 조건부 렌더링 애니메이션
- [x] ViewTransition - 탭/스텝 뷰 전환
- [x] usePageTransition 훅

### 12.3 마이크로인터랙션 컴포넌트 ✅
- [x] useRipple, RippleButton - 리플 효과
- [x] Spinner, PulseDots - 로딩 인디케이터
- [x] ProgressBar - 애니메이션 프로그레스 바
- [x] AnimatedCounter - 숫자 카운터 애니메이션
- [x] ToggleSwitch, AnimatedCheckbox - 폼 컨트롤 애니메이션
- [x] Shake, Bounce - 상태 피드백 애니메이션
- [x] Skeleton - 스켈레톤 로딩
- [x] NotificationBadge, HeartLike - UI 피드백 애니메이션

### 12.4 리스트/카드 애니메이션 ✅
- [x] AnimatedList - Stagger 리스트 애니메이션
- [x] AnimatedGrid - 그리드 레이아웃 애니메이션
- [x] ReorderList - 드래그 재정렬 리스트
- [x] AnimatedCard - 호버/탭 카드 애니메이션
- [x] FlipCard - 앞뒤 뒤집기 카드
- [x] ExpandableCard - 확장 가능 카드
- [x] SwipeableCard - 스와이프 동작 카드
- [x] MasonryGrid - Masonry 레이아웃
- [x] InfiniteScrollList - 무한 스크롤

---

## Phase 13: 폼 시스템 고도화 ✅

### 13.1 React Hook Form 통합 ✅
- [x] react-hook-form, @hookform/resolvers 설치
- [x] Zod 스키마 통합 유틸리티 (src/lib/form.ts)
  - useZodForm, formatZodError
  - 공통 스키마 (email, password, phone, url, date)
  - 파일 유효성 검사 스키마
- [x] 폼 상태 관리 훅 (src/hooks/useForm.ts)
  - useFormWithStatus - 제출 상태 관리
  - useMultiStepForm - 다단계 폼
  - useFieldArrayWithValidation - 동적 필드
  - useAutoSave - 자동 저장
  - useFormPersist - 로컬 스토리지 저장

### 13.2 폼 UI 컴포넌트 ✅
- [x] FormField, FormItem, FormLabel, FormControl
- [x] FormDescription, FormMessage (에러 애니메이션)
- [x] Input, Textarea, Select, Checkbox, RadioGroup
- [x] FormActions, SubmitButton
- [x] FormSuccess, FormError 알림

### 13.3 복잡한 폼 패턴 ✅
- [x] MultiStepFormProvider - 다단계 폼 컨텍스트
- [x] StepIndicator - 단계 표시기
- [x] StepProgressBar - 진행률 바
- [x] StepContent - 단계별 콘텐츠 (애니메이션)
- [x] StepNavigation - 네비게이션 버튼
- [x] FieldArray - 동적 필드 배열
- [x] ReorderableFieldArray - 드래그 순서 변경
- [x] ConditionalField - 조건부 필드
- [x] FieldGroup - 필드 그룹 (접이식)
- [x] DependentField - 의존 필드

### 13.4 유효성 검사 UX ✅
- [x] ValidationStatus - 유효성 상태 표시
- [x] InputWithValidation - 아이콘 포함 입력
- [x] PasswordStrength - 비밀번호 강도 표시기
- [x] CharacterCount - 문자 수 카운터
- [x] FormValidationSummary - 에러 요약
- [x] useFieldValidation - 필드 유효성 훅
- [x] LiveValidationInput - 실시간 유효성 검사
- [x] RequiredIndicator, OptionalIndicator

---

## Phase 14: 인프라 및 개발 경험 개선 ✅

### 14.1 데이터 시각화 컴포넌트 ✅
- [x] recharts 설치 및 통합
- [x] ChartContainer - 로딩/빈 상태 처리
- [x] LineChart - 라인 차트 (체중 추적 등)
- [x] BarChart - 막대 차트 (활동 통계)
- [x] PieChart - 파이/도넛 차트 (식사 구성)
- [x] AreaChart - 영역 차트
- [x] StatCard - 통계 카드
- [x] MiniChart - 스파크라인
- [x] 펫 전용 차트 (WeightChart, ActivityChart, MealChart)

### 14.2 에러 처리 고도화 ✅
- [x] ErrorBoundary - React 에러 경계
- [x] withErrorBoundary HOC
- [x] useErrorHandler - 명령형 에러 핸들링
- [x] reportError - 에러 리포팅 시스템
- [x] ErrorPage - 전체 페이지 에러 UI
- [x] ErrorCard - 인라인 에러 카드
- [x] NetworkError - 네트워크 에러 UI
- [x] EmptyState - 빈 상태 UI
- [x] NotFound (404), ServerError (500)
- [x] Maintenance - 점검 중 UI

### 14.3 API 모킹 (MSW) ✅
- [x] msw 설치 및 설정
- [x] handlers.ts - API 핸들러 정의
  - Auth (login, logout, me)
  - Pets (CRUD, health records, walks)
  - Statistics
  - Error simulation
- [x] browser.ts - 브라우저 Worker
- [x] server.ts - Node.js Server (테스트용)
- [x] MSWProvider - 개발 환경 초기화
- [x] mockServiceWorker.js 생성

### 14.4 상태 관리 최적화 (Zustand) ✅
- [x] zustand, immer 설치
- [x] createStore - 표준화된 스토어 팩토리
  - Immer 미들웨어 (불변성)
  - SubscribeWithSelector (선택적 구독)
  - Persist (로컬 스토리지)
  - Devtools (개발 도구)
- [x] petStore - 반려동물 상태
- [x] userStore - 사용자 상태 및 설정
- [x] uiStore - UI 상태 (Toast, Modal, Loading)
- [x] appStore - 앱 전역 상태
- [x] toast 헬퍼 함수

---

## Phase 15: 테스트 및 모니터링 강화 ✅

### 15.1 테스트 인프라 강화 ✅
- [x] 테스트 유틸리티 (src/test/utils.tsx)
  - renderWithProviders - Provider 포함 렌더링
  - mockConsoleError, mockMatchMedia
  - mockIntersectionObserver, mockLocalStorage
  - mockFetch - fetch 모킹
- [x] 테스트 데이터 팩토리 (src/test/factories.ts)
  - createMockUser, createMockPet, createMockCat
  - createMockHealthRecord, createMockWalkRecord
  - createMockPost, createMockComment, createMockNotification
  - createMockApiResponse, createMockApiError
  - createMany - 대량 데이터 생성
- [x] 커스텀 Jest Matchers (src/test/matchers.ts)
  - toBeWithinRange, toBeValidDate
  - toBeValidEmail, toBeValidUrl, toBeValidPhone
  - toHaveBeenCalledAfter, toContainObject
- [x] MSW 테스트 통합 (jest.setup.ts)

### 15.2 PWA 기능 완성 ✅
- [x] PWA 훅 (src/hooks/usePWA.ts)
  - usePWA - 설치/업데이트/온라인 상태
  - useServiceWorkerMessage - SW 메시지 통신
  - usePushNotification - 푸시 알림 구독
- [x] PWA UI 컴포넌트 (src/components/pwa/PWAComponents.tsx)
  - InstallPrompt - 설치 프롬프트 배너
  - UpdateBanner - 업데이트 알림
  - OfflineBanner - 오프라인 상태 표시
  - NotificationPermissionBanner - 알림 권한 요청
  - PWAProvider - 통합 Provider
- [x] 감소된 모션 환경설정 지원

### 15.3 성능 모니터링 대시보드 ✅
- [x] 성능 유틸리티 (src/lib/performance.ts)
  - Web Vitals 수집 (CLS, FCP, FID, INP, LCP, TTFB)
  - 커스텀 메트릭 기록 (recordMetric, measureTiming)
  - Long Task 모니터링 (observeLongTasks)
  - 리소스 타이밍 분석 (getResourceTimings, getSlowResources)
  - 메모리 사용량 모니터링 (getMemoryUsage)
  - 네트워크 정보 (getConnectionInfo)
  - 성능 리포트 생성/전송 (generatePerformanceReport, sendPerformanceReport)
- [x] 성능 훅 (src/hooks/usePerformance.ts)
  - useWebVitals - Web Vitals 모니터링
  - usePerformanceMonitor - 종합 성능 모니터링
  - useRenderCount - 렌더링 횟수 추적
  - useComponentTiming - 컴포넌트 타이밍 측정
  - useAsyncTiming - 비동기 작업 타이밍
  - useFrameRate - FPS 모니터링

### 15.4 CI/CD 파이프라인 강화 ✅
- [x] CI 워크플로우 개선 (.github/workflows/ci.yml)
  - Lint & TypeScript 체크
  - 유닛 테스트 + 커버리지
  - 빌드 + 번들 분석
  - E2E 테스트 (Playwright)
  - 보안 감사 (npm audit)
  - Lighthouse CI (PR에서 실행)
- [x] Lighthouse CI 설정 (lighthouserc.json)
  - Performance: 최소 80점
  - Accessibility: 최소 90점
  - Best Practices: 최소 90점
  - SEO: 최소 90점
  - Core Web Vitals 임계값 설정
- [x] Deploy 워크플로우 (.github/workflows/deploy.yml)
- [x] PR Check 워크플로우 (.github/workflows/pr-check.yml)
- [x] Storybook 워크플로우 (.github/workflows/storybook.yml)

---

## Phase 16: 고급 기능 및 확장 ✅

### 16.1 성능 대시보드 UI ✅
- [x] PerformanceDashboard 컴포넌트 (src/components/dashboard/PerformanceDashboard.tsx)
  - Core Web Vitals 시각화 (LCP, FCP, CLS, INP, TTFB)
  - System Metrics 표시 (FPS, Memory, Long Tasks, Connection)
  - 실시간 성능 히스토리 차트
  - Resource Timing 분석 (상위 10개 느린 리소스)
- [x] 관리자 성능 페이지 (src/app/admin/performance/page.tsx)
- [x] MetricCard - 등급별 색상 표시 (good/needs-improvement/poor)

### 16.2 실시간 기능 (WebSocket) ✅
- [x] WebSocketClient 클래스 (src/lib/websocket.ts)
  - 자동 재연결 (exponential backoff)
  - 하트비트 및 연결 상태 모니터링
  - 메시지 큐잉 (오프라인 시)
  - 타입 안전 메시지 핸들링
- [x] WebSocket 훅 (src/hooks/useWebSocket.ts)
  - useWebSocket - 기본 WebSocket 연결
  - useRealTimeNotifications - 실시간 알림
  - useRealTimeChat - 실시간 채팅
  - usePresence - 접속 상태 관리
  - useWebSocketHealth - 연결 상태 모니터링
- [x] 실시간 UI 컴포넌트 (src/components/realtime/)
  - WebSocketProvider - Context Provider
  - ConnectionStatus - 연결 상태 표시
  - RealtimeNotifications - 실시간 알림 UI
  - PresenceIndicator - 접속 상태 표시
  - TypingIndicator - 타이핑 표시

### 16.3 분석 시스템 ✅
- [x] Analytics 클래스 (src/lib/analytics.ts)
  - 페이지 추적 (page)
  - 이벤트 추적 (track)
  - 사용자 식별 (identify)
  - 타이밍 측정 (time)
  - 배치 전송 및 Beacon API 지원
  - Do Not Track 존중
- [x] Analytics 훅 (src/hooks/useAnalytics.ts)
  - usePageTracking - 자동 페이지 추적
  - useAnalytics - 분석 함수 접근
  - useTrackEvent - 이벤트 추적
  - useTrackOnMount - 마운트 시 추적
  - useTrackTiming - 타이밍 측정
  - useScrollDepth - 스크롤 깊이 추적
  - useExitIntent - 이탈 의도 감지
  - useSessionDuration - 세션 지속 시간

### 16.4 Feature Flags ✅
- [x] FeatureFlagManager (src/lib/featureFlags.ts)
  - 기능 활성화/비활성화
  - 점진적 롤아웃 (percentageRollout)
  - 사용자 타겟팅 (targetUsers)
  - 환경별 활성화 (enabledEnvironments)
  - 로컬 오버라이드 (개발/테스트용)
  - 실시간 업데이트 구독
- [x] Feature Flag 훅 (src/hooks/useFeatureFlags.ts)
  - useFeatureFlag - 플래그 상태 조회
  - useFeatureEnabled - 활성화 여부
  - useFeatureValue - 플래그 값
  - useFeatureVariant - A/B 테스트 변형
  - useAllFeatureFlags - 전체 플래그
  - useFeatureFlagOverrides - 오버라이드 관리
  - useFeatureFlagContext - 컨텍스트 훅

### 16.5 API 버저닝 ✅
- [x] API 버저닝 시스템 (src/lib/apiVersioning.ts)
  - 버전 추출 (URL 경로, 헤더, 쿼리 파라미터)
  - 버전별 핸들러 라우팅 (createVersionedHandler)
  - Deprecated 버전 경고 헤더
  - 버전화된 응답 형식 (success, data, meta)
  - v1 → v2 데이터 변환 유틸리티
- [x] 미들웨어 지원 (apiVersioningMiddleware)
- [x] 지원 버전: v1 (deprecated), v2 (current)

### 16.6 고급 캐싱 ✅
- [x] MemoryCache 클래스 (src/lib/cache.ts)
  - TTL (Time to Live) 지원
  - LRU (Least Recently Used) 제거
  - 태그 기반 무효화 (invalidateByTag)
  - 패턴 기반 무효화 (invalidateByPattern)
  - Stale-While-Revalidate 패턴
  - 캐시 통계 (hits, misses, hitRate)
  - 이벤트 구독 시스템
  - 요청 중복 제거 (dedupe)
- [x] 캐시 훅 (src/hooks/useCache.ts)
  - useCachedValue - 캐시된 값 조회
  - useCacheStats - 캐시 통계
  - useCacheInvalidation - 캐시 무효화
  - useSWRLike - SWR 스타일 데이터 페칭
  - usePreload - 데이터 사전 로드
  - useCacheSubscription - 캐시 이벤트 구독
  - useOptimisticUpdate - 낙관적 업데이트
- [x] ISR 유틸리티 (revalidatePath, revalidateTag)

---

## 실행 명령어

```bash
# 개발 서버
npm run dev

# 테스트
npm run test              # 유닛 테스트
npm run test:e2e          # E2E 테스트
npm run test:e2e:ui       # E2E UI 모드

# 빌드
npm run build
npm run analyze           # 번들 분석

# 스토리북
npm run storybook         # 개발 모드
npm run build-storybook   # 정적 빌드
```

---

## 참고 사항

- 빌드 검증: `npm run build` 통과 필수
- 커밋 전: `npm run lint` 확인
- 스토리북: `npm run storybook`으로 컴포넌트 문서 확인
