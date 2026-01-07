# 펫체키 개발 작업 내역

## 프로젝트 개요
- **프로젝트명**: 펫체키 (PetChecky)
- **설명**: AI 기반 반려동물 건강 상담 서비스
- **개발 기간**: 2024.12.30
- **배포 URL**: https://petchecky-app.vercel.app
- **GitHub**: https://github.com/araeLaver/petchecky

---

## 1단계: 초기 버전 구축

### 기술 스택 선정
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Google Gemini 2.5 Flash API

### 구현 기능
- 프로젝트 초기 설정 (create-next-app)
- 기본 레이아웃 및 스타일링
- 펫 프로필 등록 모달
- AI 채팅 인터페이스
- Gemini API 연동 (/api/chat)

### 생성 파일
- `src/app/page.tsx` - 메인 페이지
- `src/app/layout.tsx` - 루트 레이아웃
- `src/app/api/chat/route.ts` - AI 채팅 API
- `src/components/ChatInterface.tsx` - 채팅 UI
- `src/components/PetProfileModal.tsx` - 펫 등록 모달
- `src/components/Header.tsx` - 헤더

---

## 2단계: 서비스 기능 강화

### 추가 기능
1. **랜딩 페이지**: 서비스 소개 및 CTA 버튼
2. **빠른 증상 선택**: 12가지 주요 증상 버튼
   - 구토, 설사, 기침, 재채기
   - 식욕부진, 물 많이 마심, 무기력, 발열
   - 피부문제, 눈/귀 이상, 절뚝거림, 호흡곤란
3. **상담 기록**: 최대 50개 저장, 조회/삭제
4. **위험도 분석**: low/medium/high 자동 판단

### SEO 최적화
- Open Graph 메타태그
- Twitter Card
- robots.txt
- manifest.json (PWA)

### 데이터 영속성
- LocalStorage 저장
- 펫 프로필 유지
- 채팅 기록 유지

### 생성 파일
- `src/components/LandingPage.tsx` - 랜딩 페이지
- `src/components/QuickSymptoms.tsx` - 빠른 증상 선택
- `src/components/ChatHistory.tsx` - 상담 기록
- `public/manifest.json` - PWA 매니페스트
- `public/robots.txt` - 검색엔진 설정

---

## 3단계: Vercel 배포

### 배포 설정
- Vercel 프로젝트 연결
- 환경 변수 설정
  - `GEMINI_API_KEY`

### 배포 URL
- Production: https://petchecky-app.vercel.app

---

## 4단계: Supabase 회원 인증

### Supabase 프로젝트 생성
- URL: https://bgdijxooqdixingfyshb.supabase.co

### 인증 기능 구현
1. **이메일/비밀번호 인증**
   - 회원가입 (이메일 인증)
   - 로그인/로그아웃

2. **소셜 로그인**
   - Google OAuth
   - Kakao OAuth

### 생성 파일
- `src/lib/supabase.ts` - Supabase 클라이언트
- `src/contexts/AuthContext.tsx` - 인증 상태 관리
- `src/components/AuthModal.tsx` - 로그인/회원가입 모달
- `src/app/auth/callback/route.ts` - OAuth 콜백 처리

### 환경 변수 추가
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 5단계: 데이터베이스 연동

### DB 스키마 설계

