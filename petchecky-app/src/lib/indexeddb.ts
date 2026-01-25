/**
 * IndexedDB 헬퍼 - 대용량 데이터 저장용 (이미지 등)
 * localStorage 대신 사용하여 용량 제한 문제 해결
 */

const DB_NAME = "petchecky_db";
const DB_VERSION = 2; // 버전 업그레이드

// 스토어 이름
export const STORES = {
  PHOTOS: "photos",
  ALBUMS: "albums",
  // 오프라인 동기화용 스토어 추가
  OFFLINE_PETS: "offline_pets",
  OFFLINE_CHATS: "offline_chats",
  PENDING_SYNC: "pending_sync",
  SYNC_SETTINGS: "sync_settings",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

interface Photo {
  id: string;
  petId: string;
  albumId?: string;
  imageData: string; // Base64
  thumbnail?: string; // 압축된 썸네일
  date: string;
  description?: string;
  createdAt: number;
}

interface Album {
  id: string;
  petId: string;
  name: string;
  coverPhotoId?: string;
  createdAt: number;
}

// 오프라인 펫 데이터
interface OfflinePet {
  id: string;
  user_id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  age: number;
  weight: number;
  created_at: string;
  updated_at: string;
  _synced: boolean; // 동기화 상태
  _localUpdatedAt: string; // 로컬 수정 시간
}

// 오프라인 채팅 기록
interface OfflineChat {
  id: string;
  user_id: string;
  pet_id: string;
  pet_name: string;
  pet_species: 'dog' | 'cat';
  preview: string;
  severity: 'low' | 'medium' | 'high' | null;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    severity?: 'low' | 'medium' | 'high';
  }>;
  created_at: string;
  _synced: boolean;
}

// 동기화 대기 항목
export interface PendingSyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  store: StoreName;
  data: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
}

// 동기화 설정
interface SyncSetting {
  key: string;
  value: string | number | boolean;
}

type StoreData = {
  [STORES.PHOTOS]: Photo;
  [STORES.ALBUMS]: Album;
  [STORES.OFFLINE_PETS]: OfflinePet;
  [STORES.OFFLINE_CHATS]: OfflineChat;
  [STORES.PENDING_SYNC]: PendingSyncItem;
  [STORES.SYNC_SETTINGS]: SyncSetting;
};

let dbInstance: IDBDatabase | null = null;

/**
 * IndexedDB 연결 초기화
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("IndexedDB 열기 실패"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // photos 스토어 생성
      if (!db.objectStoreNames.contains(STORES.PHOTOS)) {
        const photosStore = db.createObjectStore(STORES.PHOTOS, { keyPath: "id" });
        photosStore.createIndex("petId", "petId", { unique: false });
        photosStore.createIndex("albumId", "albumId", { unique: false });
        photosStore.createIndex("date", "date", { unique: false });
      }

      // albums 스토어 생성
      if (!db.objectStoreNames.contains(STORES.ALBUMS)) {
        const albumsStore = db.createObjectStore(STORES.ALBUMS, { keyPath: "id" });
        albumsStore.createIndex("petId", "petId", { unique: false });
      }

      // 오프라인 펫 데이터 스토어
      if (!db.objectStoreNames.contains(STORES.OFFLINE_PETS)) {
        const petsStore = db.createObjectStore(STORES.OFFLINE_PETS, { keyPath: "id" });
        petsStore.createIndex("user_id", "user_id", { unique: false });
        petsStore.createIndex("_synced", "_synced", { unique: false });
      }

      // 오프라인 채팅 기록 스토어
      if (!db.objectStoreNames.contains(STORES.OFFLINE_CHATS)) {
        const chatsStore = db.createObjectStore(STORES.OFFLINE_CHATS, { keyPath: "id" });
        chatsStore.createIndex("user_id", "user_id", { unique: false });
        chatsStore.createIndex("created_at", "created_at", { unique: false });
        chatsStore.createIndex("_synced", "_synced", { unique: false });
      }

      // 동기화 대기열 스토어
      if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
        const syncStore = db.createObjectStore(STORES.PENDING_SYNC, { keyPath: "id" });
        syncStore.createIndex("timestamp", "timestamp", { unique: false });
        syncStore.createIndex("store", "store", { unique: false });
        syncStore.createIndex("type", "type", { unique: false });
      }

      // 동기화 설정 스토어
      if (!db.objectStoreNames.contains(STORES.SYNC_SETTINGS)) {
        db.createObjectStore(STORES.SYNC_SETTINGS, { keyPath: "key" });
      }
    };
  });
}

/**
 * 데이터 저장
 */
