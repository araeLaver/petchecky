// 채팅 관련 공통 타입 정의

import { PetSpecies, Severity } from "@/lib/constants";

// 기본 메시지 타입 (API 통신용)
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  severity?: Severity;
}

// UI 메시지 타입 (화면 렌더링용)
export interface Message extends ChatMessage {
  id: string;
  image?: string; // Base64 이미지 URL (미리보기용)
}

// 채팅 기록 타입
export interface ChatRecord {
  id: string;
  petName: string;
  petSpecies: PetSpecies;
  date: string;
  preview: string;
  severity?: Severity;
  messages: ChatMessage[];
}

// 펫 프로필 타입
export interface PetProfile {
  id?: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
  weight: number;
}

// API 요청 타입
export interface ChatApiRequest {
  message: string;
  petProfile: PetProfile;
  history: ChatMessage[];
  image?: {
    data: string; // Base64 encoded image
    mimeType: string; // image/jpeg, image/png, etc.
  };
}

// API 응답 타입
export interface ChatApiResponse {
  message: string;
  severity?: Severity;
  limitExceeded?: boolean;
  requirePremiumPlus?: boolean;
  usage?: number;
  limit?: number;
  showUpgrade?: boolean;
}
