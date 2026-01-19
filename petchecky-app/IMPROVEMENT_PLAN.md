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

## Phase 4: 성능 최적화 및 모니터링 (다음 진행)

### 4.1 이미지 최적화
- [ ] Next.js Image 컴포넌트 활용 확대
- [ ] 이미지 lazy loading 적용
- [ ] WebP/AVIF 포맷 자동 변환
- [ ] 썸네일 생성 로직 추가

### 4.2 번들 최적화
- [ ] 동적 import로 코드 스플리팅
- [ ] 사용하지 않는 의존성 제거
- [ ] Tree shaking 최적화
- [ ] Bundle Analyzer로 번들 크기 분석 및 개선

### 4.3 캐싱 전략
- [ ] React Query 캐싱 최적화
- [ ] Service Worker 캐싱 전략 개선
- [ ] API 응답 캐싱 (stale-while-revalidate)
- [ ] 정적 자산 캐싱 헤더 설정

### 4.4 모니터링 강화
- [ ] Sentry 에러 트래킹 설정 개선
- [ ] 성능 메트릭 수집 (Web Vitals)
- [ ] 사용자 행동 분석 (이벤트 로깅)
- [ ] 알림 설정 (에러 임계치)

### 4.5 데이터베이스 최적화
- [ ] Supabase 쿼리 최적화
- [ ] 인덱스 추가
- [ ] N+1 쿼리 문제 해결
- [ ] 페이지네이션 개선

---

## Phase 5: 기능 고도화 (예정)

### 5.1 오프라인 지원
- [ ] IndexedDB 활용 오프라인 데이터 저장
- [ ] 오프라인 상태 UI 개선
- [ ] 동기화 충돌 해결 로직

### 5.2 알림 시스템
- [ ] Push Notification 구현
- [ ] 이메일 알림
- [ ] 인앱 알림 센터

### 5.3 다국어 지원 강화
- [ ] 번역 키 정리
- [ ] 누락된 번역 추가
- [ ] RTL 언어 지원

### 5.4 테스트 커버리지 확대
- [ ] 컴포넌트 테스트 추가
- [ ] API 통합 테스트
- [ ] 시각적 회귀 테스트 (Chromatic)

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
npm run storybook
```

---

## 참고 사항

- 빌드 검증: `npm run build` 통과 필수
- 커밋 전: `npm run lint` 확인
- Phase 4 예상 소요: 2-3시간
