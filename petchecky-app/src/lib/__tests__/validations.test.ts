import {
  petProfileSchema,
  communityPostSchema,
  commentSchema,
  allergySchema,
  vetRecordSchema,
  medicationSchema,
  reservationSchema,
  validateForm,
  validateField,
} from "../validations";

describe("Validation Schemas", () => {
  describe("petProfileSchema", () => {
    it("유효한 펫 프로필 통과", () => {
      const validPet = {
        name: "멍멍이",
        species: "dog",
        breed: "골든리트리버",
        age: 3,
      };
      const result = petProfileSchema.safeParse(validPet);
      expect(result.success).toBe(true);
    });

    it("이름이 없으면 실패", () => {
      const invalidPet = {
        name: "",
        species: "dog",
        breed: "골든리트리버",
        age: 3,
      };
      const result = petProfileSchema.safeParse(invalidPet);
      expect(result.success).toBe(false);
    });

    it("이름이 너무 길면 실패", () => {
      const invalidPet = {
        name: "매우긴이름이름이름이름이름이름이름이름이름이름이름",
        species: "dog",
        breed: "골든리트리버",
        age: 3,
      };
      const result = petProfileSchema.safeParse(invalidPet);
      expect(result.success).toBe(false);
    });

    it("나이가 음수면 실패", () => {
      const invalidPet = {
        name: "멍멍이",
        species: "dog",
        breed: "골든리트리버",
        age: -1,
      };
      const result = petProfileSchema.safeParse(invalidPet);
      expect(result.success).toBe(false);
    });

    it("선택 필드는 생략 가능", () => {
      const validPet = {
        name: "멍멍이",
        species: "cat",
        breed: "코숏",
        age: 2,
      };
      const result = petProfileSchema.safeParse(validPet);
      expect(result.success).toBe(true);
    });
  });

  describe("communityPostSchema", () => {
    it("유효한 게시글 통과", () => {
      const validPost = {
        title: "질문있어요",
        content: "우리 강아지가 구토를 했는데 병원에 가야할까요?",
        category: "question",
      };
      const result = communityPostSchema.safeParse(validPost);
      expect(result.success).toBe(true);
    });

    it("제목이 짧으면 실패", () => {
      const invalidPost = {
        title: "Q",
        content: "우리 강아지가 구토를 했는데 병원에 가야할까요?",
        category: "question",
      };
      const result = communityPostSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
    });

    it("내용이 짧으면 실패", () => {
      const invalidPost = {
        title: "질문있어요",
        content: "짧은내용",
        category: "question",
      };
      const result = communityPostSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
    });

    it("유효하지 않은 카테고리면 실패", () => {
      const invalidPost = {
        title: "질문있어요",
        content: "우리 강아지가 구토를 했는데 병원에 가야할까요?",
        category: "invalid",
      };
      const result = communityPostSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
    });
  });

  describe("commentSchema", () => {
    it("유효한 댓글 통과", () => {
      const validComment = { content: "좋은 정보 감사합니다!" };
      const result = commentSchema.safeParse(validComment);
      expect(result.success).toBe(true);
    });

    it("빈 댓글 실패", () => {
      const invalidComment = { content: "" };
      const result = commentSchema.safeParse(invalidComment);
      expect(result.success).toBe(false);
    });
  });

  describe("allergySchema", () => {
    it("유효한 알레르기 통과", () => {
      const validAllergy = {
        name: "닭고기",
        type: "food",
        severity: "moderate",
      };
      const result = allergySchema.safeParse(validAllergy);
      expect(result.success).toBe(true);
    });

    it("알레르겐 이름이 없으면 실패", () => {
      const invalidAllergy = {
        name: "",
        type: "food",
        severity: "moderate",
      };
      const result = allergySchema.safeParse(invalidAllergy);
      expect(result.success).toBe(false);
    });
  });

  describe("vetRecordSchema", () => {
    it("유효한 진료 기록 통과", () => {
      const validRecord = {
        date: "2024-01-15",
        hospital: "행복동물병원",
      };
      const result = vetRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
    });

    it("날짜가 없으면 실패", () => {
      const invalidRecord = {
        date: "",
        hospital: "행복동물병원",
      };
      const result = vetRecordSchema.safeParse(invalidRecord);
      expect(result.success).toBe(false);
    });
  });

  describe("medicationSchema", () => {
    it("유효한 약물 기록 통과", () => {
      const validMedication = {
        name: "심장사상충 예방약",
        dosage: "1정",
        frequency: "매월 1회",
        startDate: "2024-01-01",
      };
      const result = medicationSchema.safeParse(validMedication);
      expect(result.success).toBe(true);
    });

    it("약물명이 없으면 실패", () => {
      const invalidMedication = {
        name: "",
        dosage: "1정",
        frequency: "매월 1회",
        startDate: "2024-01-01",
      };
      const result = medicationSchema.safeParse(invalidMedication);
      expect(result.success).toBe(false);
    });
  });

  describe("reservationSchema", () => {
    it("유효한 예약 통과", () => {
      const validReservation = {
        hospitalId: "hospital-1",
        date: "2024-01-20",
        time: "14:00",
        petId: "pet-1",
        reason: "정기 건강검진을 받고 싶습니다",
      };
      const result = reservationSchema.safeParse(validReservation);
      expect(result.success).toBe(true);
    });

    it("예약 사유가 짧으면 실패", () => {
      const invalidReservation = {
        hospitalId: "hospital-1",
        date: "2024-01-20",
        time: "14:00",
        petId: "pet-1",
        reason: "검진",
      };
      const result = reservationSchema.safeParse(invalidReservation);
      expect(result.success).toBe(false);
    });

    it("유효하지 않은 전화번호 실패", () => {
      const invalidReservation = {
        hospitalId: "hospital-1",
        date: "2024-01-20",
        time: "14:00",
        petId: "pet-1",
        reason: "정기 건강검진을 받고 싶습니다",
        contact: "123-456",
      };
      const result = reservationSchema.safeParse(invalidReservation);
      expect(result.success).toBe(false);
    });
  });

  describe("validateForm", () => {
    it("유효한 데이터면 success: true 반환", () => {
      const data = { content: "테스트 댓글입니다" };
      const result = validateForm(commentSchema, data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it("유효하지 않은 데이터면 errors 반환", () => {
      const data = { content: "" };
      const result = validateForm(commentSchema, data);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.content).toBeDefined();
    });
  });

  describe("validateField", () => {
    it("유효한 필드면 null 반환", () => {
      const result = validateField(petProfileSchema, "name", "멍멍이");
      expect(result).toBeNull();
    });

    it("유효하지 않은 필드면 에러 메시지 반환", () => {
      const result = validateField(petProfileSchema, "name", "");
      expect(result).toBe("이름을 입력해주세요");
    });

    it("나이가 음수면 에러 메시지 반환", () => {
      const result = validateField(petProfileSchema, "age", -5);
      expect(result).toBe("나이는 0 이상이어야 합니다");
    });
  });
});
