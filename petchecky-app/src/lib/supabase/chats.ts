import { supabase } from './client';

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
