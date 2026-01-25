-- =====================================================
-- PetChecky Database Optimization Functions
-- 이 마이그레이션은 N+1 쿼리 문제를 해결하는 RPC 함수를 생성합니다.
--
-- 적용 방법:
-- 1. Supabase 대시보드 > SQL Editor에서 실행
-- 2. 또는 supabase db push 명령 사용
-- =====================================================

-- 1. 게시글 조회수 원자적 증가
-- 기존: SELECT + UPDATE (2쿼리) → 1쿼리로 최적화
CREATE OR REPLACE FUNCTION increment_post_views(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_posts
  SET views_count = views_count + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 좋아요 토글 (원자적 처리)
-- 기존: CHECK + INSERT/DELETE + SELECT (3-4쿼리) → 1쿼리로 최적화
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_liked BOOLEAN;
  v_likes_count INTEGER;
BEGIN
  -- 기존 좋아요 확인 및 토글
  IF EXISTS (
    SELECT 1 FROM community_likes
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) THEN
    -- 좋아요 취소
    DELETE FROM community_likes
    WHERE post_id = p_post_id AND user_id = p_user_id;
    v_liked := FALSE;
  ELSE
    -- 좋아요 추가
    INSERT INTO community_likes (post_id, user_id)
    VALUES (p_post_id, p_user_id);
    v_liked := TRUE;
  END IF;

  -- 업데이트된 좋아요 수 조회
  SELECT likes_count INTO v_likes_count
  FROM community_posts
  WHERE id = p_post_id;

  RETURN json_build_object(
    'liked', v_liked,
    'likes_count', COALESCE(v_likes_count, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 사용량 증가 (UPSERT)
-- 기존: SELECT + UPDATE/INSERT (2쿼리) → 1쿼리로 최적화
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_year_month TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_records (user_id, year_month, usage_count, created_at, updated_at)
  VALUES (p_user_id, p_year_month, 1, NOW(), NOW())
  ON CONFLICT (user_id, year_month)
  DO UPDATE SET
    usage_count = usage_records.usage_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 인덱스 추가 (성능 최적화)
-- community_posts 인덱스
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- community_comments 인덱스
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments(created_at);

-- community_likes 인덱스 (복합 유니크 인덱스)
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_likes_post_user
ON community_likes(post_id, user_id);

-- usage_records 인덱스 (복합 유니크 인덱스)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_records_user_month
ON usage_records(user_id, year_month);

-- pets 인덱스
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);

-- chat_records 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_records_user_id ON chat_records(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_records_created_at ON chat_records(created_at DESC);

-- reservations 인덱스
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at DESC);

-- =====================================================
-- 적용 후 확인 쿼리:
-- SELECT proname FROM pg_proc WHERE proname IN ('increment_post_views', 'toggle_post_like', 'increment_usage');
-- =====================================================
