"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { PetProfile } from "@/app/page";
import {
  isIndexedDBSupported,
  savePhoto as savePhotoToIDB,
  getPhotosByPet,
  deletePhoto as deletePhotoFromIDB,
  saveAlbum as saveAlbumToIDB,
  getAlbumsByPet,
  deleteAlbum as deleteAlbumFromIDB,
  migratePhotosFromLocalStorage,
} from "@/lib/indexeddb";
import { safeJsonParse } from "@/lib/safeJson";

export interface GalleryPhoto {
  id: string;
  petId: string;
  imageData: string; // base64 encoded image
  caption?: string;
  date: string;
  albumId?: string;
}

export interface Album {
  id: string;
  petId: string;
  name: string;
  coverPhotoId?: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "album">("grid");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  // Load pets
  useEffect(() => {
    const savedPets = localStorage.getItem("petchecky_pets");
    if (savedPets) {
      const parsedPets = safeJsonParse<PetProfile[]>(savedPets, []);
      setPets(parsedPets);
      if (parsedPets.length > 0 && parsedPets[0].id) {
        setSelectedPetId(parsedPets[0].id);
      }
    }
  }, []);

  // Load photos and albums from IndexedDB
  useEffect(() => {
    if (!selectedPetId) return;

    const loadData = async () => {
      if (!isIndexedDBSupported()) {
        // IndexedDB 미지원 시 localStorage 폴백
        const savedPhotos = localStorage.getItem(`petchecky_photos_${selectedPetId}`);
        const savedAlbums = localStorage.getItem(`petchecky_albums_${selectedPetId}`);
        setPhotos(safeJsonParse<GalleryPhoto[]>(savedPhotos, []));
        setAlbums(safeJsonParse<Album[]>(savedAlbums, []));
        return;
      }

      try {
        // localStorage에서 IndexedDB로 마이그레이션 시도
        await migratePhotosFromLocalStorage(selectedPetId);

        // IndexedDB에서 데이터 로드
        const [idbPhotos, idbAlbums] = await Promise.all([
          getPhotosByPet(selectedPetId),
          getAlbumsByPet(selectedPetId),
        ]);

        setPhotos(idbPhotos.map(p => ({
          id: p.id,
          petId: p.petId,
          imageData: p.imageData,
          caption: p.description,
          date: p.date,
          albumId: p.albumId,
        })));
        setAlbums(idbAlbums.map(a => ({
          id: a.id,
          petId: a.petId,
          name: a.name,
          coverPhotoId: a.coverPhotoId,
          createdAt: new Date(a.createdAt).toISOString(),
        })));
      } catch (error) {
        console.error("Failed to load from IndexedDB:", error);
        // 에러 시 localStorage 폴백
        const savedPhotos = localStorage.getItem(`petchecky_photos_${selectedPetId}`);
        const savedAlbums = localStorage.getItem(`petchecky_albums_${selectedPetId}`);
        setPhotos(safeJsonParse<GalleryPhoto[]>(savedPhotos, []));
        setAlbums(safeJsonParse<Album[]>(savedAlbums, []));
      }
    };

    loadData();
  }, [selectedPetId]);

  // Save single photo to IndexedDB
  const savePhotoToStorage = useCallback(async (photo: GalleryPhoto) => {
    if (!isIndexedDBSupported()) {
      // localStorage 폴백
      const current = photos;
      const updated = [...current, photo];
      localStorage.setItem(`petchecky_photos_${photo.petId}`, JSON.stringify(updated));
      return;
    }

    await savePhotoToIDB({
      id: photo.id,
      petId: photo.petId,
      imageData: photo.imageData,
      description: photo.caption,
      date: photo.date,
      albumId: photo.albumId,
    });
  }, [photos]);

  // Save album to IndexedDB
  const saveAlbumToStorage = useCallback(async (album: Album) => {
    if (!isIndexedDBSupported()) {
      // localStorage 폴백
      const updated = [...albums, album];
      localStorage.setItem(`petchecky_albums_${album.petId}`, JSON.stringify(updated));
      return;
    }

    await saveAlbumToIDB({
      id: album.id,
      petId: album.petId,
      name: album.name,
      coverPhotoId: album.coverPhotoId,
    });
  }, [albums]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedPetId) return;

    const newPhotos: GalleryPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      // Resize and compress image
      const imageData = await resizeImage(file, 800, 0.8);

      const photo: GalleryPhoto = {
        id: `${uuidv4()}_${i}`,
        petId: selectedPetId,
        imageData,
        date: new Date().toISOString().split("T")[0],
        albumId: selectedAlbumId || undefined,
      };

