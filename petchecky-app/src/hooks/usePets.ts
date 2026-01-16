"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPets,
  addPet,
  updatePet,
  deletePet,
  Pet,
} from "@/lib/supabase";

export interface PetProfile {
  id?: string;
  name: string;
  species: "dog" | "cat";
  breed: string;
  age: number;
  weight: number;
}

const STORAGE_KEY = "petchecky_pets";
const SELECTED_PET_KEY = "petchecky_selected_pet";

// LocalStorage 헬퍼 함수
function getLocalPets(): PetProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        return [{ ...parsed, id: `local_${Date.now()}` }];
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load pets:", e);
  }
  return [];
}

function getSelectedPetId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SELECTED_PET_KEY);
  } catch {
    return null;
  }
}

function saveLocalPets(pets: PetProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
  } catch (e) {
    console.error("Failed to save pets:", e);
  }
}

function saveSelectedPetId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(SELECTED_PET_KEY, id);
    } else {
      localStorage.removeItem(SELECTED_PET_KEY);
    }
  } catch (e) {
    console.error("Failed to save selected pet:", e);
  }
}

// DB -> UI 변환 함수
function dbPetToProfile(pet: Pet): PetProfile {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    age: pet.age,
    weight: Number(pet.weight),
  };
}

interface UsePetsOptions {
  userId?: string;
  authLoading?: boolean;
}

interface UsePetsReturn {
  pets: PetProfile[];
  selectedPet: PetProfile | null;
  selectedPetId: string | null;
  isLoaded: boolean;
  selectPet: (petId: string) => void;
  savePet: (profile: PetProfile, editingPetId?: string) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
}

export function usePets({ userId, authLoading = false }: UsePetsOptions): UsePetsReturn {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 현재 선택된 펫 (computed)
  const selectedPet = pets.find(p => p.id === selectedPetId) || pets[0] || null;

  // 데이터 로드
  useEffect(() => {
    async function loadPets() {
      if (authLoading) return;

      if (userId) {
        // 로그인: Supabase에서 로드
        const dbPets = await getPets(userId);
        if (dbPets.length > 0) {
          const loadedPets = dbPets.map(dbPetToProfile);
          setPets(loadedPets);

          const savedSelectedId = getSelectedPetId();
          if (savedSelectedId && loadedPets.some(p => p.id === savedSelectedId)) {
            setSelectedPetId(savedSelectedId);
          } else {
            setSelectedPetId(loadedPets[0].id || null);
          }
        } else {
          // DB에 펫 없으면 localStorage 확인 후 마이그레이션
          const localPets = getLocalPets();
          if (localPets.length > 0) {
            const migratedPets: PetProfile[] = [];
            for (const localPet of localPets) {
              const newPet = await addPet({
                user_id: userId,
                name: localPet.name,
                species: localPet.species,
                breed: localPet.breed,
                age: localPet.age,
                weight: localPet.weight,
              });
              if (newPet) {
                migratedPets.push(dbPetToProfile(newPet));
              }
            }
            setPets(migratedPets);
            if (migratedPets.length > 0) {
              setSelectedPetId(migratedPets[0].id || null);
            }
          }
        }
      } else {
        // 비로그인: localStorage에서 로드
        const localPets = getLocalPets();
        setPets(localPets);

        const savedSelectedId = getSelectedPetId();
        if (savedSelectedId && localPets.some(p => p.id === savedSelectedId)) {
          setSelectedPetId(savedSelectedId);
        } else if (localPets.length > 0) {
          setSelectedPetId(localPets[0].id || null);
        }
      }

      setIsLoaded(true);
    }

    loadPets();
  }, [userId, authLoading]);

  // 펫 선택
  const selectPet = useCallback((petId: string) => {
    setSelectedPetId(petId);
    saveSelectedPetId(petId);
  }, []);

  // 펫 저장 (추가/수정)
  const savePet = useCallback(async (profile: PetProfile, editingPetId?: string) => {
    if (userId) {
      if (editingPetId) {
        // 수정
        const updated = await updatePet(editingPetId, {
          name: profile.name,
          species: profile.species,
          breed: profile.breed,
          age: profile.age,
          weight: profile.weight,
        });
        if (updated) {
          const updatedProfile = dbPetToProfile(updated);
          setPets(prev => prev.map(p => p.id === editingPetId ? updatedProfile : p));
        }
      } else {
        // 새로 추가
        const newPet = await addPet({
          user_id: userId,
          name: profile.name,
          species: profile.species,
          breed: profile.breed,
          age: profile.age,
          weight: profile.weight,
        });
        if (newPet) {
          const newProfile = dbPetToProfile(newPet);
          setPets(prev => [...prev, newProfile]);
          setSelectedPetId(newProfile.id || null);
          saveSelectedPetId(newProfile.id || null);
        }
      }
    } else {
      if (editingPetId) {
        // 수정
        setPets(prev => {
          const updatedPets = prev.map(p =>
            p.id === editingPetId ? { ...profile, id: editingPetId } : p
          );
          saveLocalPets(updatedPets);
          return updatedPets;
        });
      } else {
        // 새로 추가
        const newId = `local_${Date.now()}`;
        const newProfile = { ...profile, id: newId };
        setPets(prev => {
          const updatedPets = [...prev, newProfile];
          saveLocalPets(updatedPets);
          return updatedPets;
        });
        setSelectedPetId(newId);
        saveSelectedPetId(newId);
      }
    }
  }, [userId]);

  // 펫 삭제
  const handleDeletePet = useCallback(async (petId: string) => {
    if (userId) {
      const success = await deletePet(petId);
      if (success) {
        setPets(prev => {
          const filtered = prev.filter(p => p.id !== petId);
          if (selectedPetId === petId && filtered.length > 0) {
            setSelectedPetId(filtered[0].id || null);
            saveSelectedPetId(filtered[0].id || null);
          } else if (filtered.length === 0) {
            setSelectedPetId(null);
            saveSelectedPetId(null);
          }
          return filtered;
        });
      }
    } else {
      setPets(prev => {
        const filtered = prev.filter(p => p.id !== petId);
        saveLocalPets(filtered);
        if (selectedPetId === petId && filtered.length > 0) {
          setSelectedPetId(filtered[0].id || null);
          saveSelectedPetId(filtered[0].id || null);
        } else if (filtered.length === 0) {
          setSelectedPetId(null);
          saveSelectedPetId(null);
        }
        return filtered;
      });
    }
  }, [userId, selectedPetId]);

  return {
    pets,
    selectedPet,
    selectedPetId,
    isLoaded,
    selectPet,
    savePet,
    deletePet: handleDeletePet,
  };
}
