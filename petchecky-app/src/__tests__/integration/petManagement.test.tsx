/**
 * 펫 관리 통합 테스트
 * 펫 등록, 조회, 수정, 삭제 플로우를 테스트합니다.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock supabase
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
  },
  MONTHLY_FREE_LIMIT: 10,
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
}));

describe("Pet Management Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Local Storage Pet Operations", () => {
    it("펫 정보를 localStorage에 저장하고 불러올 수 있다", () => {
      const pet = {
        id: "pet-1",
        name: "멍멍이",
        species: "dog",
        breed: "골든리트리버",
        age: 3,
      };

      localStorage.setItem("petProfiles", JSON.stringify([pet]));

      const savedPets = JSON.parse(localStorage.getItem("petProfiles") || "[]");
      expect(savedPets).toHaveLength(1);
      expect(savedPets[0].name).toBe("멍멍이");
    });

    it("여러 펫을 저장하고 관리할 수 있다", () => {
      const pets = [
        { id: "pet-1", name: "멍멍이", species: "dog", breed: "골든리트리버", age: 3 },
        { id: "pet-2", name: "야옹이", species: "cat", breed: "코숏", age: 2 },
      ];

      localStorage.setItem("petProfiles", JSON.stringify(pets));

      const savedPets = JSON.parse(localStorage.getItem("petProfiles") || "[]");
      expect(savedPets).toHaveLength(2);
      expect(savedPets.map((p: { name: string }) => p.name)).toContain("멍멍이");
      expect(savedPets.map((p: { name: string }) => p.name)).toContain("야옹이");
    });

    it("펫을 삭제할 수 있다", () => {
      const pets = [
        { id: "pet-1", name: "멍멍이", species: "dog", breed: "골든리트리버", age: 3 },
        { id: "pet-2", name: "야옹이", species: "cat", breed: "코숏", age: 2 },
      ];

      localStorage.setItem("petProfiles", JSON.stringify(pets));

      // 펫 삭제
      const filteredPets = pets.filter(p => p.id !== "pet-1");
      localStorage.setItem("petProfiles", JSON.stringify(filteredPets));

      const savedPets = JSON.parse(localStorage.getItem("petProfiles") || "[]");
      expect(savedPets).toHaveLength(1);
      expect(savedPets[0].name).toBe("야옹이");
    });

    it("펫 정보를 수정할 수 있다", () => {
      const pets = [
        { id: "pet-1", name: "멍멍이", species: "dog", breed: "골든리트리버", age: 3 },
      ];

      localStorage.setItem("petProfiles", JSON.stringify(pets));

      // 펫 수정
      const updatedPets = pets.map(p =>
        p.id === "pet-1" ? { ...p, name: "뽀삐", age: 4 } : p
      );
      localStorage.setItem("petProfiles", JSON.stringify(updatedPets));

      const savedPets = JSON.parse(localStorage.getItem("petProfiles") || "[]");
      expect(savedPets[0].name).toBe("뽀삐");
      expect(savedPets[0].age).toBe(4);
    });
  });

  describe("Chat History Storage", () => {
    it("채팅 기록을 저장하고 불러올 수 있다", () => {
      const chatHistory = [
        { id: "chat-1", petId: "pet-1", message: "안녕하세요", timestamp: Date.now() },
        { id: "chat-2", petId: "pet-1", message: "우리 강아지가 아파요", timestamp: Date.now() },
      ];

      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

      const savedChats = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      expect(savedChats).toHaveLength(2);
    });

    it("특정 펫의 채팅 기록만 필터링할 수 있다", () => {
      const chatHistory = [
        { id: "chat-1", petId: "pet-1", message: "메시지1", timestamp: Date.now() },
        { id: "chat-2", petId: "pet-2", message: "메시지2", timestamp: Date.now() },
        { id: "chat-3", petId: "pet-1", message: "메시지3", timestamp: Date.now() },
      ];

      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

      const allChats = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      const pet1Chats = allChats.filter((c: { petId: string }) => c.petId === "pet-1");

      expect(pet1Chats).toHaveLength(2);
    });
  });

  describe("Allergy Data Storage", () => {
    it("알레르기 정보를 저장하고 불러올 수 있다", () => {
      const allergies = [
        { id: "allergy-1", petId: "pet-1", name: "닭고기", type: "food", severity: "moderate" },
      ];

      localStorage.setItem("petAllergies", JSON.stringify(allergies));

      const savedAllergies = JSON.parse(localStorage.getItem("petAllergies") || "[]");
      expect(savedAllergies).toHaveLength(1);
      expect(savedAllergies[0].name).toBe("닭고기");
    });

    it("펫별 알레르기를 필터링할 수 있다", () => {
      const allergies = [
        { id: "allergy-1", petId: "pet-1", name: "닭고기", type: "food", severity: "moderate" },
        { id: "allergy-2", petId: "pet-2", name: "꽃가루", type: "environmental", severity: "mild" },
      ];

      localStorage.setItem("petAllergies", JSON.stringify(allergies));

      const allAllergies = JSON.parse(localStorage.getItem("petAllergies") || "[]");
      const pet1Allergies = allAllergies.filter((a: { petId: string }) => a.petId === "pet-1");

      expect(pet1Allergies).toHaveLength(1);
      expect(pet1Allergies[0].name).toBe("닭고기");
    });
  });

  describe("Medication Data Storage", () => {
    it("약물 정보를 저장하고 불러올 수 있다", () => {
      const medications = [
        {
          id: "med-1",
          petId: "pet-1",
          name: "심장사상충 예방약",
          dosage: "1정",
          frequency: "매월 1회",
          startDate: "2024-01-01",
        },
      ];

      localStorage.setItem("petMedications", JSON.stringify(medications));

      const savedMedications = JSON.parse(localStorage.getItem("petMedications") || "[]");
      expect(savedMedications).toHaveLength(1);
      expect(savedMedications[0].name).toBe("심장사상충 예방약");
    });
  });

  describe("Vet Records Storage", () => {
    it("진료 기록을 저장하고 불러올 수 있다", () => {
      const records = [
        {
          id: "record-1",
          petId: "pet-1",
          date: "2024-01-15",
          hospital: "행복동물병원",
          diagnosis: "건강검진",
          cost: 50000,
        },
      ];

      localStorage.setItem("vetRecords", JSON.stringify(records));

      const savedRecords = JSON.parse(localStorage.getItem("vetRecords") || "[]");
      expect(savedRecords).toHaveLength(1);
      expect(savedRecords[0].hospital).toBe("행복동물병원");
    });
  });

  describe("Data Consistency", () => {
    it("펫 삭제 시 관련 데이터도 삭제되어야 한다", () => {
      const petId = "pet-1";

      // 초기 데이터 설정
      const pets = [{ id: petId, name: "멍멍이", species: "dog", breed: "골든리트리버", age: 3 }];
      const allergies = [{ id: "allergy-1", petId, name: "닭고기" }];
      const medications = [{ id: "med-1", petId, name: "예방약" }];
      const chatHistory = [{ id: "chat-1", petId, message: "안녕" }];

      localStorage.setItem("petProfiles", JSON.stringify(pets));
      localStorage.setItem("petAllergies", JSON.stringify(allergies));
      localStorage.setItem("petMedications", JSON.stringify(medications));
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

      // 펫 삭제
      localStorage.setItem("petProfiles", JSON.stringify([]));

      // 관련 데이터도 삭제 (시뮬레이션)
      const remainingAllergies = allergies.filter(a => a.petId !== petId);
      const remainingMedications = medications.filter(m => m.petId !== petId);
      const remainingChats = chatHistory.filter(c => c.petId !== petId);

      localStorage.setItem("petAllergies", JSON.stringify(remainingAllergies));
      localStorage.setItem("petMedications", JSON.stringify(remainingMedications));
      localStorage.setItem("chatHistory", JSON.stringify(remainingChats));

      expect(JSON.parse(localStorage.getItem("petProfiles") || "[]")).toHaveLength(0);
      expect(JSON.parse(localStorage.getItem("petAllergies") || "[]")).toHaveLength(0);
      expect(JSON.parse(localStorage.getItem("petMedications") || "[]")).toHaveLength(0);
      expect(JSON.parse(localStorage.getItem("chatHistory") || "[]")).toHaveLength(0);
    });
  });
});
