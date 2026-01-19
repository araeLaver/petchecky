// 서비스 레이어 인덱스

export { apiClient } from "./apiClient";
export type { ApiResponse, ApiError, RequestOptions } from "./apiClient";

export { chatService } from "./chatService";
export type {
  SendMessageRequest,
  SendMessageResponse,
  ChatServiceResult,
} from "./chatService";

export { communityService } from "./communityService";
export type {
  Post,
  Comment,
  PostsResponse,
  PostDetailResponse,
  CommentsResponse,
  CreatePostRequest,
  CreateCommentRequest,
  LikeResponse,
  ServiceResult,
} from "./communityService";
