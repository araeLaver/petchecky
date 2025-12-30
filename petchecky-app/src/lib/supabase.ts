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

// ============ 펫 프로필 API ============

// 사용자의 펫 목록 조회
export async function getPets(userId: string): Promise<Pet[]> {
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pets:', error);
    return [];
  }
  return data || [];
}

// 펫 추가
export async function addPet(pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>): Promise<Pet | null> {
  const { data, error } = await supabase
    .from('pets')
    .insert(pet)
    .select()
    .single();

  if (error) {
    console.error('Error adding pet:', error);
    return null;
  }
  return data;
}

// 펫 수정
export async function updatePet(id: string, pet: Partial<Omit<Pet, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Pet | null> {
  const { data, error } = await supabase
    .from('pets')
    .update(pet)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pet:', error);
    return null;
  }
  return data;
}

// 펫 삭제
export async function deletePet(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting pet:', error);
    return false;
  }
  return true;
}

// ============ 상담 기록 API ============

// 사용자의 상담 기록 조회
export async function getChatRecords(userId: string): Promise<ChatRecord[]> {
  const { data, error } = await supabase
    .from('chat_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching chat records:', error);
    return [];
  }
  return data || [];
}

// 상담 기록 추가
export async function addChatRecord(record: Omit<ChatRecord, 'id' | 'created_at'>): Promise<ChatRecord | null> {
  const { data, error } = await supabase
    .from('chat_records')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Error adding chat record:', error);
    return null;
  }
  return data;
}

// 상담 기록 삭제
export async function deleteChatRecord(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting chat record:', error);
    return false;
  }
  return true;
}
