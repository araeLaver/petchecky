/**
 * IndexedDB 헬퍼 - 대용량 데이터 저장용 (이미지 등)
 * localStorage 대신 사용하여 용량 제한 문제 해결
 */

const DB_NAME = "petchecky_db";
const DB_VERSION = 1;

// 스토어 이름
export const STORES = {
  PHOTOS: "photos",
  ALBUMS: "albums",
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

type StoreData = {
  [STORES.PHOTOS]: Photo;
  [STORES.ALBUMS]: Album;
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
