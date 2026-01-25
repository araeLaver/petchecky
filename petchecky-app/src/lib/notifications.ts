/**
 * 알림 시스템 유틸리티
 * - Web Push Notification
 * - 인앱 알림
 * - 이메일 알림 (서버 사이드)
 */

// 알림 타입
export type NotificationType =
  | 'reminder'      // 리마인더 (예방접종, 약물 등)
  | 'health'        // 건강 관련
  | 'community'     // 커뮤니티 (좋아요, 댓글)
  | 'reservation'   // 예약 관련
  | 'system';       // 시스템 알림

// 알림 우선순위
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// 알림 데이터 구조
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
  link?: string;
}

// 알림 설정
export interface NotificationSettings {
  push: boolean;
  email: boolean;
  inApp: boolean;
  // 타입별 설정
  types: {
    reminder: boolean;
    health: boolean;
    community: boolean;
    reservation: boolean;
    system: boolean;
  };
  // 방해금지 시간
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;   // HH:mm
  };
}

const NOTIFICATION_STORAGE_KEY = 'petchecky_notifications';
const SETTINGS_STORAGE_KEY = 'petchecky_notification_settings';

// 기본 설정
const DEFAULT_SETTINGS: NotificationSettings = {
  push: true,
  email: true,
  inApp: true,
  types: {
    reminder: true,
    health: true,
    community: true,
    reservation: true,
    system: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
};

// ============ 웹 푸시 알림 ============

/**
 * 푸시 알림 지원 여부 확인
 */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;
}

/**
 * 푸시 알림 권한 요청
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * 현재 푸시 알림 권한 확인
 */
export function getPushPermission(): NotificationPermission | null {
  if (!isPushSupported()) {
    return null;
  }
  return Notification.permission;
}

/**
 * 푸시 알림 보내기 (브라우저 네이티브)
 */
export function showPushNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    return null;
  }

  const notification = new window.Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    ...options,
  });

  return notification as unknown as Notification;
}

// ============ 인앱 알림 ============

/**
 * 로컬 스토리지에서 알림 목록 조회
 */
export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * 알림 저장
 */
export function saveNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
  const notifications = getNotifications();

  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  notifications.unshift(newNotification);

  // 최대 100개까지만 저장
  const trimmed = notifications.slice(0, 100);
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(trimmed));

  return newNotification;
}

/**
 * 알림 읽음 처리
 */
export function markAsRead(notificationId: string): void {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === notificationId);

  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  }
}

/**
 * 모든 알림 읽음 처리
 */
export function markAllAsRead(): void {
  const notifications = getNotifications();
  notifications.forEach(n => n.read = true);
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
}

/**
 * 알림 삭제
 */
export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * 읽지 않은 알림 개수
 */
export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}

// ============ 알림 설정 ============

/**
 * 알림 설정 조회
 */
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!stored) return DEFAULT_SETTINGS;

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * 알림 설정 저장
 */
export function saveNotificationSettings(settings: Partial<NotificationSettings>): void {
  const current = getNotificationSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * 방해금지 시간인지 확인
 */
export function isQuietHours(): boolean {
  const settings = getNotificationSettings();

  if (!settings.quietHours?.enabled) return false;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const { start, end } = settings.quietHours;

  // 시간 비교 (자정 넘어가는 경우 처리)
  if (start <= end) {
    return currentTime >= start && currentTime < end;
  } else {
    return currentTime >= start || currentTime < end;
  }
}

/**
 * 특정 타입의 알림이 활성화되어 있는지 확인
 */
export function isNotificationEnabled(type: NotificationType): boolean {
  const settings = getNotificationSettings();
  return settings.inApp && settings.types[type];
}

// ============ 통합 알림 발송 ============

/**
 * 알림 발송 (설정에 따라 푸시 + 인앱)
 */
export async function sendNotification(
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    priority?: NotificationPriority;
    data?: Record<string, unknown>;
    link?: string;
    pushOptions?: NotificationOptions;
  }
): Promise<Notification | null> {
  const settings = getNotificationSettings();

  // 타입별 알림 비활성화 체크
  if (!settings.types[type]) {
    return null;
  }

  // 방해금지 시간 체크 (긴급 알림 제외)
  if (options?.priority !== 'urgent' && isQuietHours()) {
    // 방해금지 중에는 인앱 알림만 저장하고 푸시는 보내지 않음
    if (settings.inApp) {
      return saveNotification({
        type,
        title,
        message,
        priority: options?.priority || 'normal',
        data: options?.data,
        link: options?.link,
      });
    }
    return null;
  }

  // 인앱 알림 저장
  let notification: Notification | null = null;
  if (settings.inApp) {
    notification = saveNotification({
      type,
      title,
      message,
      priority: options?.priority || 'normal',
      data: options?.data,
      link: options?.link,
    });
  }

  // 푸시 알림 발송
  if (settings.push && isPushSupported() && Notification.permission === 'granted') {
    showPushNotification(title, {
      body: message,
      tag: type,
      ...options?.pushOptions,
    });
  }

  return notification;
}

// ============ 리마인더 알림 헬퍼 ============

/**
 * 예방접종 리마인더 알림
 */
export function sendVaccinationReminder(
  petName: string,
  vaccineName: string,
  dueDate: string
): Promise<Notification | null> {
  return sendNotification(
    'reminder',
    `${petName}의 예방접종 알림`,
    `${vaccineName} 예방접종 예정일이 ${dueDate}입니다.`,
    { priority: 'high', link: '/vaccination' }
  );
}

/**
 * 약물 복용 리마인더 알림
 */
export function sendMedicationReminder(
  petName: string,
  medicationName: string
): Promise<Notification | null> {
  return sendNotification(
    'reminder',
    `${petName}의 약물 복용 시간`,
    `${medicationName}을(를) 복용할 시간입니다.`,
    { priority: 'high', link: '/medication' }
  );
}

/**
 * 건강 체크 리마인더 알림
 */
export function sendHealthCheckReminder(petName: string): Promise<Notification | null> {
  return sendNotification(
    'health',
    `${petName}의 건강 체크`,
    '오늘의 건강 상태를 기록해주세요.',
    { priority: 'normal', link: '/health-tracking' }
  );
}

/**
 * 커뮤니티 알림 (좋아요/댓글)
 */
export function sendCommunityNotification(
  type: 'like' | 'comment',
  postTitle: string,
  authorName?: string
): Promise<Notification | null> {
  const title = type === 'like' ? '게시글에 좋아요' : '새 댓글';
  const message = type === 'like'
    ? `"${postTitle}" 게시글에 좋아요가 달렸습니다.`
    : `${authorName || '누군가'}님이 "${postTitle}"에 댓글을 남겼습니다.`;

  return sendNotification('community', title, message, {
    priority: 'low',
    link: '/community',
  });
}

/**
 * 예약 알림
 */
export function sendReservationNotification(
  hospitalName: string,
  date: string,
  time: string,
  status: 'confirmed' | 'cancelled' | 'reminder'
): Promise<Notification | null> {
  const titles = {
    confirmed: '예약이 확정되었습니다',
    cancelled: '예약이 취소되었습니다',
    reminder: '예약 알림',
  };

  const messages = {
    confirmed: `${hospitalName}에서 ${date} ${time} 예약이 확정되었습니다.`,
    cancelled: `${hospitalName} ${date} ${time} 예약이 취소되었습니다.`,
    reminder: `내일 ${time}에 ${hospitalName} 방문 예정입니다.`,
  };

  return sendNotification('reservation', titles[status], messages[status], {
    priority: status === 'reminder' ? 'high' : 'normal',
    link: '/vet-consultation',
  });
}
