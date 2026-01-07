import { TranslationKeys } from "./ko";

export const ja: TranslationKeys = {
  // Common
  common: {
    appName: "ペットチェッキー",
    tagline: "AIがチェックするペットの健康",
    loading: "読み込み中...",
    error: "エラーが発生しました",
    retry: "再試行",
    close: "閉じる",
    save: "保存",
    cancel: "キャンセル",
    confirm: "確認",
    delete: "削除",
    edit: "編集",
    back: "戻る",
    next: "次へ",
    submit: "送信",
    send: "送信",
  },

  // Navigation
  nav: {
    home: "ホーム",
    chat: "相談",
    history: "履歴",
    profile: "プロフィール",
    settings: "設定",
    community: "コミュニティ",
    subscription: "サブスク",
  },

  // Landing Page
  landing: {
    heroDescription: "ペットの具合が悪そうな時、心配な症状がある時、\nAIが症状を分析し、適切な対応方法をご案内します。",
    startChat: "💬 相談を始める",
    registerPet: "🐾 ペットを登録",
    chatHistory: "📋 相談履歴",
    healthReport: "📊 健康レポート",
    symptomsQuestion: "こんな症状はありますか？",
    featuresTitle: "ペットチェッキーがお手伝い",
  },

  // Features
  features: {
    aiAnalysis: {
      title: "AI症状分析",
      description: "ペットの症状を入力すると、AIが原因と対応方法をご案内します。",
    },
    riskAssessment: {
      title: "自動リスク判定",
      description: "症状の重症度を分析し、病院受診が必要かお知らせします。",
    },
    chatHistory: {
      title: "相談履歴の保存",
      description: "過去の相談内容を保存し、いつでも確認できます。",
    },
    community: {
      title: "コミュニティ",
      description: "他のペットオーナーと情報を共有できます。",
    },
  },

  // Symptoms
  symptoms: {
    vomiting: "嘔吐",
    diarrhea: "下痢",
    lossOfAppetite: "食欲不振",
    fever: "発熱",
    limping: "足を引きずる",
    lethargy: "元気がない",
  },

  // Pet Profile
  pet: {
    dog: "犬",
    cat: "猫",
    name: "名前",
    species: "種類",
    breed: "品種",
    age: "年齢",
    weight: "体重",
    years: "歳",
    kg: "kg",
    register: "登録",
    edit: "編集",
    delete: "削除",
    selectPet: "ペットを選択",
    addPet: "新しいペットを追加",
  },

  // Chat
  chat: {
    welcome: "こんにちは！{petName}の健康をチェックします。🐾\n\nどんな症状がありますか？詳しく教えていただければ、より正確な分析ができます。",
    placeholder: "症状を入力...",
    imagePlaceholder: "写真について説明してください...",
    consulting: "健康相談中",
    disclaimer: "* AI相談は参考情報です。正確な診断は獣医師にご相談ください。",
    imageAnalysis: "📷 画像分析可能",
    networkError: "ネットワーク接続を確認してください。接続されている場合は、しばらくしてから再試行してください。",
  },

  // Severity
  severity: {
    high: "🚨 危険 - 病院受診推奨",
    medium: "⚠️ 注意 - 経過観察必要",
    low: "✅ 安心 - 一般的な症状",
  },

  // Hospital
  hospital: {
    find: "🏥 近くの動物病院を探す",
    loading: "病院を検索中...",
    noResults: "近くに動物病院がありません",
    call: "電話",
    directions: "道案内",
    reserve: "予約",
    distance: "距離",
    highSeverityTitle: "直ちに病院受診を推奨",
    highSeverityDesc: "深刻な症状が疑われます。近くの動物病院を受診してください。",
    mediumSeverityTitle: "病院受診をご検討ください",
    mediumSeverityDesc: "症状が続く場合は、獣医師への相談を推奨します。",
    disclaimer: "* 営業時間と診療可否は病院に直接お問い合わせください",
  },

  // Reservation
  reservation: {
    title: "予約リクエスト",
    symptoms: "症状・相談内容",
    preferredDate: "希望日",
    preferredTime: "希望時間",
    contactPhone: "連絡先",
    notes: "追加メモ（任意）",
    submit: "予約をリクエスト",
    success: "予約リクエストが完了しました！",
    notice: "* 予約確定は病院から連絡があります",
  },

  // Vet Consultation
  vetConsultation: {
    title: "獣医師とリアルタイム相談",
    subtitle: "24時間専門獣医師が待機",
    startConsult: "相談を始める",
    normalType: "通常相談",
    urgentType: "緊急相談",
    waitingMessage: "獣医師に接続中...",
    connected: "獣医師が接続されました",
  },

  // Community
  community: {
    title: "コミュニティ",
    writePost: "投稿する",
    categories: {
      all: "すべて",
      question: "質問",
      tip: "豆知識",
      daily: "日常",
      review: "レビュー",
    },
    postTitle: "タイトル",
    postContent: "内容",
    likes: "いいね",
    comments: "コメント",
  },

  // Subscription
  subscription: {
    free: "無料",
    premium: "プレミアム",
    premiumPlus: "プレミアム+",
    monthlyLimit: "月{count}回無料相談",
    unlimited: "無制限相談",
    imageAnalysis: "画像分析",
    prioritySupport: "優先サポート",
    subscribe: "登録",
    limitExceeded: "今月の無料相談回数を使い切りました",
    limitExceededDesc: "プレミアム登録で無制限AI相談を！",
    viewPremium: "プレミアムを見る",
    resetNotice: "来月1日に無料回数がリセットされます",
  },

  // Health Report
  healthReport: {
    title: "健康レポート",
    downloadPdf: "PDFダウンロード",
    petInfo: "ペット情報",
    consultHistory: "相談履歴",
    monthlyStats: "月別統計",
    noData: "表示するデータがありません",
  },

  // Notifications
  notifications: {
    title: "通知設定",
    enable: "通知を有効にする",
    disable: "通知を無効にする",
    permissionDenied: "通知の許可が拒否されました",
    notSupported: "このブラウザは通知に対応していません",
  },

  // Disclaimer
  disclaimer: {
    main: "⚠️ ペットチェッキーは参考情報を提供します。正確な診断は獣医師にご相談ください。",
    emergency: "緊急時は最寄りの動物病院を受診してください。",
  },

  // Footer
  footer: {
    copyright: "© 2024 ペットチェッキー. AIペット健康相談サービス.",
  },
};