export async function put<T extends StoreName>(
  storeName: T,
  data: StoreData[T]
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("데이터 저장 실패"));
  });
}

/**
 * 데이터 조회 (단일)
 */
export async function get<T extends StoreName>(
  storeName: T,
  id: string
): Promise<StoreData[T] | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("데이터 조회 실패"));
  });
}

/**
 * 인덱스로 데이터 조회 (여러 개)
 */
export async function getByIndex<T extends StoreName>(
  storeName: T,
  indexName: string,
  value: string
): Promise<StoreData[T][]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("데이터 조회 실패"));
  });
}

/**
 * 모든 데이터 조회
 */
export async function getAll<T extends StoreName>(
  storeName: T
): Promise<StoreData[T][]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("데이터 조회 실패"));
  });
}

/**
 * 데이터 삭제
 */
export async function remove(storeName: StoreName, id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("데이터 삭제 실패"));
  });
}

/**
 * 여러 데이터 삭제
 */
export async function removeMany(storeName: StoreName, ids: string[]): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    let completed = 0;
    const total = ids.length;

    if (total === 0) {
      resolve();
      return;
    }

    ids.forEach((id) => {
      const request = store.delete(id);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(new Error("데이터 삭제 실패"));
    });
  });
}

/**
 * 스토어 전체 삭제
 */
export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("스토어 초기화 실패"));
  });
}

// === 사진 관련 헬퍼 함수 ===

/**
 * 사진 저장
 */
export async function savePhoto(photo: Omit<Photo, "createdAt">): Promise<void> {
  await put(STORES.PHOTOS, {
    ...photo,
    createdAt: Date.now(),
  });
}

/**
 * 펫별 사진 조회
 */
