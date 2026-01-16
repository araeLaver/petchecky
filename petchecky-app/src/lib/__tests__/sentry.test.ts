import {
  captureError,
  captureMessage,
  setUser,
  setTag,
  setContext,
  addBreadcrumb,
  startTransaction,
  handleApiError,
  handleBoundaryError,
} from "../sentry";

describe("Sentry Utilities", () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
    console.debug = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
  });

  describe("captureError", () => {
    it("에러를 콘솔에 로깅", () => {
      const error = new Error("Test error");
      captureError(error, { extra: "context" });

      expect(console.error).toHaveBeenCalledWith(
        "[Error]",
        "Test error",
        { extra: "context" }
      );
    });
  });

  describe("captureMessage", () => {
    it("info 메시지를 콘솔에 로깅", () => {
      captureMessage("Test message", "info", { data: "value" });

      expect(console.info).toHaveBeenCalledWith(
        "[INFO]",
        "Test message",
        { data: "value" }
      );
    });

    it("error 메시지를 콘솔에 로깅", () => {
      captureMessage("Error message", "error");

      expect(console.error).toHaveBeenCalledWith(
        "[ERROR]",
        "Error message",
        undefined
      );
    });

    it("warning 메시지를 콘솔에 로깅", () => {
      captureMessage("Warning message", "warning");

      expect(console.warn).toHaveBeenCalledWith(
        "[WARNING]",
        "Warning message",
        undefined
      );
    });
  });

  describe("setUser", () => {
    it("사용자 설정 호출 가능", () => {
      expect(() => setUser({ id: "user-1", email: "test@example.com" })).not.toThrow();
    });

    it("null로 사용자 초기화 가능", () => {
      expect(() => setUser(null)).not.toThrow();
    });
  });

  describe("setTag", () => {
    it("태그 설정 호출 가능", () => {
      expect(() => setTag("environment", "production")).not.toThrow();
    });
  });

  describe("setContext", () => {
    it("컨텍스트 설정 호출 가능", () => {
      expect(() => setContext("pet", { id: "pet-1", name: "멍멍이" })).not.toThrow();
    });
  });

  describe("addBreadcrumb", () => {
    it("브레드크럼 추가 호출 가능", () => {
      expect(() =>
        addBreadcrumb({
          category: "navigation",
          message: "User navigated to /profile",
          level: "info",
        })
      ).not.toThrow();
    });
  });

  describe("startTransaction", () => {
    it("트랜잭션 시작 및 종료", () => {
      const transaction = startTransaction("test-transaction", "test-op");
      expect(transaction).toHaveProperty("finish");

      expect(() => transaction.finish()).not.toThrow();
      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe("handleApiError", () => {
    it("API 에러 처리", () => {
      const error = new Error("Network error");
      handleApiError(error, "/api/pets");

      expect(console.error).toHaveBeenCalledWith(
        "[Error]",
        "Network error",
        expect.objectContaining({
          endpoint: "/api/pets",
          errorType: "API_ERROR",
        })
      );
    });

    it("알 수 없는 에러 타입 처리", () => {
      handleApiError("Unknown error", "/api/pets");

      expect(console.error).toHaveBeenCalledWith(
        "[Error]",
        "Unknown error",
        expect.objectContaining({
          endpoint: "/api/pets",
        })
      );
    });
  });

  describe("handleBoundaryError", () => {
    it("Error Boundary 에러 처리", () => {
      const error = new Error("Component error");
      handleBoundaryError(error, { componentStack: "<App> in div" });

      expect(console.error).toHaveBeenCalledWith(
        "[Error]",
        "Component error",
        expect.objectContaining({
          componentStack: "<App> in div",
          errorType: "REACT_BOUNDARY_ERROR",
        })
      );
    });
  });
});
