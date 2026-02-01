-- =====================================================
-- BabyChecky 테이블 마이그레이션
-- 육아 관련 데이터 테이블 및 RLS 정책
-- =====================================================

-- 1. 아이 프로필 테이블
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(50) NOT NULL,
  birth_date DATE NOT NULL,
  gender VARCHAR(6) NOT NULL CHECK (gender IN ('male', 'female')),
  birth_weight DECIMAL(4,2) CHECK (birth_weight > 0 AND birth_weight <= 10),
  birth_height DECIMAL(4,1) CHECK (birth_height > 0 AND birth_height <= 70),
  blood_type VARCHAR(7) CHECK (blood_type IN ('A', 'B', 'O', 'AB', 'unknown')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 성장 기록 테이블
CREATE TABLE growth_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  weight DECIMAL(4,2) CHECK (weight > 0 AND weight <= 50),
  height DECIMAL(4,1) CHECK (height > 0 AND height <= 200),
  head_circumference DECIMAL(4,1) CHECK (head_circumference > 0 AND head_circumference <= 60),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 예방접종 기록 테이블
CREATE TABLE child_vaccinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  vaccine_key VARCHAR(50) NOT NULL,
  vaccine_name VARCHAR(100) NOT NULL,
  dose_number INTEGER NOT NULL CHECK (dose_number > 0),
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  hospital VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 수유 기록 테이블
CREATE TABLE feeding_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('breast', 'formula', 'baby_food')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  side VARCHAR(5) CHECK (side IN ('left', 'right', 'both')),
  duration_minutes INTEGER CHECK (duration_minutes >= 0),
  amount_ml INTEGER CHECK (amount_ml >= 0),
  food_description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 수면 기록 테이블
CREATE TABLE sleep_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER CHECK (duration_minutes >= 0),
  quality VARCHAR(4) CHECK (quality IN ('good', 'fair', 'poor')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 기저귀 기록 테이블
CREATE TABLE diaper_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  type VARCHAR(5) NOT NULL CHECK (type IN ('wet', 'dirty', 'mixed', 'dry')),
  color VARCHAR(30),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 발달 마일스톤 기록 테이블
CREATE TABLE milestone_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(15) CHECK (category IN ('gross_motor', 'fine_motor', 'language', 'social', 'cognitive')),
  milestone_key VARCHAR(100) NOT NULL,
  achieved_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 아이 투약 기록 테이블
CREATE TABLE child_medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  dosage VARCHAR(50),
  frequency VARCHAR(50),
  start_date DATE NOT NULL,
  end_date DATE,
  prescribed_by VARCHAR(100),
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 아이 채팅 기록 테이블
CREATE TABLE child_chat_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  child_name VARCHAR(50) NOT NULL,
  preview TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 인덱스
-- =====================================================

CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_growth_records_child_id ON growth_records(child_id);
CREATE INDEX idx_growth_records_date ON growth_records(date DESC);
CREATE INDEX idx_child_vaccinations_child_id ON child_vaccinations(child_id);
CREATE INDEX idx_child_vaccinations_scheduled ON child_vaccinations(scheduled_date);
CREATE INDEX idx_feeding_records_child_id ON feeding_records(child_id);
CREATE INDEX idx_feeding_records_start ON feeding_records(start_time DESC);
CREATE INDEX idx_sleep_records_child_id ON sleep_records(child_id);
CREATE INDEX idx_sleep_records_start ON sleep_records(start_time DESC);
CREATE INDEX idx_diaper_records_child_id ON diaper_records(child_id);
CREATE INDEX idx_diaper_records_time ON diaper_records(time DESC);
CREATE INDEX idx_milestone_records_child_id ON milestone_records(child_id);
CREATE INDEX idx_child_medications_child_id ON child_medications(child_id);
CREATE INDEX idx_child_chat_records_child_id ON child_chat_records(child_id);

-- =====================================================
-- RLS 정책
-- =====================================================

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaper_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_chat_records ENABLE ROW LEVEL SECURITY;

-- 각 테이블에 대해 본인 데이터만 접근 가능 정책 생성
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'children', 'growth_records', 'child_vaccinations', 'feeding_records',
    'sleep_records', 'diaper_records', 'milestone_records', 'child_medications',
    'child_chat_records'
  ]
  LOOP
    EXECUTE format('CREATE POLICY "Users can view own %1$s" ON %1$s FOR SELECT USING (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "Users can insert own %1$s" ON %1$s FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "Users can update own %1$s" ON %1$s FOR UPDATE USING (auth.uid() = user_id)', tbl);
    EXECUTE format('CREATE POLICY "Users can delete own %1$s" ON %1$s FOR DELETE USING (auth.uid() = user_id)', tbl);
  END LOOP;
END;
$$;

-- =====================================================
-- 트리거
-- =====================================================

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 커뮤니티 게시글 카테고리에 'baby' 추가
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_category_check;
ALTER TABLE community_posts ADD CONSTRAINT community_posts_category_check
  CHECK (category IN ('question', 'tip', 'daily', 'review', 'baby'));
