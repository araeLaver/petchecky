# PetChecky 개발 계획

## 현재 구현된 기능 (28개 페이지)

### AI/상담
- `/` - AI 증상 분석 챗봇
- `/image-analysis` - 이미지 기반 증상 분석
- `/vet-consultation` - 수의사 영상 상담
- `/health-insights` - AI 건강 인사이트

### 건강관리
- `/health-tracking` - 체중/건강 기록
- `/vaccination` - 예방접종 관리
- `/medication` - 약물/처방전 관리
- `/vet-records` - 수의사 진료 기록
- `/allergy` - 알레르기 & 식이 제한

### 일상관리
- `/walk` - 산책 기록
- `/training` - 행동 훈련 트래커
- `/diet` - 식이요법 & 사료 관리
- `/reminders` - 알림/리마인더
- `/calendar` - 일정 캘린더

### 소셜/커뮤니티
- `/community` - 커뮤니티
- `/messages` - 1:1 메시지
- `/hospital-review` - 병원 리뷰

### 부가기능
- `/gallery` - 펫 갤러리
- `/qr-pet-id` - QR 펫 ID
- `/pet-sitter` - 펫시터 찾기
- `/emergency` - 응급 정보
- `/insurance` - 펫 보험
- `/expense` - 비용 관리

### 시스템
- `/subscription` - 프리미엄 구독
- `/settings/backup` - 데이터 백업

---

## 다음 개발 계획 (Phase 7)

### 1. 펫 일기 (`/pet-diary`)
- 매일 반려동물과의 추억 기록
- 사진/텍스트 일기 작성
- 성장 타임라인
- 기념일 자동 알림

### 2. 펫 프렌들리 맵 (`/pet-map`)
- 동물병원 위치 검색
- 펫카페, 펫 동반 식당
- 반려동물 동반 가능 장소
- 사용자 리뷰 및 평점

### 3. 실종 신고 시스템 (`/lost-pet`)
- 반려동물 실종 신고
- 목격 제보 네트워크
- 위치 기반 알림
- QR 펫ID 연동

### 4. 입양 정보 (`/adoption`)
- 유기동물 입양 정보
- 보호소 연동
- 입양 절차 안내
- 입양 후 케어 가이드

### 5. 펫 용품 추천 (`/shop`)
- AI 기반 맞춤 사료 추천
- 건강 상태별 용품 추천
- 쇼핑몰 연동
- 가격 비교

### 6. 멀티펫 대시보드 (`/dashboard`)
- 여러 반려동물 통합 관리
- 건강 상태 요약
- 일정/알림 통합 뷰
- 비용 통계

---

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (Auth, Database)
- **AI**: Google Gemini API
- **Payment**: 토스페이먼츠
- **i18n**: 한국어, 영어, 일본어

---

## 최근 업데이트

### 2024-01 (Phase 6)
- 약물/처방전 관리 시스템
- 행동 훈련 트래커
- 알레르기 & 식이 제한 관리
- 펫 비용 관리
- 수의사 진료 기록 관리
- AI 기반 건강 예측 알림
