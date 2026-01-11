import { SEVERITY_KEYWORDS, Severity, Language } from './constants';

/**
 * 텍스트 기반 위험도 분석
 * chat API와 image-analysis API에서 공통으로 사용
 */
export function analyzeSeverity(
  text: string,
  language: Language = 'ko'
): Severity {
  const lowerText = text.toLowerCase();

  // 고위험 키워드 체크
  const highKeywords = SEVERITY_KEYWORDS.high[language] || SEVERITY_KEYWORDS.high.ko;
  for (const keyword of highKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return 'high';
    }
  }

  // 중위험 키워드 체크
  const mediumKeywords = SEVERITY_KEYWORDS.medium[language] || SEVERITY_KEYWORDS.medium.ko;
  for (const keyword of mediumKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return 'medium';
    }
  }

  return 'low';
}

/**
 * 복합 텍스트 위험도 분석 (질문 + 응답)
 */
export function analyzeCombinedSeverity(
  question: string,
  response: string,
  language: Language = 'ko'
): Severity {
  const combined = `${question} ${response}`;
  return analyzeSeverity(combined, language);
}

/**
 * 위험도 스타일 클래스 반환
 */
export function getSeverityStyle(severity: Severity): string {
  switch (severity) {
    case 'high':
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    case 'medium':
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    case 'low':
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
  }
}

/**
 * 위험도 배지 색상 클래스 반환
 */
export function getSeverityBadgeStyle(severity: Severity): string {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'low':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
  }
}

/**
 * 위험도 라벨 반환
 */
export function getSeverityLabel(severity: Severity, language: Language = 'ko'): string {
  const labels = {
    high: {
      ko: '🚨 위험 - 병원 방문 권장',
      en: '🚨 Critical - Vet Visit Recommended',
      ja: '🚨 危険 - 病院受診推奨',
    },
    medium: {
      ko: '⚠️ 주의 - 경과 관찰 필요',
      en: '⚠️ Caution - Observation Needed',
      ja: '⚠️ 注意 - 経過観察必要',
    },
    low: {
      ko: '✅ 안심 - 일반적인 상태',
      en: '✅ Safe - Normal Condition',
      ja: '✅ 安心 - 一般的な状態',
    },
  };

  return labels[severity][language] || labels[severity].ko;
}

/**
 * 위험도 설정 전체 반환 (HospitalRecommendation 등에서 사용)
 */
export interface SeverityConfig {
  emoji: string;
  title: string;
  description: string;
  buttonText: string;
  buttonStyle: string;
  borderStyle: string;
}

export function getSeverityConfig(severity: Severity, language: Language = 'ko'): SeverityConfig {
  const configs = {
    high: {
      ko: {
        emoji: '🚨',
        title: '위험 - 즉시 병원 방문 필요',
        description: '증상이 심각합니다. 가능한 빨리 동물병원을 방문해주세요.',
        buttonText: '가까운 병원 찾기',
        buttonStyle: 'bg-red-500 hover:bg-red-600',
        borderStyle: 'border-red-500',
      },
      en: {
        emoji: '🚨',
        title: 'Critical - Immediate Vet Visit Required',
        description: 'Symptoms are serious. Please visit a veterinary clinic as soon as possible.',
        buttonText: 'Find Nearby Vet',
        buttonStyle: 'bg-red-500 hover:bg-red-600',
        borderStyle: 'border-red-500',
      },
      ja: {
        emoji: '🚨',
        title: '危険 - 至急病院へ',
        description: '症状が深刻です。できるだけ早く動物病院を受診してください。',
        buttonText: '近くの病院を探す',
        buttonStyle: 'bg-red-500 hover:bg-red-600',
        borderStyle: 'border-red-500',
      },
    },
    medium: {
      ko: {
        emoji: '⚠️',
        title: '주의 - 경과 관찰 필요',
        description: '증상이 지속되거나 악화되면 병원 방문을 권장합니다.',
        buttonText: '병원 정보 보기',
        buttonStyle: 'bg-yellow-500 hover:bg-yellow-600',
        borderStyle: 'border-yellow-500',
      },
      en: {
        emoji: '⚠️',
        title: 'Caution - Observation Needed',
        description: 'If symptoms persist or worsen, we recommend visiting a vet.',
        buttonText: 'View Vet Info',
        buttonStyle: 'bg-yellow-500 hover:bg-yellow-600',
        borderStyle: 'border-yellow-500',
      },
      ja: {
        emoji: '⚠️',
        title: '注意 - 経過観察必要',
        description: '症状が続くか悪化する場合は、病院の受診をお勧めします。',
        buttonText: '病院情報を見る',
        buttonStyle: 'bg-yellow-500 hover:bg-yellow-600',
        borderStyle: 'border-yellow-500',
      },
    },
    low: {
      ko: {
        emoji: '✅',
        title: '안심 - 일반적인 상태',
        description: '현재 특별한 문제는 없어 보입니다. 평소처럼 관리해주세요.',
        buttonText: '건강 팁 보기',
        buttonStyle: 'bg-green-500 hover:bg-green-600',
        borderStyle: 'border-green-500',
      },
      en: {
        emoji: '✅',
        title: 'Safe - Normal Condition',
        description: 'No apparent issues at the moment. Continue regular care.',
        buttonText: 'View Health Tips',
        buttonStyle: 'bg-green-500 hover:bg-green-600',
        borderStyle: 'border-green-500',
      },
      ja: {
        emoji: '✅',
        title: '安心 - 一般的な状態',
        description: '現在、特に問題はないようです。いつも通りのケアを続けてください。',
        buttonText: '健康のヒントを見る',
        buttonStyle: 'bg-green-500 hover:bg-green-600',
        borderStyle: 'border-green-500',
      },
    },
  };

  return configs[severity][language] || configs[severity].ko;
}
