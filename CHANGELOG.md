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
        │   │   └── chat/
        │   │       └── route.ts
        │   └── auth/
        │       └── callback/
        │           └── route.ts
        ├── components/
        │   ├── AuthModal.tsx
        │   ├── ChatHistory.tsx
        │   ├── ChatInterface.tsx
        │   ├── Header.tsx
        │   ├── LandingPage.tsx
        │   ├── PetProfileModal.tsx
        │   └── QuickSymptoms.tsx
        ├── contexts/
        │   └── AuthContext.tsx
        └── lib/
            └── supabase.ts
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

---

## 외부 서비스 설정

### Vercel
- 프로젝트: petchecky-app
- 환경 변수: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

### Supabase
- Authentication > Providers: Google, Kakao 활성화
- Authentication > URL Configuration:
  - Site URL: https://petchecky-app.vercel.app
  - Redirect URLs: https://petchecky-app.vercel.app/auth/callback
- SQL Editor: supabase-schema.sql 실행

### Google Cloud Console (Google OAuth)
- OAuth 동의 화면 설정
- OAuth 클라이언트 ID 생성
- Redirect URI: https://bgdijxooqdixingfyshb.supabase.co/auth/v1/callback

### Kakao Developers (Kakao OAuth)
- 애플리케이션 생성
- 카카오 로그인 활성화
- Redirect URI: https://bgdijxooqdixingfyshb.supabase.co/auth/v1/callback

---

## 향후 개선 사항

1. **다중 펫 지원**: 여러 반려동물 등록 및 선택
2. **이미지 업로드**: 증상 사진 첨부 기능
3. **알림 기능**: 정기 건강 체크 리마인더
4. **병원 연동**: 주변 동물병원 검색 및 예약
5. **커뮤니티**: 보호자 간 정보 공유
