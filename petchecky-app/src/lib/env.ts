/**
 * 환경변수 검증 유틸리티
 * 프로덕션 런타임에서는 필수 환경변수 누락 시 에러 발생
 * 개발 환경에서는 경고만 표시
 * 빌드 시에는 검증하지 않음
 */

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
// 빌드 시에는 NEXT_PHASE 환경변수가 설정됨
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

interface EnvConfig {
  name: string;
  required: boolean;
  public?: boolean;
}

const ENV_CONFIGS: EnvConfig[] = [
  // 필수 환경변수
  { name: "GEMINI_API_KEY", required: true },
  { name: "NEXT_PUBLIC_SUPABASE_URL", required: true, public: true },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, public: true },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true },
  { name: "NEXT_PUBLIC_TOSS_CLIENT_KEY", required: true, public: true },
  { name: "TOSS_SECRET_KEY", required: true },

  // 선택 환경변수
  { name: "NEXT_PUBLIC_KAKAO_MAP_KEY", required: false, public: true },
  { name: "NEXT_PUBLIC_SENTRY_DSN", required: false, public: true },
  { name: "NEXT_PUBLIC_VAPID_PUBLIC_KEY", required: false, public: true },
  { name: "VAPID_PRIVATE_KEY", required: false },
];

interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * 환경변수 검증 실행
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const config of ENV_CONFIGS) {
    const value = process.env[config.name];

    if (!value || value === `your_${config.name.toLowerCase()}`) {
      if (config.required) {
        missing.push(config.name);
      } else {
        warnings.push(config.name);
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * 환경변수 검증 및 로깅
 * 서버 사이드에서만 실행
 */
export function checkEnvVariables(): void {
  // 클라이언트에서는 실행하지 않음
  if (typeof window !== "undefined") {
    return;
  }

  // 빌드 시에는 검증하지 않음 (Vercel에서 환경변수는 런타임에 주입됨)
  if (isBuildPhase) {
    return;
  }

  const result = validateEnv();

  // 필수 환경변수 누락
  if (!result.isValid) {
    const message = `[PetChecky] 필수 환경변수 누락: ${result.missing.join(", ")}`;

    if (isProduction) {
      throw new Error(message);
    } else if (isDevelopment) {
      console.warn(`⚠️ ${message}`);
      console.warn("  → .env.local 파일에 환경변수를 설정해주세요.");
      console.warn("  → .env.example 파일을 참고하세요.");
    }
  }

  // 선택 환경변수 누락 (개발 환경에서만 경고)
  if (isDevelopment && result.warnings.length > 0) {
    console.info(`ℹ️ [PetChecky] 선택 환경변수 미설정: ${result.warnings.join(", ")}`);
    console.info("  → 해당 기능이 제한될 수 있습니다.");
  }
}

/**
 * 환경변수 안전하게 가져오기
 */
export function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`환경변수 ${name}이(가) 설정되지 않았습니다.`);
  }
  return value;
}

/**
 * 공개 환경변수 가져오기 (NEXT_PUBLIC_ 접두사)
 */
export function getPublicEnv(name: string, defaultValue?: string): string {
  const fullName = name.startsWith("NEXT_PUBLIC_") ? name : `NEXT_PUBLIC_${name}`;
  return getEnv(fullName, defaultValue);
}
