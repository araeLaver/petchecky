# 펫체키 (PetChecky)

> AI가 체크하는 우리 아이 건강

반려동물이 아플 때, AI가 증상을 분석하고 적절한 대응 방법을 알려주는 헬스케어 서비스입니다.

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 펫체키 (PetChecky) |
| 슬로건 | AI가 체크하는 우리 아이 건강 |
| 타겟 | 반려동물 보호자 1,500만명 (국내) |
| 핵심 기능 | AI 증상 상담 → 위험도 판단 → 대응 가이드 |

---

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 16 | App Router, Turbopack |
| 언어 | TypeScript | 타입 안정성 |
| 스타일링 | Tailwind CSS 4 | 유틸리티 기반 |
| AI | Google Gemini API | gemini-2.5-flash (무료) |
| 배포 | Vercel | 예정 |
| DB | Supabase | 예정 |

---

## 프로젝트 구조

```
petchecky-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts      # AI 상담 API
│   │   ├── globals.css           # 전역 스타일
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   └── page.tsx              # 메인 페이지
│   └── components/
│       ├── Header.tsx            # 헤더 컴포넌트
│       ├── ChatInterface.tsx     # 채팅 UI
│       └── PetProfileModal.tsx   # 펫 프로필 등록 모달
├── .env.local                    # 환경 변수 (API 키)
├── .env.example                  # 환경 변수 예시
├── package.json
└── README.md
```

---

## 구현된 기능

### 1. 펫 프로필 등록
- 이름, 종류 (강아지/고양이), 품종, 나이, 체중 입력
- 로컬 상태로 관리 (새로고침 시 초기화)

### 2. AI 증상 상담
- Google Gemini 2.5 Flash 모델 사용
- 반려동물 정보 기반 맞춤 상담
- 대화 히스토리 유지

### 3. 위험도 자동 판단
- 응답 내용 키워드 분석
- 3단계 분류: 안심(녹색) / 주의(노랑) / 위험(빨강)

```typescript
// 위험도 판단 로직
const highRisk = ["응급", "즉시 병원", "호흡곤란", "경련", "출혈", "중독"];
const mediumRisk = ["병원 방문", "수의사 상담", "구토", "설사", "절뚝"];
```

---

## 설치 및 실행

### 1. 의존성 설치

```bash
cd petchecky-app
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```env
# Google Gemini API Key
# https://aistudio.google.com/app/apikey 에서 무료 발급
GEMINI_API_KEY=your_api_key_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

→ http://localhost:3000 에서 확인

### 4. 프로덕션 빌드

```bash
npm run build
npm run start
```

---

## API 엔드포인트

### POST /api/chat

AI 증상 상담 요청

**Request Body:**
```json
{
  "message": "우리 강아지가 구토를 해요",
  "petProfile": {
    "name": "초코",
    "species": "dog",
    "breed": "말티즈",
    "age": 3,
    "weight": 4.5
  },
  "history": []
}
```

**Response:**
```json
{
  "message": "아이고, 초코가 구토를 했군요...",
  "severity": "medium"
}
```

---

## 수익 모델 (계획)

| 모델 | 가격 | 설명 |
|------|------|------|
| 무료 | 0원 | AI 상담 3회/월 |
| 프리미엄 | 5,900원/월 | 무제한 AI, 이미지 분석, 리포트 |
| 프리미엄+ | 9,900원/월 | 위 전체 + 수의사 상담 2회/월 |

---

## 개발 로드맵

### Phase 1: MVP (완료)
- [x] Next.js 프로젝트 세팅
- [x] 펫 프로필 등록
- [x] AI 증상 상담 (Gemini)
- [x] 위험도 표시
- [x] 반응형 UI

### Phase 2: 사용자 관리 (예정)
- [ ] Supabase 연동
- [ ] 회원가입/로그인
- [ ] 상담 이력 저장
- [ ] 무료 사용량 제한

### Phase 3: 수익화 (예정)
- [ ] 프리미엄 구독 (토스페이먼츠)
- [ ] 결제 관리

### Phase 4: 기능 확장 (예정)
- [ ] 병원 추천 (지도 API)
- [ ] 이미지 분석 (Gemini Vision)
- [ ] 수의사 상담 연결

---

## 비용 구조

### 현재 (MVP)
| 항목 | 월 비용 |
|------|---------|
| Vercel | 0원 (Hobby) |
| Gemini API | 0원 (무료 티어) |
| **합계** | **0원** |

### 확장 시
| 항목 | 월 비용 |
|------|---------|
| Vercel Pro | $20 |
| Supabase | 0원 (무료 티어) |
| Gemini API | 사용량 기반 |

---

## 라이선스

Private - All Rights Reserved
