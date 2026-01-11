import {
  AppError,
  ERROR_CODES,
  createError,
  getErrorMessage,
  tryCatch,
  isAppError,
  isNetworkError,
} from "../errors";

describe("error utilities", () => {
  describe("AppError", () => {
    it("should create an error with code, message, and statusCode", () => {
      const error = new AppError("TEST_CODE", "Test message", 400);
      expect(error.code).toBe("TEST_CODE");
      expect(error.message).toBe("Test message");
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("AppError");
    });

    it("should default to statusCode 500", () => {
      const error = new AppError("TEST_CODE", "Test message");
      expect(error.statusCode).toBe(500);
    });

    it("should accept optional details", () => {
      const details = { field: "email", reason: "invalid" };
      const error = new AppError("TEST_CODE", "Test message", 400, details);
      expect(error.details).toEqual(details);
    });
  });

  describe("ERROR_CODES", () => {
    it("should contain all standard error codes", () => {
      expect(ERROR_CODES.AUTH_REQUIRED).toBe("AUTH_REQUIRED");
      expect(ERROR_CODES.UNAUTHORIZED).toBe("UNAUTHORIZED");
      expect(ERROR_CODES.LIMIT_EXCEEDED).toBe("LIMIT_EXCEEDED");
      expect(ERROR_CODES.PREMIUM_REQUIRED).toBe("PREMIUM_REQUIRED");
      expect(ERROR_CODES.PREMIUM_PLUS_REQUIRED).toBe("PREMIUM_PLUS_REQUIRED");
      expect(ERROR_CODES.INVALID_INPUT).toBe("INVALID_INPUT");
      expect(ERROR_CODES.NOT_FOUND).toBe("NOT_FOUND");
      expect(ERROR_CODES.NETWORK_ERROR).toBe("NETWORK_ERROR");
      expect(ERROR_CODES.SERVER_ERROR).toBe("SERVER_ERROR");
      expect(ERROR_CODES.DATABASE_ERROR).toBe("DATABASE_ERROR");
    });
  });

  describe("createError", () => {
    it("should create an AppError with given parameters", () => {
      const error = createError(ERROR_CODES.INVALID_INPUT, "Invalid email", 400);
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe("INVALID_INPUT");
      expect(error.message).toBe("Invalid email");
      expect(error.statusCode).toBe(400);
    });

    it("should default to statusCode 500", () => {
      const error = createError(ERROR_CODES.SERVER_ERROR, "Server error");
      expect(error.statusCode).toBe(500);
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from Error instance", () => {
      const error = new Error("Something went wrong");
      expect(getErrorMessage(error)).toBe("Something went wrong");
    });

    it("should return string directly if string is passed", () => {
      expect(getErrorMessage("Direct error string")).toBe("Direct error string");
    });

    it("should return default message for unknown types", () => {
      expect(getErrorMessage(null)).toBe("Unknown error occurred");
      expect(getErrorMessage(undefined)).toBe("Unknown error occurred");
      expect(getErrorMessage(123)).toBe("Unknown error occurred");
      expect(getErrorMessage({ foo: "bar" })).toBe("Unknown error occurred");
    });

    it("should extract message from AppError", () => {
      const error = new AppError("CODE", "App error message", 500);
      expect(getErrorMessage(error)).toBe("App error message");
    });
  });

  describe("tryCatch", () => {
    it("should return result on success", async () => {
      const result = await tryCatch(async () => "success");
      expect(result).toBe("success");
    });

    it("should throw error when no handler provided", async () => {
      await expect(
        tryCatch(async () => {
          throw new Error("Test error");
        })
      ).rejects.toThrow("Test error");
    });

    it("should call error handler on failure", async () => {
      const result = await tryCatch(
        async () => {
          throw new Error("Test error");
        },
        () => "fallback"
      );
      expect(result).toBe("fallback");
    });

    it("should pass error to error handler", async () => {
      const errorHandler = jest.fn().mockReturnValue("handled");
      await tryCatch(async () => {
        throw new Error("Test error");
      }, errorHandler);
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should work with async error handlers", async () => {
      const result = await tryCatch(
        async () => {
          throw new Error("Test error");
        },
        async () => {
          await Promise.resolve();
          return "async fallback";
        }
      );
      expect(result).toBe("async fallback");
    });
  });

  describe("isAppError", () => {
    it("should return true for AppError instances", () => {
      const error = new AppError("CODE", "message");
      expect(isAppError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("message");
      expect(isAppError(error)).toBe(false);
    });

    it("should return false for non-error values", () => {
      expect(isAppError("string")).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
      expect(isAppError({})).toBe(false);
    });
  });

  describe("isNetworkError", () => {
    it("should return true for TypeError", () => {
      const error = new TypeError("Failed to fetch");
      expect(isNetworkError(error)).toBe(true);
    });

    it("should return true for errors with fetch in message", () => {
      const error = new Error("Failed to fetch data");
      expect(isNetworkError(error)).toBe(true);
    });

    it("should return true for errors with network in message", () => {
      const error = new Error("network error occurred");
      expect(isNetworkError(error)).toBe(true);
    });

    it("should return false for regular errors", () => {
      const error = new Error("Something went wrong");
      expect(isNetworkError(error)).toBe(false);
    });

    it("should return false for non-error values", () => {
      expect(isNetworkError("string")).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });
});
