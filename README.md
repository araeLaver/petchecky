# 펫체키 (PetChecky)

AI가 체크하는 우리 아이 건강 - 반려동물 건강 상담 서비스

## 배포 URL

https://petchecky-app.vercel.app

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini 2.5 Flash
- **Backend**: Supabase (Auth + PostgreSQL)
- **Deployment**: Vercel

## 주요 기능

### 1. AI 건강 상담
- Google Gemini 2.5 Flash 기반 반려동물 증상 분석
- 위험도 자동 판단 (안심/주의/위험)
- 대응 방법 및 병원 방문 필요성 안내

### 2. 빠른 증상 선택
- 12가지 주요 증상 버튼 제공
- 구토, 설사, 기침, 식욕부진, 무기력 등

### 3. 펫 프로필
- 반려동물 정보 등록 (이름, 종, 품종, 나이, 체중)
- 맞춤형 상담 제공

### 4. 상담 기록
- 최대 50개 상담 기록 저장
- 위험도별 분류
- 기록 조회 및 삭제

### 5. 회원 인증
- 이메일/비밀번호 회원가입
- 카카오 소셜 로그인
- Google 소셜 로그인

### 6. 데이터 저장
- 비로그인: localStorage (브라우저별)
- 로그인: Supabase DB (계정별, 동기화)

## 프로젝트 구조

```
petchecky-app/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # AI 채팅 API
│   │   ├── auth/callback/       # OAuth 콜백
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── page.tsx             # 메인 페이지
│   │   └── globals.css
│   ├── components/
│   │   ├── AuthModal.tsx        # 로그인/회원가입 모달
│   │   ├── ChatHistory.tsx      # 상담 기록
│   │   ├── ChatInterface.tsx    # 채팅 인터페이스
│   │   ├── Header.tsx           # 헤더
│   │   ├── LandingPage.tsx      # 랜딩 페이지
│   │   ├── PetProfileModal.tsx  # 펫 등록 모달
│   │   └── QuickSymptoms.tsx    # 빠른 증상 선택
│   ├── contexts/
│   │   └── AuthContext.tsx      # 인증 상태 관리
│   └── lib/
│       └── supabase.ts          # Supabase 클라이언트 & DB API
├── public/
│   ├── favicon.ico
│   ├── manifest.json            # PWA 매니페스트
│   └── robots.txt
└── supabase-schema.sql          # DB 스키마
```

## 환경 변수

```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase 설정

### 1. 테이블 생성
`supabase-schema.sql` 파일을 Supabase SQL Editor에서 실행

### 2. Authentication 설정
- Site URL: `https://petchecky-app.vercel.app`
- Redirect URLs: `https://petchecky-app.vercel.app/auth/callback`

### 3. OAuth Provider (선택)
- Google: Google Cloud Console에서 OAuth 클라이언트 생성
- Kakao: Kakao Developers에서 앱 생성

## 로컬 개발

```bash
cd petchecky-app
npm install
npm run dev
```

## 빌드 및 배포

```bash
npm run build
npx vercel --prod
```

## 커밋 히스토리

1. `feat: 펫체키 AI 반려동물 건강 상담 서비스 초기 버전`
   - Next.js + React + TypeScript 기반 구축
   - Gemini AI 채팅 기능
   - 펫 프로필 등록

2. `feat: 서비스 기능 대폭 강화`
   - 랜딩 페이지 추가
   - 빠른 증상 선택 (12가지)
   - 상담 기록 저장/조회
   - SEO 최적화 (Open Graph, Twitter Card)
   - PWA 지원

3. `feat: Supabase 회원 인증 기능 추가`
   - 이메일/비밀번호 인증
   - Google OAuth 로그인
   - AuthContext 상태 관리

4. `feat: 카카오 로그인 버튼 추가`
   - 카카오 소셜 로그인 UI

5. `feat: 펫/상담기록 Supabase DB 연동`
   - 로그인 시 DB 저장
   - 비로그인 시 localStorage
   - 자동 데이터 마이그레이션

## 라이선스

Private Project
