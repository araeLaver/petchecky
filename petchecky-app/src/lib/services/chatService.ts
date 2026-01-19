// 채팅 API 서비스

import { apiClient, ApiResponse, ApiError } from "./apiClient";
import type { PetProfile, ChatMessage, ChatApiResponse } from "@/types/chat";
import type { Severity } from "@/lib/constants";

// 채팅 요청 타입
export interface SendMessageRequest {
  message: string;
  petProfile: PetProfile;
  history?: ChatMessage[];
  image?: {
    data: string;
    mimeType: string;
  };
}

// 채팅 응답 타입
export interface SendMessageResponse {
  message: string;
  severity?: Severity;
  limitExceeded?: boolean;
  requirePremiumPlus?: boolean;
  usage?: number;
  limit?: number;
  showUpgrade?: boolean;
}

// 채팅 서비스 결과 타입
export interface ChatServiceResult {
  success: boolean;
  data?: SendMessageResponse;
  error?: ApiError;
}

/**
 * 채팅 서비스
 */
export const chatService = {
  /**
   * 메시지 전송
   */
  async sendMessage(
    request: SendMessageRequest,
    token?: string | null
  ): Promise<ChatServiceResult> {
    const response = await apiClient.post<ChatApiResponse>(
      "/api/chat",
      {
        message: request.message,
        petProfile: request.petProfile,
        history: request.history || [],
        image: request.image,
      },
      { token }
    );

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      data: response.data,
    };
  },

  /**
   * 사용량 조회
   */
  async getUsage(token: string): Promise<ApiResponse<{ usage: number; limit: number }>> {
    return apiClient.get("/api/user/usage", { token });
  },
};

export default chatService;
