export const ko = {
  // Common
  common: {
    appName: "펫체키",
    tagline: "AI가 체크하는 우리 아이 건강",
    loading: "로딩 중...",
    error: "오류가 발생했습니다",
    retry: "다시 시도",
    close: "닫기",
    save: "저장",
    cancel: "취소",
    confirm: "확인",
    delete: "삭제",
    edit: "수정",
    back: "뒤로",
    next: "다음",
    submit: "제출",
    send: "전송",
  },

  // Navigation
  nav: {
    home: "홈",
    chat: "상담",
    history: "기록",
    profile: "프로필",
    settings: "설정",
    community: "커뮤니티",
    subscription: "구독",
  },

  // Landing Page
  landing: {
    heroDescription: "반려동물이 아파 보일 때, 걱정되는 증상이 있을 때\nAI가 증상을 분석하고 적절한 대응 방법을 알려드립니다.",
    startChat: "💬 상담 시작하기",
    registerPet: "🐾 우리 아이 등록하기",
    chatHistory: "📋 상담 기록",
    healthReport: "📊 건강 리포트",
    symptomsQuestion: "이런 증상이 있으신가요?",
    featuresTitle: "펫체키가 도와드려요",
  },

  // Features
  features: {
    aiAnalysis: {
      title: "AI 증상 분석",
      description: "반려동물의 증상을 입력하면 AI가 가능한 원인과 대응 방법을 안내해드려요.",
    },
    riskAssessment: {
      title: "위험도 자동 판단",
      description: "증상의 심각도를 분석하여 병원 방문이 필요한지 알려드려요.",
    },
    chatHistory: {
      title: "상담 기록 저장",
      description: "이전 상담 내역을 저장하고, 언제든 다시 확인할 수 있어요.",
    },
    community: {
      title: "커뮤니티",
      description: "다른 반려인들과 정보를 공유하고 소통할 수 있어요.",
    },
  },

  // Symptoms
  symptoms: {
    vomiting: "구토",
    diarrhea: "설사",
    lossOfAppetite: "식욕부진",
    fever: "발열",
    limping: "절뚝거림",
    lethargy: "무기력",
  },

  // Pet Profile
  pet: {
    dog: "강아지",
    cat: "고양이",
    name: "이름",
    species: "종류",
    breed: "품종",
    age: "나이",
    weight: "체중",
    years: "세",
    kg: "kg",
    register: "등록하기",
    edit: "수정하기",
    delete: "삭제하기",
    selectPet: "반려동물 선택",
    addPet: "새 반려동물 추가",
  },

  // Chat
  chat: {
    welcome: "안녕하세요! {petName}의 건강을 체크해드릴게요. 🐾\n\n어떤 증상이 있나요? 자세히 말씀해주시면 더 정확한 분석이 가능해요.",
    placeholder: "증상을 입력하세요...",
    imagePlaceholder: "사진에 대해 설명해주세요...",
    consulting: "건강 상담 중",
    disclaimer: "* AI 상담은 참고용이며, 정확한 진단은 수의사와 상담하세요",
    imageAnalysis: "📷 이미지 분석 가능",
    networkError: "네트워크 연결을 확인해주세요. 인터넷이 연결되어 있다면 잠시 후 다시 시도해주세요.",
  },

  // Severity
  severity: {
    high: "🚨 위험 - 병원 방문 권장",
    medium: "⚠️ 주의 - 경과 관찰 필요",
    low: "✅ 안심 - 일반적인 증상",
  },

  // Hospital
  hospital: {
    find: "🏥 가까운 동물병원 찾기",
    loading: "병원을 검색하는 중...",
    noResults: "주변에 동물병원이 없습니다",
    call: "전화",
    directions: "길찾기",
    reserve: "예약",
    distance: "거리",
    highSeverityTitle: "즉시 병원 방문을 권장합니다",
    highSeverityDesc: "심각한 증상이 의심됩니다. 가까운 동물병원을 방문해주세요.",
    mediumSeverityTitle: "병원 방문을 고려해주세요",
    mediumSeverityDesc: "증상이 지속된다면 수의사 상담을 권장합니다.",
    disclaimer: "* 영업시간 및 진료 가능 여부는 병원에 직접 문의해주세요",
  },

  // Reservation
  reservation: {
    title: "예약 요청",
    symptoms: "증상 및 상담 내용",
    preferredDate: "희망 날짜",
    preferredTime: "희망 시간",
    contactPhone: "연락처",
    notes: "추가 요청사항 (선택)",
    submit: "예약 요청하기",
    success: "예약 요청이 완료되었습니다!",
    notice: "* 예약 확정은 병원에서 연락드립니다",
  },

  // Vet Consultation
  vetConsultation: {
    title: "전문 수의사와 실시간 상담",
    subtitle: "24시간 전문 수의사가 대기하고 있습니다",
    startConsult: "상담 시작하기",
    normalType: "일반 상담",
    urgentType: "긴급 상담",
    waitingMessage: "수의사 연결 중입니다...",
    connected: "수의사가 연결되었습니다",
  },

  // Community
  community: {
    title: "커뮤니티",
    writePost: "글쓰기",
    categories: {
      all: "전체",
      question: "질문",
      tip: "꿀팁",
      daily: "일상",
      review: "후기",
    },
    postTitle: "제목",
    postContent: "내용",
    likes: "좋아요",
    comments: "댓글",
  },

  // Subscription
  subscription: {
    free: "무료",
    premium: "프리미엄",
    premiumPlus: "프리미엄+",
    monthlyLimit: "월 {count}회 무료 상담",
    unlimited: "무제한 상담",
    imageAnalysis: "이미지 분석",
    prioritySupport: "우선 지원",
    subscribe: "구독하기",
    limitExceeded: "이번 달 무료 상담 횟수를 모두 사용했어요",
    limitExceededDesc: "프리미엄 구독으로 무제한 AI 상담을 이용해보세요!",
    viewPremium: "프리미엄 둘러보기",
    resetNotice: "다음 달 1일에 무료 횟수가 초기화됩니다",
  },

  // Health Report
  healthReport: {
    title: "건강 리포트",
    downloadPdf: "PDF 다운로드",
    petInfo: "반려동물 정보",
    consultHistory: "상담 기록",
    monthlyStats: "월별 통계",
    noData: "표시할 데이터가 없습니다",
  },

  // Notifications
  notifications: {
    title: "알림 설정",
    enable: "알림 받기",
    disable: "알림 끄기",
    permissionDenied: "알림 권한이 거부되었습니다",
    notSupported: "이 브라우저는 알림을 지원하지 않습니다",
  },

  // Disclaimer
  disclaimer: {
    main: "⚠️ 펫체키는 참고용 정보를 제공하며, 정확한 진단은 수의사와 상담하세요.",
    emergency: "응급 상황 시 가까운 동물병원을 방문해주세요.",
  },

  // Footer
  footer: {
    copyright: "© 2024 펫체키. AI 반려동물 건강 상담 서비스.",
  },
};

export type TranslationKeys = typeof ko;
