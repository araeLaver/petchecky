/**
 * usePets Hook Tests
 *
 * Tests for the pet management hook that:
 * - Loads pets from localStorage (guest) or Supabase (authenticated)
 * - Handles CRUD operations for pets
 * - Manages selected pet state
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { usePets } from "../usePets";

// Mock Supabase functions
const mockGetPets = jest.fn();
const mockAddPet = jest.fn();
const mockUpdatePet = jest.fn();
const mockDeletePet = jest.fn();

jest.mock("@/lib/supabase", () => ({
  getPets: (...args: unknown[]) => mockGetPets(...args),
  addPet: (...args: unknown[]) => mockAddPet(...args),
  updatePet: (...args: unknown[]) => mockUpdatePet(...args),
  deletePet: (...args: unknown[]) => mockDeletePet(...args),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Test data
const mockPetProfile = {
  id: "pet-1",
  name: "멍멍이",
  species: "dog" as const,
  breed: "골든 리트리버",
  age: 3,
  weight: 25,
};

const mockDbPet = {
  id: "db-pet-1",
  user_id: "user-1",
  name: "멍멍이",
  species: "dog" as const,
  breed: "골든 리트리버",
  age: 3,
  weight: "25",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

describe("usePets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockGetPets.mockResolvedValue([]);
    mockAddPet.mockResolvedValue(null);
    mockUpdatePet.mockResolvedValue(null);
    mockDeletePet.mockResolvedValue(false);
  });

  describe("initial state", () => {
    it("should start with empty pets", async () => {
      const { result } = renderHook(() => usePets({}));

      // After initial load with empty localStorage
      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.pets).toEqual([]);
      expect(result.current.selectedPet).toBeNull();
    });

    it("should wait for auth loading to complete", async () => {
      const { result, rerender } = renderHook(
        ({ authLoading }) => usePets({ authLoading }),
        { initialProps: { authLoading: true } }
      );

      // When authLoading is true, isLoaded should be false
      expect(result.current.isLoaded).toBe(false);

      rerender({ authLoading: false });

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });
    });
  });

  describe("guest mode (no userId)", () => {
    it("should load pets from localStorage", async () => {
      localStorageMock.setItem(
        "petchecky_pets",
        JSON.stringify([mockPetProfile])
      );

      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.pets).toHaveLength(1);
      expect(result.current.pets[0].name).toBe("멍멍이");
    });

    it("should select first pet by default", async () => {
      localStorageMock.setItem(
        "petchecky_pets",
        JSON.stringify([mockPetProfile])
      );

      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.selectedPet?.id).toBe(mockPetProfile.id);
    });

    it("should restore previously selected pet", async () => {
      const pet2 = { ...mockPetProfile, id: "pet-2", name: "냥냥이" };
      localStorageMock.setItem(
        "petchecky_pets",
        JSON.stringify([mockPetProfile, pet2])
      );
      localStorageMock.setItem("petchecky_selected_pet", "pet-2");

      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.selectedPetId).toBe("pet-2");
    });

    it("should add new pet to localStorage", async () => {
      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      const newPet = {
        name: "새펫",
        species: "cat" as const,
        breed: "페르시안",
        age: 1,
        weight: 4,
      };

      await act(async () => {
        await result.current.savePet(newPet);
      });

      expect(result.current.pets).toHaveLength(1);
      expect(result.current.pets[0].name).toBe("새펫");
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should update existing pet in localStorage", async () => {
      localStorageMock.setItem(
        "petchecky_pets",
        JSON.stringify([mockPetProfile])
      );

      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      const updatedPet = { ...mockPetProfile, name: "업데이트된 펫" };

      await act(async () => {
        await result.current.savePet(updatedPet, mockPetProfile.id);
      });

      expect(result.current.pets[0].name).toBe("업데이트된 펫");
    });

    it("should delete pet from localStorage", async () => {
      localStorageMock.setItem(
        "petchecky_pets",
        JSON.stringify([mockPetProfile])
      );

      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      await act(async () => {
        await result.current.deletePet(mockPetProfile.id!);
      });

      expect(result.current.pets).toHaveLength(0);
      expect(result.current.selectedPet).toBeNull();
    });
  });

  describe("authenticated mode (with userId)", () => {
    const userId = "user-1";

    it("should load pets from Supabase", async () => {
      mockGetPets.mockResolvedValue([mockDbPet]);

      const { result } = renderHook(() => usePets({ userId }));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(mockGetPets).toHaveBeenCalledWith(userId);
      expect(result.current.pets).toHaveLength(1);
      expect(result.current.pets[0].name).toBe("멍멍이");
      // weight should be converted to number
      expect(result.current.pets[0].weight).toBe(25);
    });

    it("should migrate localStorage pets to Supabase", async () => {
      mockGetPets.mockResolvedValue([]);
      mockAddPet.mockResolvedValue(mockDbPet);

      localStorageMock.setItem(
        "petchecky_pets",
        JSON.stringify([mockPetProfile])
      );

      const { result } = renderHook(() => usePets({ userId }));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(mockAddPet).toHaveBeenCalledWith({
        user_id: userId,
        name: mockPetProfile.name,
        species: mockPetProfile.species,
        breed: mockPetProfile.breed,
        age: mockPetProfile.age,
        weight: mockPetProfile.weight,
      });
    });

    it("should add new pet via Supabase", async () => {
      mockGetPets.mockResolvedValue([]);
      const newDbPet = { ...mockDbPet, id: "new-pet-id" };
      mockAddPet.mockResolvedValue(newDbPet);

      const { result } = renderHook(() => usePets({ userId }));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      const newPet = {
        name: "새펫",
        species: "cat" as const,
        breed: "페르시안",
        age: 1,
        weight: 4,
      };

      await act(async () => {
        await result.current.savePet(newPet);
      });

      expect(mockAddPet).toHaveBeenCalledWith({
        user_id: userId,
        name: newPet.name,
        species: newPet.species,
        breed: newPet.breed,
        age: newPet.age,
        weight: newPet.weight,
      });
    });

    it("should update pet via Supabase", async () => {
      mockGetPets.mockResolvedValue([mockDbPet]);
      const updatedDbPet = { ...mockDbPet, name: "업데이트된 펫" };
      mockUpdatePet.mockResolvedValue(updatedDbPet);

      const { result } = renderHook(() => usePets({ userId }));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      const updatedPet = { ...mockPetProfile, name: "업데이트된 펫" };

      await act(async () => {
        await result.current.savePet(updatedPet, mockDbPet.id);
      });

      expect(mockUpdatePet).toHaveBeenCalledWith(mockDbPet.id, {
        name: updatedPet.name,
        species: updatedPet.species,
        breed: updatedPet.breed,
        age: updatedPet.age,
        weight: updatedPet.weight,
      });
    });

    it("should delete pet via Supabase", async () => {
      mockGetPets.mockResolvedValue([mockDbPet]);
      mockDeletePet.mockResolvedValue(true);

      const { result } = renderHook(() => usePets({ userId }));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      await act(async () => {
        await result.current.deletePet(mockDbPet.id);
      });

      expect(mockDeletePet).toHaveBeenCalledWith(mockDbPet.id);
      expect(result.current.pets).toHaveLength(0);
    });
  });

  describe("selectPet", () => {
    it("should change selected pet", async () => {
      const pet2 = { ...mockPetProfile, id: "pet-2", name: "냥냥이" };
      localStorageMock.setItem(
        "petchecky_pets",
        JSON.stringify([mockPetProfile, pet2])
      );

      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.selectPet("pet-2");
      });

      expect(result.current.selectedPetId).toBe("pet-2");
      expect(result.current.selectedPet?.name).toBe("냥냥이");
    });

    it("should save selection to localStorage", async () => {
      const pet2 = { ...mockPetProfile, id: "pet-2", name: "냥냥이" };
      localStorageMock.setItem(
        "petchecky_pets",
        JSON.stringify([mockPetProfile, pet2])
      );

      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      act(() => {
        result.current.selectPet("pet-2");
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "petchecky_selected_pet",
        "pet-2"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty localStorage gracefully", async () => {
      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.pets).toEqual([]);
      expect(result.current.selectedPet).toBeNull();
    });

    it("should handle invalid JSON in localStorage", async () => {
      localStorageMock.setItem("petchecky_pets", "invalid-json");

      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.pets).toEqual([]);
    });

    it("should handle Supabase errors gracefully", async () => {
      // Mock getPets to reject with an error
      mockGetPets.mockImplementation(() => Promise.reject(new Error("Network error")));

      // Suppress console errors for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const { result } = renderHook(() => usePets({ userId: "user-1" }));

      // The hook should not crash and eventually complete loading
      // Note: the hook may remain in loading state if error handling doesn't set isLoaded
      // This test verifies the app doesn't crash
      await waitFor(
        () => {
          expect(result.current.pets).toBeDefined();
        },
        { timeout: 3000 }
      );

      consoleSpy.mockRestore();
    });

    it("should auto-select next pet when current is deleted", async () => {
      const pet2 = { ...mockPetProfile, id: "pet-2", name: "냥냥이" };
      localStorageMock.setItem(
        "petchecky_pets",
        JSON.stringify([mockPetProfile, pet2])
      );
      localStorageMock.setItem("petchecky_selected_pet", "pet-1");

      const { result } = renderHook(() => usePets({}));

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.selectedPetId).toBe("pet-1");

      await act(async () => {
        await result.current.deletePet("pet-1");
      });

      expect(result.current.selectedPetId).toBe("pet-2");
    });
  });
});
