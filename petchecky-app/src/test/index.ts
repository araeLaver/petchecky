// Test utilities and re-exports from @testing-library/react
export * from "./utils";

// Test data factories
export {
  generateId,
  resetIdCounter,
  createMockUser,
  createMockPet,
  createMockCat,
  createMockHealthRecord,
  createMockWalkRecord,
  createMockPost,
  createMockComment,
  createMockNotification,
  createMockApiResponse,
  createMockApiError,
  createMany,
  createPastDate,
  createFutureDate,
  createDateString,
  type MockUser,
  type MockPet,
  type MockHealthRecord,
  type MockWalkRecord,
  type MockPost,
  type MockComment,
  type MockNotification,
  type MockApiResponse,
} from "./factories";

// Custom matchers are auto-registered via jest.setup.ts