export async function getPhotosByPet(petId: string): Promise<Photo[]> {
  const photos = await getByIndex(STORES.PHOTOS, "petId", petId);
  return photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * 앨범별 사진 조회
 */
export async function getPhotosByAlbum(albumId: string): Promise<Photo[]> {
  const photos = await getByIndex(STORES.PHOTOS, "albumId", albumId);
  return photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * 사진 삭제
 */
export async function deletePhoto(photoId: string): Promise<void> {
  await remove(STORES.PHOTOS, photoId);
}

// === 앨범 관련 헬퍼 함수 ===

/**
 * 앨범 저장
 */
export async function saveAlbum(album: Omit<Album, "createdAt">): Promise<void> {
  await put(STORES.ALBUMS, {
    ...album,
    createdAt: Date.now(),
  });
}

/**
 * 펫별 앨범 조회
 */
export async function getAlbumsByPet(petId: string): Promise<Album[]> {
  return getByIndex(STORES.ALBUMS, "petId", petId);
}

/**
 * 앨범 삭제 (사진도 함께 삭제)
 */
export async function deleteAlbum(albumId: string): Promise<void> {
  const photos = await getPhotosByAlbum(albumId);
  await removeMany(STORES.PHOTOS, photos.map((p) => p.id));
  await remove(STORES.ALBUMS, albumId);
}

// === 마이그레이션 헬퍼 ===

/**
 * localStorage에서 IndexedDB로 사진 마이그레이션
 */
export async function migratePhotosFromLocalStorage(petId: string): Promise<boolean> {
  const key = `petchecky_photos_${petId}`;
  const saved = localStorage.getItem(key);

  if (!saved) return false;

  try {
    const photos = JSON.parse(saved);
    if (!Array.isArray(photos)) return false;

    // IndexedDB로 이전
    for (const photo of photos) {
      await savePhoto({
        id: photo.id || `photo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        petId,
        imageData: photo.imageData,
        thumbnail: photo.thumbnail,
        date: photo.date || new Date().toISOString(),
        description: photo.description,
      });
    }

    // localStorage에서 삭제
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * IndexedDB 지원 여부 확인
 */
export function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== "undefined";
}

// === 오프라인 동기화 관련 함수 ===

/**
 * 동기화 대기열에 항목 추가
 */
export async function addToPendingSync(
  type: PendingSyncItem['type'],
  store: StoreName,
  data: Record<string, unknown>
): Promise<void> {
  const item: PendingSyncItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    store,
    data,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };

  await put(STORES.PENDING_SYNC, item);
}

/**
 * 동기화 대기 항목 조회
 */
export async function getPendingSyncItems(): Promise<PendingSyncItem[]> {
  const items = await getAll(STORES.PENDING_SYNC);
  return items.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * 동기화 완료 후 항목 제거
 */
export async function removePendingSyncItem(id: string): Promise<void> {
  await remove(STORES.PENDING_SYNC, id);
}

/**
 * 재시도 횟수 증가
 */
export async function incrementRetryCount(id: string): Promise<void> {
  const item = await get(STORES.PENDING_SYNC, id);
  if (item) {
    await put(STORES.PENDING_SYNC, {
      ...item,
      retryCount: item.retryCount + 1,
    });
  }
}

/**
 * 오프라인 펫 데이터 저장
 */
export async function saveOfflinePet(pet: Omit<StoreData[typeof STORES.OFFLINE_PETS], '_synced' | '_localUpdatedAt'>, synced = false): Promise<void> {
  await put(STORES.OFFLINE_PETS, {
    ...pet,
    _synced: synced,
    _localUpdatedAt: new Date().toISOString(),
  });
}

/**
 * 사용자의 오프라인 펫 목록 조회
 */
export async function getOfflinePets(userId: string): Promise<StoreData[typeof STORES.OFFLINE_PETS][]> {
  return getByIndex(STORES.OFFLINE_PETS, "user_id", userId);
}

/**
 * 동기화되지 않은 펫 데이터 조회
 */
export async function getUnsyncedPets(): Promise<StoreData[typeof STORES.OFFLINE_PETS][]> {
  const allPets = await getAll(STORES.OFFLINE_PETS);
  return allPets.filter(pet => !pet._synced);
}

/**
 * 오프라인 채팅 기록 저장
 */
export async function saveOfflineChat(chat: Omit<StoreData[typeof STORES.OFFLINE_CHATS], '_synced'>, synced = false): Promise<void> {
  await put(STORES.OFFLINE_CHATS, {
    ...chat,
    _synced: synced,
  });
}

/**
 * 사용자의 오프라인 채팅 기록 조회
 */
export async function getOfflineChats(userId: string): Promise<StoreData[typeof STORES.OFFLINE_CHATS][]> {
  const chats = await getByIndex(STORES.OFFLINE_CHATS, "user_id", userId);
  return chats.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * 마지막 동기화 시간 저장
 */
export async function setLastSyncTime(store: string): Promise<void> {
  await put(STORES.SYNC_SETTINGS, {
    key: `lastSync_${store}`,
    value: new Date().toISOString(),
  });
}

/**
 * 마지막 동기화 시간 조회
 */
export async function getLastSyncTime(store: string): Promise<string | null> {
  const setting = await get(STORES.SYNC_SETTINGS, `lastSync_${store}`);
  return setting?.value as string | null;
}

// === 동기화 충돌 해결 ===

export interface SyncConflict {
  id: string;
  store: StoreName;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  localTimestamp: string;
  serverTimestamp: string;
}

export type ConflictResolution = 'use_local' | 'use_server' | 'merge';

/**
 * 타임스탬프 기반 자동 충돌 해결
 */
export function resolveConflict(
  conflict: SyncConflict,
  strategy: ConflictResolution = 'use_server'
): Record<string, unknown> {
  switch (strategy) {
    case 'use_local':
      return conflict.localData;

    case 'use_server':
      return conflict.serverData;

    case 'merge':
      // 최신 타임스탬프 데이터 우선, 필드별 병합
      const localTime = new Date(conflict.localTimestamp).getTime();
      const serverTime = new Date(conflict.serverTimestamp).getTime();

      if (localTime > serverTime) {
        return { ...conflict.serverData, ...conflict.localData };
      } else {
        return { ...conflict.localData, ...conflict.serverData };
      }

    default:
      return conflict.serverData;
  }
}
