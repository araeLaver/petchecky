const DB_NAME = 'petchecky_db';
const DB_VERSION = 2;

export const STORES = {
  PHOTOS: 'photos',
  ALBUMS: 'albums',
  OFFLINE_PETS: 'offline_pets',
  OFFLINE_CHATS: 'offline_chats',
  PENDING_SYNC: 'pending_sync',
  SYNC_META: 'sync_meta',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

export interface PendingSyncItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  store: StoreName;
  data: Record<string, unknown>;
  retryCount: number;
  createdAt: number;
}

interface PhotoRecord {
  id: string;
  petId: string;
  imageData: string;
  description?: string;
  date: string;
  albumId?: string;
}

interface AlbumRecord {
  id: string;
  petId: string;
  name: string;
  coverPhotoId?: string;
  createdAt: number;
}

interface OfflinePet {
  id: string;
  userId?: string;
  [key: string]: unknown;
}

interface OfflineChat {
  id: string;
  userId?: string;
  [key: string]: unknown;
}

let dbInstance: IDBDatabase | null = null;

export function isIndexedDBSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.indexedDB;
}

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.PHOTOS)) {
        const s = db.createObjectStore(STORES.PHOTOS, { keyPath: 'id' });
        s.createIndex('petId', 'petId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.ALBUMS)) {
        const s = db.createObjectStore(STORES.ALBUMS, { keyPath: 'id' });
        s.createIndex('petId', 'petId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.OFFLINE_PETS)) {
        const s = db.createObjectStore(STORES.OFFLINE_PETS, { keyPath: 'id' });
        s.createIndex('userId', 'userId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.OFFLINE_CHATS)) {
        const s = db.createObjectStore(STORES.OFFLINE_CHATS, { keyPath: 'id' });
        s.createIndex('userId', 'userId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
        db.createObjectStore(STORES.PENDING_SYNC, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SYNC_META)) {
        db.createObjectStore(STORES.SYNC_META, { keyPath: 'key' });
      }
    };
    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function initDB(): Promise<void> {
  await openDB();
}

export async function savePhoto(photo: PhotoRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PHOTOS, 'readwrite');
    tx.objectStore(STORES.PHOTOS).put(photo);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPhotosByPet(petId: string): Promise<PhotoRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PHOTOS, 'readonly');
    const idx = tx.objectStore(STORES.PHOTOS).index('petId');
    const req = idx.getAll(petId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhoto(photoId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PHOTOS, 'readwrite');
    tx.objectStore(STORES.PHOTOS).delete(photoId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAlbum(album: Omit<AlbumRecord, 'createdAt'>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ALBUMS, 'readwrite');
    tx.objectStore(STORES.ALBUMS).put({ ...album, createdAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAlbumsByPet(petId: string): Promise<AlbumRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ALBUMS, 'readonly');
    const idx = tx.objectStore(STORES.ALBUMS).index('petId');
    const req = idx.getAll(petId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAlbum(albumId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORES.ALBUMS, STORES.PHOTOS], 'readwrite');
  tx.objectStore(STORES.ALBUMS).delete(albumId);
  const ps = tx.objectStore(STORES.PHOTOS);
  const cr = ps.openCursor();
  return new Promise((resolve, reject) => {
    cr.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
      if (cursor) {
        if (cursor.value.albumId === albumId) cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function migratePhotosFromLocalStorage(petId: string): Promise<void> {
  const migrationKey = 'petchecky_idb_migrated_' + petId;
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(migrationKey)) return;
  const savedPhotos = localStorage.getItem('petchecky_photos_' + petId);
  const savedAlbums = localStorage.getItem('petchecky_albums_' + petId);
  if (savedPhotos) {
    try {
      const photos: Array<{ id: string; petId: string; imageData: string; caption?: string; date: string; albumId?: string }> = JSON.parse(savedPhotos);
      for (const p of photos) {
        await savePhoto({ id: p.id, petId: p.petId, imageData: p.imageData, description: p.caption, date: p.date, albumId: p.albumId });
      }
    } catch { /* ignore */ }
  }
  if (savedAlbums) {
    try {
      const albums: Array<{ id: string; petId: string; name: string; coverPhotoId?: string }> = JSON.parse(savedAlbums);
      for (const a of albums) { await saveAlbum(a); }
    } catch { /* ignore */ }
  }
  localStorage.setItem(migrationKey, 'true');
}

export async function getPendingSyncItems(): Promise<PendingSyncItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDING_SYNC, 'readonly');
    const req = tx.objectStore(STORES.PENDING_SYNC).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addToPendingSync(
  type: PendingSyncItem['type'],
  store: StoreName,
  data: Record<string, unknown>
): Promise<void> {
  const db = await openDB();
  const item: PendingSyncItem = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2),
    type, store, data, retryCount: 0, createdAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
    tx.objectStore(STORES.PENDING_SYNC).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removePendingSyncItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
    tx.objectStore(STORES.PENDING_SYNC).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function incrementRetryCount(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
    const s = tx.objectStore(STORES.PENDING_SYNC);
    const req = s.get(id);
    req.onsuccess = () => {
      const item = req.result as PendingSyncItem | undefined;
      if (item) { item.retryCount += 1; s.put(item); }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function setLastSyncTime(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SYNC_META, 'readwrite');
    tx.objectStore(STORES.SYNC_META).put({ key, value: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLastSyncTime(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SYNC_META, 'readonly');
    const req = tx.objectStore(STORES.SYNC_META).get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOfflinePet(pet: OfflinePet, _isOnline?: boolean): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OFFLINE_PETS, 'readwrite');
    tx.objectStore(STORES.OFFLINE_PETS).put(pet);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflinePets(userId: string): Promise<OfflinePet[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OFFLINE_PETS, 'readonly');
    const idx = tx.objectStore(STORES.OFFLINE_PETS).index('userId');
    const req = idx.getAll(userId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOfflineChat(chat: OfflineChat, _isOnline?: boolean): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OFFLINE_CHATS, 'readwrite');
    tx.objectStore(STORES.OFFLINE_CHATS).put(chat);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineChats(userId: string): Promise<OfflineChat[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OFFLINE_CHATS, 'readonly');
    const idx = tx.objectStore(STORES.OFFLINE_CHATS).index('userId');
    const req = idx.getAll(userId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
