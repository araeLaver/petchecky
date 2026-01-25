import { createStore, createResetters } from "./createStore";

// ============================================
// Types
// ============================================

export interface Pet {
  id: string;
  name: string;
  type: "dog" | "cat" | "bird" | "fish" | "other";
  breed?: string;
  birthDate?: string;
  weight?: number;
  gender?: "male" | "female";
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PetState {
  // State
  pets: Pet[];
  selectedPetId: string | null;
  isLoading: boolean;
  error: string | null;

  // Computed (getters)
  selectedPet: Pet | null;

  // Actions
  setPets: (pets: Pet[]) => void;
  addPet: (pet: Pet) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  removePet: (id: string) => void;
  selectPet: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================
// Initial State
// ============================================

const initialState = {
  pets: [] as Pet[],
  selectedPetId: null as string | null,
  isLoading: false,
  error: null as string | null,
};

// ============================================
// Store
// ============================================

export const usePetStore = createStore<PetState>(
  (set, get) => ({
    // Initial state
    ...initialState,

    // Computed
    get selectedPet() {
      const { pets, selectedPetId } = get();
      return pets.find((pet) => pet.id === selectedPetId) || null;
    },

    // Actions
    setPets: (pets) =>
      set((state) => {
        state.pets = pets;
        state.error = null;
      }),

    addPet: (pet) =>
      set((state) => {
        state.pets.push(pet);
      }),

    updatePet: (id, updates) =>
      set((state) => {
        const index = state.pets.findIndex((pet) => pet.id === id);
        if (index !== -1) {
          state.pets[index] = { ...state.pets[index], ...updates, updatedAt: new Date().toISOString() };
        }
      }),

    removePet: (id) =>
      set((state) => {
        state.pets = state.pets.filter((pet) => pet.id !== id);
        if (state.selectedPetId === id) {
          state.selectedPetId = state.pets[0]?.id || null;
        }
      }),

    selectPet: (id) =>
      set((state) => {
        state.selectedPetId = id;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
        state.isLoading = false;
      }),

    ...createResetters(initialState, set),
  }),
  {
    name: "pet",
    persist: true,
    devtools: true,
  }
);

// ============================================
// Selectors
// ============================================

export const petSelectors = {
  pets: (state: PetState) => state.pets,
  selectedPet: (state: PetState) => state.selectedPet,
  isLoading: (state: PetState) => state.isLoading,
  error: (state: PetState) => state.error,
  petById: (id: string) => (state: PetState) => state.pets.find((pet) => pet.id === id),
  petsByType: (type: Pet["type"]) => (state: PetState) =>
    state.pets.filter((pet) => pet.type === type),
};
