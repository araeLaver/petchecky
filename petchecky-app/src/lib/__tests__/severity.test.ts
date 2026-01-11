import {
  analyzeSeverity,
  analyzeCombinedSeverity,
  getSeverityStyle,
  getSeverityBadgeStyle,
  getSeverityLabel,
  getSeverityConfig,
} from "../severity";

describe("severity utilities", () => {
  describe("analyzeSeverity", () => {
    it("should return high for emergency keywords in Korean", () => {
      expect(analyzeSeverity("응급 상황입니다", "ko")).toBe("high");
      expect(analyzeSeverity("즉시 병원에 가세요", "ko")).toBe("high");
      expect(analyzeSeverity("출혈이 심합니다", "ko")).toBe("high");
      expect(analyzeSeverity("호흡곤란 증상", "ko")).toBe("high");
      expect(analyzeSeverity("경련을 일으켰어요", "ko")).toBe("high");
    });

    it("should return high for emergency keywords in English", () => {
      expect(analyzeSeverity("This is an emergency", "en")).toBe("high");
      expect(analyzeSeverity("Go immediately to the vet", "en")).toBe("high");
      expect(analyzeSeverity("Severe bleeding", "en")).toBe("high");
      expect(analyzeSeverity("The pet is unconscious", "en")).toBe("high");
    });

    it("should return high for emergency keywords in Japanese", () => {
      expect(analyzeSeverity("緊急事態です", "ja")).toBe("high");
      expect(analyzeSeverity("すぐに病院へ", "ja")).toBe("high");
      expect(analyzeSeverity("出血がひどい", "ja")).toBe("high");
    });

    it("should return medium for caution keywords in Korean", () => {
      expect(analyzeSeverity("병원 방문을 권장합니다", "ko")).toBe("medium");
      expect(analyzeSeverity("검사가 필요합니다", "ko")).toBe("medium");
      expect(analyzeSeverity("주의가 필요합니다", "ko")).toBe("medium");
      expect(analyzeSeverity("증상이 지속됩니다", "ko")).toBe("medium");
    });

    it("should return medium for caution keywords in English", () => {
      expect(analyzeSeverity("A vet visit is recommended", "en")).toBe("medium");
      expect(analyzeSeverity("Needs examination", "en")).toBe("medium");
      expect(analyzeSeverity("Symptoms are persistent", "en")).toBe("medium");
    });

    it("should return low for normal text", () => {
      expect(analyzeSeverity("건강한 상태입니다", "ko")).toBe("low");
      expect(analyzeSeverity("Everything looks normal", "en")).toBe("low");
      expect(analyzeSeverity("正常です", "ja")).toBe("low");
    });

    it("should be case insensitive", () => {
      expect(analyzeSeverity("EMERGENCY situation", "en")).toBe("high");
      expect(analyzeSeverity("Urgent CASE", "en")).toBe("high");
    });

    it("should default to Korean when language not found", () => {
      expect(analyzeSeverity("응급 상황입니다", "ko")).toBe("high");
    });
  });

  describe("analyzeCombinedSeverity", () => {
    it("should analyze combined question and response", () => {
      const question = "강아지가 갑자기 쓰러졌어요";
      const response = "응급 상황일 수 있습니다";
      expect(analyzeCombinedSeverity(question, response, "ko")).toBe("high");
    });

    it("should return high if either contains high severity keyword", () => {
      const question = "강아지가 졸려해요";
      const response = "중독 가능성이 있습니다";
      expect(analyzeCombinedSeverity(question, response, "ko")).toBe("high");
    });

    it("should return low for normal conversation", () => {
      const question = "강아지 산책은 얼마나 해야하나요";
      const response = "하루에 30분 정도 권장합니다";
      expect(analyzeCombinedSeverity(question, response, "ko")).toBe("low");
    });
  });

  describe("getSeverityStyle", () => {
    it("should return correct style for high severity", () => {
      expect(getSeverityStyle("high")).toContain("red");
      expect(getSeverityStyle("high")).toContain("border");
    });

    it("should return correct style for medium severity", () => {
      expect(getSeverityStyle("medium")).toContain("yellow");
    });

    it("should return correct style for low severity", () => {
      expect(getSeverityStyle("low")).toContain("green");
    });
  });

  describe("getSeverityBadgeStyle", () => {
    it("should return correct badge style for each severity", () => {
      expect(getSeverityBadgeStyle("high")).toContain("red");
      expect(getSeverityBadgeStyle("medium")).toContain("yellow");
      expect(getSeverityBadgeStyle("low")).toContain("green");
    });
  });

  describe("getSeverityLabel", () => {
    it("should return Korean labels by default", () => {
      expect(getSeverityLabel("high")).toContain("병원 방문");
      expect(getSeverityLabel("medium")).toContain("경과 관찰");
      expect(getSeverityLabel("low")).toContain("일반적인");
    });

    it("should return English labels", () => {
      expect(getSeverityLabel("high", "en")).toContain("Vet Visit");
      expect(getSeverityLabel("medium", "en")).toContain("Observation");
      expect(getSeverityLabel("low", "en")).toContain("Normal");
    });

    it("should return Japanese labels", () => {
      expect(getSeverityLabel("high", "ja")).toContain("病院受診");
      expect(getSeverityLabel("medium", "ja")).toContain("経過観察");
      expect(getSeverityLabel("low", "ja")).toContain("一般的");
    });

    it("should include appropriate emojis", () => {
      expect(getSeverityLabel("high")).toContain("🚨");
      expect(getSeverityLabel("medium")).toContain("⚠️");
      expect(getSeverityLabel("low")).toContain("✅");
    });
  });

  describe("getSeverityConfig", () => {
    it("should return complete config for high severity", () => {
      const config = getSeverityConfig("high", "ko");
      expect(config.emoji).toBe("🚨");
      expect(config.title).toContain("위험");
      expect(config.buttonStyle).toContain("red");
      expect(config.borderStyle).toContain("red");
    });

    it("should return complete config for medium severity", () => {
      const config = getSeverityConfig("medium", "ko");
      expect(config.emoji).toBe("⚠️");
      expect(config.title).toContain("주의");
      expect(config.buttonStyle).toContain("yellow");
    });

    it("should return complete config for low severity", () => {
      const config = getSeverityConfig("low", "ko");
      expect(config.emoji).toBe("✅");
      expect(config.title).toContain("안심");
      expect(config.buttonStyle).toContain("green");
    });

    it("should return English config", () => {
      const config = getSeverityConfig("high", "en");
      expect(config.title).toContain("Critical");
      expect(config.buttonText).toBe("Find Nearby Vet");
    });

    it("should return Japanese config", () => {
      const config = getSeverityConfig("medium", "ja");
      expect(config.title).toContain("注意");
      expect(config.buttonText).toBe("病院情報を見る");
    });
  });
});
