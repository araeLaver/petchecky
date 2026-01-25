/**
 * Security Utilities
 *
 * CSRF 토큰, 암호화, 보안 관련 유틸리티 함수
 */

import { randomBytes, createHash, createCipheriv, createDecipheriv } from "crypto";

// ============================================
// CSRF 토큰 관리
// ============================================

const CSRF_SECRET = process.env.CSRF_SECRET || "petchecky-csrf-secret-key-change-in-production";
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1시간

interface CsrfTokenData {
  token: string;
  expires: number;
}

/**
 * CSRF 토큰 생성
 */
export function generateCsrfToken(): CsrfTokenData {
  const token = randomBytes(32).toString("hex");
  const expires = Date.now() + CSRF_TOKEN_EXPIRY;

  // 토큰과 만료 시간을 해시로 서명
  const signature = createHash("sha256")
    .update(`${token}:${expires}:${CSRF_SECRET}`)
    .digest("hex");

  return {
    token: `${token}:${expires}:${signature}`,
    expires,
  };
}

/**
 * CSRF 토큰 검증
 */
export function verifyCsrfToken(tokenString: string): boolean {
  try {
    const parts = tokenString.split(":");
    if (parts.length !== 3) return false;

    const [token, expiresStr, signature] = parts;
    const expires = parseInt(expiresStr, 10);

    // 만료 확인
    if (Date.now() > expires) return false;

    // 서명 확인
    const expectedSignature = createHash("sha256")
      .update(`${token}:${expires}:${CSRF_SECRET}`)
      .digest("hex");

    return signature === expectedSignature;
  } catch {
    return false;
  }
}

// ============================================
// 민감한 데이터 암호화
// ============================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "petchecky-encryption-key-32bytes!"; // 32 bytes
const ENCRYPTION_ALGORITHM = "aes-256-gcm";

/**
 * 데이터 암호화
 */
export function encryptData(data: string): string {
  try {
    const iv = randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // IV + AuthTag + 암호화된 데이터
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("데이터 암호화 실패");
  }
}

/**
 * 데이터 복호화
 */
export function decryptData(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) throw new Error("Invalid encrypted data format");

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32));

    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("데이터 복호화 실패");
  }
}

// ============================================
// 해싱 유틸리티
// ============================================

/**
 * SHA-256 해시 생성
 */
export function hashSha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * 안전한 비교 (타이밍 공격 방지)
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// ============================================
// 입력 정제
// ============================================

/**
 * 이메일 마스킹
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***";

  const maskedLocal = local.length > 2
    ? `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}`
    : "**";

  return `${maskedLocal}@${domain}`;
}

/**
 * 전화번호 마스킹
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "***-****-****";

  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

/**
 * 민감한 데이터 필드 마스킹
 */
export function maskSensitiveData<T extends Record<string, unknown>>(
  data: T,
  sensitiveFields: (keyof T)[]
): T {
  const masked = { ...data };

  for (const field of sensitiveFields) {
    if (masked[field] && typeof masked[field] === "string") {
      const value = masked[field] as string;

      if (field.toString().toLowerCase().includes("email")) {
        masked[field] = maskEmail(value) as T[keyof T];
      } else if (field.toString().toLowerCase().includes("phone")) {
        masked[field] = maskPhone(value) as T[keyof T];
      } else {
        // 일반 마스킹
        masked[field] = (value.length > 4
          ? `${value.slice(0, 2)}${"*".repeat(value.length - 4)}${value.slice(-2)}`
          : "****") as T[keyof T];
      }
    }
  }

  return masked;
}

// ============================================
// API 보안
// ============================================

/**
 * API 키 검증
 */
export function validateApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false;

  const expectedKey = process.env.API_SECRET_KEY;
  if (!expectedKey) return true; // API 키가 설정되지 않은 경우 통과

  return secureCompare(apiKey, expectedKey);
}

/**
 * IP 주소 추출
 */
export function extractClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * 요청 핑거프린트 생성 (Rate limiting용)
 */
export function generateRequestFingerprint(headers: Headers, path: string): string {
  const ip = extractClientIp(headers);
  const userAgent = headers.get("user-agent") || "";

  return hashSha256(`${ip}:${userAgent}:${path}`);
}
