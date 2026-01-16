import { supabase } from './client';

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
