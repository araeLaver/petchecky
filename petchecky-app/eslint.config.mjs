import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Coverage reports
    "coverage/**",
  ]),
  // Custom rules
  {
    rules: {
      // React 19 새 규칙들을 경고로 완화 (기존 코드 패턴과 호환)
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      // 미사용 변수는 경고로
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      // import/no-anonymous-default-export 경고로
      "import/no-anonymous-default-export": "warn",
    },
  },
]);

export default eslintConfig;
