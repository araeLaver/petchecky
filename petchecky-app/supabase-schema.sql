-- 펫체키 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 1. 펫 프로필 테이블
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(50) NOT NULL,
  species VARCHAR(10) NOT NULL CHECK (species IN ('dog', 'cat')),
  breed VARCHAR(50) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 30),
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0 AND weight <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 상담 기록 테이블
CREATE TABLE chat_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  pet_name VARCHAR(50) NOT NULL,
  pet_species VARCHAR(10) NOT NULL,
  preview TEXT NOT NULL,
  severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high')),
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 인덱스 생성
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_chat_records_user_id ON chat_records(user_id);
CREATE INDEX idx_chat_records_created_at ON chat_records(created_at DESC);

-- 4. RLS (Row Level Security) 정책 설정
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_records ENABLE ROW LEVEL SECURITY;

-- 펫 테이블: 본인 데이터만 접근 가능
CREATE POLICY "Users can view own pets" ON pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON pets
  FOR DELETE USING (auth.uid() = user_id);

-- 상담 기록 테이블: 본인 데이터만 접근 가능
CREATE POLICY "Users can view own chat records" ON chat_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat records" ON chat_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat records" ON chat_records
  FOR DELETE USING (auth.uid() = user_id);

-- 5. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 트리거 생성
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