      newPhotos.push(photo);
      // IndexedDB에 저장
      await savePhotoToStorage(photo);
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    setShowUploadModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Resize image to reduce storage size
  const resizeImage = (file: File, maxWidth: number, quality: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Create album
  const handleCreateAlbum = async (name: string) => {
    if (!selectedPetId || !name.trim()) return;

    const newAlbum: Album = {
      id: Date.now().toString(),
      petId: selectedPetId,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    await saveAlbumToStorage(newAlbum);
    setAlbums(prev => [...prev, newAlbum]);
    setShowAlbumModal(false);
  };

  // Delete photo
  const handleDeletePhoto = async (photoId: string) => {
    if (confirm("이 사진을 삭제하시겠습니까?")) {
      if (isIndexedDBSupported()) {
        await deletePhotoFromIDB(photoId);
      }
      setPhotos(prev => prev.filter((p) => p.id !== photoId));
      setSelectedPhoto(null);
    }
  };

  // Delete album
  const handleDeleteAlbum = async (albumId: string) => {
    if (confirm("이 앨범을 삭제하시겠습니까? 앨범 내 사진도 함께 삭제됩니다.")) {
      if (isIndexedDBSupported()) {
        await deleteAlbumFromIDB(albumId);
      }
      // 앨범과 관련 사진 모두 삭제
      setPhotos(prev => prev.filter((p) => p.albumId !== albumId));
      setAlbums(prev => prev.filter((a) => a.id !== albumId));
      setSelectedAlbumId(null);
    }
  };

  // Filter photos by album
  const filteredPhotos = selectedAlbumId
    ? photos.filter((p) => p.albumId === selectedAlbumId)
    : photos;

  // Get album cover photo
  const getAlbumCover = (album: Album) => {
    if (album.coverPhotoId) {
      return photos.find((p) => p.id === album.coverPhotoId)?.imageData;
    }
    const albumPhotos = photos.filter((p) => p.albumId === album.id);
    return albumPhotos[0]?.imageData;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">📸 펫 갤러리</h1>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            + 사진 추가
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        {/* Pet Selection */}
        {pets.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => {
                  setSelectedPetId(pet.id!);
                  setSelectedAlbumId(null);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedPetId === pet.id
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                }`}
              >
                <span>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => {
              setViewMode("grid");
              setSelectedAlbumId(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            }`}
          >
            모든 사진
          </button>
          <button
            onClick={() => setViewMode("album")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "album"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            }`}
          >
            앨범
          </button>
        </div>

        {/* Album View */}
        {viewMode === "album" && !selectedAlbumId && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">앨범</h2>
              <button
                onClick={() => setShowAlbumModal(true)}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
              >
                + 새 앨범
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {albums.map((album) => {
                const cover = getAlbumCover(album);
                const photoCount = photos.filter((p) => p.albumId === album.id).length;

                return (
                  <button
                    key={album.id}
                    onClick={() => setSelectedAlbumId(album.id)}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700"
                  >
                    {cover ? (
                      <Image
                        src={cover}
                        alt={album.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl text-gray-400">
                        📁
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-medium text-sm truncate">{album.name}</p>
                      <p className="text-white/70 text-xs">{photoCount}장</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {albums.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📁</div>
                <p>아직 앨범이 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* Album Detail Header */}
        {selectedAlbumId && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedAlbumId(null)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {albums.find((a) => a.id === selectedAlbumId)?.name}
              </h2>
            </div>
            <button
              onClick={() => handleDeleteAlbum(selectedAlbumId)}
              className="text-sm text-red-500 hover:text-red-600"
            >
              앨범 삭제
            </button>
          </div>
        )}

        {/* Photo Grid */}
        {(viewMode === "grid" || selectedAlbumId) && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {filteredPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 hover:opacity-90 transition-opacity"
              >
                <Image
                  src={photo.imageData}
                  alt={photo.caption || "Pet photo"}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredPhotos.length === 0 && (viewMode === "grid" || selectedAlbumId) && (
          <div className="rounded-xl bg-white border border-gray-200 p-8 text-center dark:bg-gray-800 dark:border-gray-700">
            <div className="text-4xl mb-3">📷</div>
            <p className="text-gray-500 mb-4 dark:text-gray-400">
              {selectedPet?.name}의 추억을 담아보세요
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="rounded-full bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              첫 사진 추가하기
            </button>
          </div>
        )}
      </main>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative w-full max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedPhoto.imageData}
              alt={selectedPhoto.caption || "Pet photo"}
              width={800}
              height={600}
              className="w-full h-auto rounded-lg object-contain"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                className="rounded-full bg-red-500/80 p-2 text-white hover:bg-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedPhoto.caption && (
              <p className="mt-4 text-white text-center">{selectedPhoto.caption}</p>
            )}
            <p className="mt-2 text-white/60 text-center text-sm">{selectedPhoto.date}</p>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">사진 추가</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {/* Album Selection */}
              {albums.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    앨범 선택 (선택사항)
                  </label>
                  <select
                    value={selectedAlbumId || ""}
                    onChange={(e) => setSelectedAlbumId(e.target.value || null)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">앨범 없음</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* File Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="text-gray-600 dark:text-gray-400">클릭하여 사진을 선택하세요</p>
                <p className="text-sm text-gray-400 mt-1">여러 장 선택 가능</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Album Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">새 앨범 만들기</h2>
              <button
                onClick={() => setShowAlbumModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateAlbum(formData.get("albumName") as string);
              }}
              className="p-6"
            >
              <input
                name="albumName"
                type="text"
                placeholder="앨범 이름"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none mb-4 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAlbumModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600"
                >
                  만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
