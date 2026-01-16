// Supabase 모듈 통합 export
// 기존 @/lib/supabase import와 호환성 유지

export { supabase } from './client';

// Pets
export { getPets, addPet, updatePet, deletePet } from './pets';
export type { Pet } from './pets';

// Chats
export { getChatRecords, addChatRecord, deleteChatRecord } from './chats';
export type { ChatRecord } from './chats';

// Usage
export {
  getUsage,
  incrementUsage,
  getRemainingUsage,
  canUseService,
  MONTHLY_FREE_LIMIT,
} from './usage';
export type { UsageRecord } from './usage';

// Community
export {
  getCommunityPosts,
  getCommunityPost,
  incrementPostViews,
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  checkLikeStatus,
  toggleLike,
} from './community';
export type { CommunityPost, CommunityComment, CommunityLike } from './community';
