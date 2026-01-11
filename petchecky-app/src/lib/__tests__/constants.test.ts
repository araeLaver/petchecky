import {
  LIMITS,
  FILE_LIMITS,
  API_CONFIG,
  SEVERITY_KEYWORDS,
  PET_EMOJI,
  ERROR_MESSAGES,
  SUBSCRIPTION_PLANS,
} from "../constants";

describe("constants", () => {
  describe("LIMITS", () => {
    it("should have correct monthly free message limit", () => {
      expect(LIMITS.MONTHLY_FREE_MESSAGES).toBe(20);
    });

    it("should have correct message max length", () => {
      expect(LIMITS.MESSAGE_MAX_LENGTH).toBe(2000);
    });

    it("should have correct pet name max length", () => {
      expect(LIMITS.PET_NAME_MAX_LENGTH).toBe(50);
    });

    it("should have correct description max length", () => {
      expect(LIMITS.DESCRIPTION_MAX_LENGTH).toBe(500);
    });

    it("should have correct history counts", () => {
      expect(LIMITS.MESSAGE_HISTORY_COUNT).toBe(6);
      expect(LIMITS.ANALYSIS_HISTORY_COUNT).toBe(20);
    });
  });

  describe("FILE_LIMITS", () => {
    it("should have correct max image size (5MB)", () => {
      expect(FILE_LIMITS.MAX_IMAGE_SIZE).toBe(5 * 1024 * 1024);
    });

    it("should allow common image types", () => {
      expect(FILE_LIMITS.ALLOWED_IMAGE_TYPES).toContain("image/jpeg");
      expect(FILE_LIMITS.ALLOWED_IMAGE_TYPES).toContain("image/png");
      expect(FILE_LIMITS.ALLOWED_IMAGE_TYPES).toContain("image/gif");
      expect(FILE_LIMITS.ALLOWED_IMAGE_TYPES).toContain("image/webp");
    });
  });

  describe("API_CONFIG", () => {
    it("should have Gemini model configured", () => {
      expect(API_CONFIG.GEMINI_MODEL).toBe("gemini-2.5-flash");
    });

    it("should have correct Gemini base URL", () => {
      expect(API_CONFIG.GEMINI_BASE_URL).toContain("generativelanguage.googleapis.com");
    });
  });

  describe("SEVERITY_KEYWORDS", () => {
    it("should have high severity keywords for all languages", () => {
      expect(SEVERITY_KEYWORDS.high.ko.length).toBeGreaterThan(0);
      expect(SEVERITY_KEYWORDS.high.en.length).toBeGreaterThan(0);
      expect(SEVERITY_KEYWORDS.high.ja.length).toBeGreaterThan(0);
    });

    it("should have medium severity keywords for all languages", () => {
      expect(SEVERITY_KEYWORDS.medium.ko.length).toBeGreaterThan(0);
      expect(SEVERITY_KEYWORDS.medium.en.length).toBeGreaterThan(0);
      expect(SEVERITY_KEYWORDS.medium.ja.length).toBeGreaterThan(0);
    });

    it("should include critical keywords in high severity", () => {
      expect(SEVERITY_KEYWORDS.high.ko).toContain("응급");
      expect(SEVERITY_KEYWORDS.high.en).toContain("emergency");
      expect(SEVERITY_KEYWORDS.high.ja).toContain("緊急");
    });
  });

  describe("PET_EMOJI", () => {
    it("should have emoji for dog", () => {
      expect(PET_EMOJI.dog).toBe("🐕");
    });

    it("should have emoji for cat", () => {
      expect(PET_EMOJI.cat).toBe("🐈");
    });
  });

  describe("ERROR_MESSAGES", () => {
    it("should have Korean error messages", () => {
      expect(ERROR_MESSAGES.ko.LOGIN_REQUIRED).toBeTruthy();
      expect(ERROR_MESSAGES.ko.NETWORK_ERROR).toBeTruthy();
      expect(ERROR_MESSAGES.ko.GENERAL_ERROR).toBeTruthy();
      expect(ERROR_MESSAGES.ko.LIMIT_EXCEEDED).toBeTruthy();
      expect(ERROR_MESSAGES.ko.PREMIUM_REQUIRED).toBeTruthy();
    });

    it("should have English error messages", () => {
      expect(ERROR_MESSAGES.en.LOGIN_REQUIRED).toBeTruthy();
      expect(ERROR_MESSAGES.en.NETWORK_ERROR).toBeTruthy();
      expect(ERROR_MESSAGES.en.GENERAL_ERROR).toBeTruthy();
    });

    it("should have Japanese error messages", () => {
      expect(ERROR_MESSAGES.ja.LOGIN_REQUIRED).toBeTruthy();
      expect(ERROR_MESSAGES.ja.NETWORK_ERROR).toBeTruthy();
      expect(ERROR_MESSAGES.ja.GENERAL_ERROR).toBeTruthy();
    });

    it("should have all required error types", () => {
      const requiredKeys = [
        "LOGIN_REQUIRED",
        "NETWORK_ERROR",
        "GENERAL_ERROR",
        "LIMIT_EXCEEDED",
        "PREMIUM_REQUIRED",
        "PREMIUM_PLUS_REQUIRED",
        "INVALID_INPUT",
        "FILE_TOO_LARGE",
        "INVALID_FILE_TYPE",
      ];

      for (const key of requiredKeys) {
        expect(ERROR_MESSAGES.ko).toHaveProperty(key);
        expect(ERROR_MESSAGES.en).toHaveProperty(key);
        expect(ERROR_MESSAGES.ja).toHaveProperty(key);
      }
    });
  });

  describe("SUBSCRIPTION_PLANS", () => {
    it("should have free plan", () => {
      expect(SUBSCRIPTION_PLANS.FREE).toBe("free");
    });

    it("should have premium plan", () => {
      expect(SUBSCRIPTION_PLANS.PREMIUM).toBe("premium");
    });

    it("should have premium plus plan", () => {
      expect(SUBSCRIPTION_PLANS.PREMIUM_PLUS).toBe("premium_plus");
    });
  });
});
