import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // next.config.js와 .env 파일을 로드할 Next.js 앱의 경로
  dir: "./",
});

const config: Config = {
  // 테스트 환경
  testEnvironment: "jsdom",

  // 테스트 파일 패턴
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],

  // 모듈 경로 별칭 (tsconfig의 paths와 일치)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // 테스트 설정 파일
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // 커버리지 수집 경로
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/node_modules/**",
  ],

  // 커버리지 제외 경로
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
  ],

  // TypeScript 변환
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  // 테스트 제외 경로
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
  ],

  // 모듈 파일 확장자
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

export default createJestConfig(config);