#### pets 테이블
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(50),
  species VARCHAR(10), -- 'dog' | 'cat'
  breed VARCHAR(50),
  age INTEGER,
  weight DECIMAL(5,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### chat_records 테이블
```sql
CREATE TABLE chat_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  pet_id UUID REFERENCES pets(id),
  pet_name VARCHAR(50),
  pet_species VARCHAR(10),
  preview TEXT,
  severity VARCHAR(10), -- 'low' | 'medium' | 'high'
  messages JSONB,
  created_at TIMESTAMP
);
```

### 보안 설정 (RLS)
- 각 사용자는 본인 데이터만 접근 가능
- SELECT, INSERT, UPDATE, DELETE 정책 설정

### 데이터 저장 로직
| 상태 | 저장 위치 |
|------|----------|
| 비로그인 | localStorage |
| 로그인 | Supabase DB |

### 자동 마이그레이션
- 첫 로그인 시 localStorage 데이터를 DB로 이전

### 생성/수정 파일
- `supabase-schema.sql` - DB 스키마 SQL
- `src/lib/supabase.ts` - CRUD 함수 추가
- `src/app/page.tsx` - DB 연동 로직

---

## 6단계: 무료 사용량 제한

### 기능 개요
- 비로그인/무료 사용자 월 20회 상담 제한
- 로그인 시 사용량 추적 및 표시

### 구현 내용
1. **usage_records 테이블**
   - `user_id`, `year_month`, `usage_count` 관리
   - 월별 사용량 자동 리셋

2. **사용량 API**
   - `getUsage()`: 현재 월 사용량 조회
   - `incrementUsage()`: 상담 시 사용량 증가
   - `getRemainingUsage()`: 남은 횟수 계산
   - `canUseService()`: 사용 가능 여부 체크

3. **UI 표시**
   - Header에 사용량 표시 (예: "15/20")
   - 한도 초과 시 프리미엄 안내

### 생성/수정 파일
- `src/lib/supabase.ts` - 사용량 관리 API 추가
- `src/components/Header.tsx` - 사용량 표시 UI
- `src/app/page.tsx` - usageCount 상태 관리

---

## 7단계: 카카오맵 동물병원 추천

### 기능 개요
- 위험도별 동물병원 방문 안내
- 현재 위치 기반 주변 병원 검색
- 지도/목록 뷰 제공

### 구현 내용
1. **위치 정보**
   - `useGeolocation` 훅으로 현재 위치 획득
   - Geolocation API 사용

2. **카카오맵 연동**
   - Kakao Maps SDK 로드
   - Places API로 "동물병원" 키워드 검색
   - 반경 5km 내 최대 15개 병원 표시

3. **위험도별 안내**
   - `high`: 🚨 즉시 방문 권장
   - `medium`: ⚠️ 방문 고려
   - `low`: ℹ️ 참고용 정보

4. **UI/UX**
   - 목록/지도 탭 전환 (모바일)
   - 병원 선택 시 지도 마커 하이라이트
   - 전화번호, 주소, 카카오맵 링크 제공

### 생성 파일
- `src/hooks/useGeolocation.ts` - 위치 정보 훅
- `src/types/kakao.d.ts` - 카카오맵 타입 정의
- `src/components/hospital/HospitalRecommendation.tsx` - 메인 컴포넌트
- `src/components/hospital/HospitalMap.tsx` - 지도 컴포넌트
- `src/components/hospital/HospitalList.tsx` - 목록 컴포넌트

### 환경 설정
- 카카오 개발자 콘솔에서 JavaScript 키 발급
- `layout.tsx`에 카카오맵 SDK 스크립트 추가

---

## 8단계: 토스페이먼츠 프리미엄 구독

### 기능 개요
- 정기 결제(빌링) 기반 구독 서비스
- 3가지 플랜: 무료 / 프리미엄 / 프리미엄+

### 요금제
| 플랜 | 가격 | 주요 혜택 |
|------|------|----------|
| 무료 | 0원 | 월 20회 AI 상담 |
| 프리미엄 | 5,900원/월 | 무제한 AI 상담, 우선 응답 |
| 프리미엄+ | 9,900원/월 | 무제한 상담, 이미지 분석, 수의사 상담 월 2회 |

### 구현 내용
1. **토스페이먼츠 Billing API**
   - 카드 등록 → 빌링키 발급
   - 빌링키로 정기 결제 실행
   - 결제 취소 API

2. **DB 스키마**
   - `subscriptions`: 구독 정보
   - `payments`: 결제 내역

3. **API 엔드포인트**
   - `POST /api/billing/confirm`: 빌링키 발급 및 첫 결제
   - `GET /api/subscription`: 구독 정보 조회
   - `DELETE /api/subscription`: 구독 해지

4. **Context & 상태 관리**
   - `SubscriptionContext`: 전역 구독 상태
   - `isPremium`, `isPremiumPlus` 플래그

5. **UI 컴포넌트**
   - 요금제 선택 페이지
   - 결제 모달 (토스페이먼츠 위젯)
   - 구독 상태 표시
   - 결제 성공/실패 페이지

### 생성 파일
- `src/types/subscription.ts` - 구독/결제 타입 정의
- `src/lib/toss.ts` - 토스페이먼츠 API 유틸리티
- `src/contexts/SubscriptionContext.tsx` - 구독 상태 관리
- `src/app/api/billing/confirm/route.ts` - 빌링 확인 API
- `src/app/api/subscription/route.ts` - 구독 관리 API
- `src/app/subscription/page.tsx` - 요금제 페이지
- `src/app/subscription/success/page.tsx` - 결제 성공
- `src/app/subscription/fail/page.tsx` - 결제 실패
- `src/components/subscription/PricingPlans.tsx` - 요금제 카드
- `src/components/subscription/BillingModal.tsx` - 결제 모달
- `src/components/subscription/SubscriptionStatus.tsx` - 구독 상태

### 환경 변수 추가
- `TOSS_CLIENT_KEY` - 토스페이먼츠 클라이언트 키
- `TOSS_SECRET_KEY` - 토스페이먼츠 시크릿 키

---

## 최종 파일 구조

```
petchecky/
├── README.md
├── CHANGELOG.md
└── petchecky-app/
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── supabase-schema.sql
    ├── public/
    │   ├── favicon.ico
    │   ├── manifest.json
    │   └── robots.txt
    └── src/
        ├── app/
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── api/
        │   │   ├── chat/
        │   │   │   └── route.ts
        │   │   ├── billing/
        │   │   │   └── confirm/
        │   │   │       └── route.ts
        │   │   └── subscription/
        │   │       └── route.ts
        │   ├── auth/
        │   │   └── callback/
        │   │       └── route.ts
        │   └── subscription/
        │       ├── page.tsx
        │       ├── success/
        │       │   └── page.tsx
        │       └── fail/
        │           └── page.tsx
        ├── components/
        │   ├── AuthModal.tsx
        │   ├── ChatHistory.tsx
        │   ├── ChatInterface.tsx
        │   ├── Header.tsx
        │   ├── LandingPage.tsx
        │   ├── PetProfileModal.tsx
        │   ├── QuickSymptoms.tsx
        │   ├── hospital/
        │   │   ├── HospitalRecommendation.tsx
        │   │   ├── HospitalMap.tsx
        │   │   └── HospitalList.tsx
        │   └── subscription/
        │       ├── PricingPlans.tsx
        │       ├── BillingModal.tsx
        │       └── SubscriptionStatus.tsx
        ├── contexts/
        │   ├── AuthContext.tsx
        │   └── SubscriptionContext.tsx
        ├── hooks/
        │   └── useGeolocation.ts
        ├── types/
        │   ├── kakao.d.ts
        │   └── subscription.ts
        └── lib/
            ├── supabase.ts
            └── toss.ts
```

---

## 커밋 히스토리

| # | 커밋 해시 | 메시지 |
|---|----------|--------|
| 1 | 1f8d2bc | feat: 펫체키 AI 반려동물 건강 상담 서비스 초기 버전 |
| 2 | 11789ff | feat: 서비스 기능 대폭 강화 |
| 3 | 59a8f4e | feat: Supabase 회원 인증 기능 추가 |
| 4 | 60a731d | feat: 카카오 로그인 버튼 추가 |
| 5 | 6af0c2f | feat: 펫/상담기록 Supabase DB 연동 |
| 6 | 1582f66 | docs: 프로젝트 README 작성 |
| 7 | f4045fc | docs: 전체 개발 작업 내역 정리 (CHANGELOG.md) |
| 8 | 4f3cfb5 | feat: 무료 사용량 제한 기능 추가 (월 20회) |
| 9 | 32f5754 | feat: 카카오맵 기반 동물병원 추천 기능 추가 |
| 10 | 7eda131 | feat: 토스페이먼츠 프리미엄 구독 결제 기능 구현 |

---

## 외부 서비스 설정

### Vercel
- 프로젝트: petchecky-app
- 환경 변수:
  - `GEMINI_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_KAKAO_MAP_KEY`
  - `TOSS_CLIENT_KEY`
  - `TOSS_SECRET_KEY`

### Supabase
- Authentication > Providers: Google, Kakao 활성화
- Authentication > URL Configuration:
  - Site URL: https://petchecky-app.vercel.app
  - Redirect URLs: https://petchecky-app.vercel.app/auth/callback
- SQL Editor: supabase-schema.sql 실행
- 추가 테이블: `usage_records`, `subscriptions`, `payments`

### Google Cloud Console (Google OAuth)
- OAuth 동의 화면 설정
- OAuth 클라이언트 ID 생성
- Redirect URI: https://bgdijxooqdixingfyshb.supabase.co/auth/v1/callback

### Kakao Developers
**카카오 로그인 (OAuth)**
- 애플리케이션 생성
- 카카오 로그인 활성화
- Redirect URI: https://bgdijxooqdixingfyshb.supabase.co/auth/v1/callback

**카카오맵 API**
- 플랫폼 > Web > 사이트 도메인 등록
- 앱 키 > JavaScript 키 사용
- 도메인: https://petchecky-app.vercel.app

### 토스페이먼츠
- 개발자센터: https://developers.tosspayments.com
- 상점 등록 및 API 키 발급
- 결제 방식: 자동결제 (빌링)
- 테스트/라이브 키 구분하여 환경 변수 설정

---

## 향후 개선 사항

1. **다중 펫 지원**: 여러 반려동물 등록 및 선택
2. **이미지 분석**: 증상 사진 AI 분석 (프리미엄+ 기능)
3. **알림 기능**: 정기 건강 체크 리마인더 (Push Notification)
4. **수의사 상담 연동**: 실제 수의사 채팅 상담 (프리미엄+ 기능)
5. **병원 예약**: 동물병원 예약 시스템 연동
6. **커뮤니티**: 보호자 간 정보 공유 게시판
7. **건강 리포트**: 월간/연간 건강 상담 리포트 PDF 다운로드
8. **다국어 지원**: 영어, 일본어 등 다국어 UI
