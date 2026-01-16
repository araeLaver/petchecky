// XSS 방지 및 입력 정제 유틸리티

/**
 * HTML 특수문자 이스케이프 (XSS 방지)
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 게시글 제목 정제
 * - HTML 이스케이프
 * - 공백 정리
 * - 길이 제한 (기본 100자)
 */
export function sanitizeTitle(title: string, maxLength: number = 100): string {
  if (!title || typeof title !== 'string') return '';

  return sanitizeHtml(title.trim()).slice(0, maxLength);
}

/**
 * 게시글/댓글 내용 정제
 * - HTML 이스케이프
 * - 공백 정리 (줄바꿈은 유지)
 * - 길이 제한 (기본 5000자)
 */
export function sanitizeContent(
  content: string,
  maxLength: number = 5000
): string {
  if (!content || typeof content !== 'string') return '';

  // 연속된 줄바꿈을 최대 2개로 제한
  const normalizedContent = content
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

  return sanitizeHtml(normalizedContent).slice(0, maxLength);
}

/**
 * 사용자명/닉네임 정제
 * - HTML 이스케이프
 * - 공백 제거
 * - 특수문자 제한
 * - 길이 제한 (기본 30자)
 */
export function sanitizeUsername(
  username: string,
  maxLength: number = 30
): string {
  if (!username || typeof username !== 'string') return '';

  // 허용: 영문, 숫자, 한글, 일본어, 밑줄, 하이픈
  const cleaned = username
    .trim()
    .replace(/[^\w\u3131-\uD79D\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF_-]/g, '');

  return sanitizeHtml(cleaned).slice(0, maxLength);
}

/**
 * URL 정제 및 검증
 * - XSS 방지 (javascript: 등)
 * - 허용 프로토콜 검증
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // 허용 프로토콜
  const allowedProtocols = ['http:', 'https:', 'mailto:'];

  try {
    const parsed = new URL(trimmed);
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }
    return trimmed;
  } catch {
    // 상대 경로 허용
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
    return null;
  }
}

/**
 * 검색어 정제
 * - HTML 이스케이프
 * - 특수 검색 연산자 제거
 * - 길이 제한 (기본 100자)
 */
export function sanitizeSearchQuery(
  query: string,
  maxLength: number = 100
): string {
  if (!query || typeof query !== 'string') return '';

  // SQL injection 및 NoSQL injection 방지
  const cleaned = query
    .trim()
    .replace(/['"`;\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');

  return sanitizeHtml(cleaned).slice(0, maxLength);
}

/**
 * 이메일 주소에서 사용자명 추출 (익명화)
 * example@domain.com → exa***
 */
export function anonymizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '익명';

  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '익명';

  const localPart = email.substring(0, atIndex);

  if (localPart.length <= 3) {
    return localPart.charAt(0) + '***';
  }

  return localPart.substring(0, 3) + '***';
}

/**
 * 객체의 문자열 필드 일괄 정제
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fieldConfig: Partial<Record<keyof T, 'html' | 'title' | 'content' | 'username'>>
): T {
  const result = { ...obj };

  for (const [key, type] of Object.entries(fieldConfig)) {
    const value = result[key as keyof T];
    if (typeof value !== 'string') continue;

    switch (type) {
      case 'html':
        (result as Record<string, unknown>)[key] = sanitizeHtml(value);
        break;
      case 'title':
        (result as Record<string, unknown>)[key] = sanitizeTitle(value);
        break;
      case 'content':
        (result as Record<string, unknown>)[key] = sanitizeContent(value);
        break;
      case 'username':
        (result as Record<string, unknown>)[key] = sanitizeUsername(value);
        break;
    }
  }

  return result;
}
