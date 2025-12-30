import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  age: number;
  weight: number;
  created_at: string;
  updated_at: string;
}

export interface ChatRecord {
  id: string;
  user_id: string;
  pet_id: string;
  pet_name: string;
  pet_species: 'dog' | 'cat';
  preview: string;
  severity: 'low' | 'medium' | 'high' | null;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    severity?: 'low' | 'medium' | 'high';
  }>;
  created_at: string;
}
