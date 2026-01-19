"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getChatRecords,
  addChatRecord,
  deleteChatRecord,
  getUsage,
  ChatRecord as DBChatRecord,
} from "@/lib/supabase";
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
} from "./useLocalStorage";
import { LIMITS } from "@/lib/constants";
import type { PetProfile, ChatRecord, ChatMessage, Message } from "@/types/chat";

// 타입 re-export (하위 호환성)
export type { ChatRecord, ChatMessage } from "@/types/chat";

// LocalStorage 헬퍼 함수 (공통 모듈 사용)
function getLocalHistory(): ChatRecord[] {
  return getStorageItem<ChatRecord[]>(STORAGE_KEYS.CHAT_HISTORY, []);
}

function saveLocalHistory(history: ChatRecord[]): void {
  setStorageItem(STORAGE_KEYS.CHAT_HISTORY, history);
}

// DB -> UI 변환 함수
function dbRecordToLocal(record: DBChatRecord): ChatRecord {
  return {
    id: record.id,
    petName: record.pet_name,
    petSpecies: record.pet_species,
    date: record.created_at,
    preview: record.preview,
    severity: record.severity || undefined,
    messages: record.messages,
  };
}

interface UseChatOptions {
  userId?: string;
  authLoading?: boolean;
}

interface UseChatReturn {
  chatHistory: ChatRecord[];
  selectedRecord: ChatRecord | null;
  usageCount: number;
  isLoaded: boolean;
  saveChat: (
    messages: Message[],
    selectedPet: PetProfile | null,
    severity?: "low" | "medium" | "high"
  ) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  selectRecord: (record: ChatRecord | null) => void;
  refreshUsage: () => Promise<void>;
}

export function useChat({ userId, authLoading = false }: UseChatOptions): UseChatReturn {
  const [chatHistory, setChatHistory] = useState<ChatRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ChatRecord | null>(null);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // 데이터 로드
  useEffect(() => {
    async function loadChat() {
      if (authLoading) return;

      if (userId) {
        const records = await getChatRecords(userId);
        setChatHistory(records.map(dbRecordToLocal));

        const usage = await getUsage(userId);
        setUsageCount(usage);
      } else {
        setChatHistory(getLocalHistory());
      }

      setIsLoaded(true);
    }

    loadChat();
  }, [userId, authLoading]);

  // 채팅 저장
  const saveChat = useCallback(async (
    messages: Message[],
    selectedPet: PetProfile | null,
    severity?: "low" | "medium" | "high"
  ) => {
    if (!selectedPet || messages.length <= 1) return;

    const userMessages = messages.filter(m => m.role === "user");
    const preview = userMessages[0]?.content || "상담 내용 없음";

    if (userId && selectedPet.id) {
      const newRecord = await addChatRecord({
        user_id: userId,
        pet_id: selectedPet.id,
        pet_name: selectedPet.name,
        pet_species: selectedPet.species,
        preview,
        severity: severity || null,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          severity: m.severity,
        })),
      });

      if (newRecord) {
        setChatHistory(prev => [dbRecordToLocal(newRecord), ...prev].slice(0, LIMITS.MAX_CHAT_RECORDS));
      }
    } else {
      const newRecord: ChatRecord = {
        id: Date.now().toString(),
        petName: selectedPet.name,
        petSpecies: selectedPet.species,
        date: new Date().toISOString(),
        preview,
        severity,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          severity: m.severity,
        })),
      };

      setChatHistory(prev => {
        const updatedHistory = [newRecord, ...prev].slice(0, LIMITS.MAX_CHAT_RECORDS);
        saveLocalHistory(updatedHistory);
        return updatedHistory;
      });
    }
  }, [userId]);

  // 채팅 기록 삭제
  const deleteRecord = useCallback(async (id: string) => {
    if (userId) {
      const success = await deleteChatRecord(id);
      if (success) {
        setChatHistory(prev => prev.filter(r => r.id !== id));
      }
    } else {
      setChatHistory(prev => {
        const updatedHistory = prev.filter(r => r.id !== id);
        saveLocalHistory(updatedHistory);
        return updatedHistory;
      });
    }
  }, [userId]);

  // 채팅 기록 선택
  const selectRecord = useCallback((record: ChatRecord | null) => {
    setSelectedRecord(record);
  }, []);

  // 사용량 업데이트
  const refreshUsage = useCallback(async () => {
    if (userId) {
      const usage = await getUsage(userId);
      setUsageCount(usage);
    }
  }, [userId]);

  return {
    chatHistory,
    selectedRecord,
    usageCount,
    isLoaded,
    saveChat,
    deleteRecord,
    selectRecord,
    refreshUsage,
  };
}
