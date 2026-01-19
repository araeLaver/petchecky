"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import LandingPage from "@/components/LandingPage";
import { useAuth } from "@/contexts/AuthContext";
import { usePets } from "@/hooks/usePets";
import { useChat } from "@/hooks/useChat";
import { useModals } from "@/hooks/useModals";
import type { PetProfile, ChatRecord, Message } from "@/types/chat";

// 모달 컴포넌트 Dynamic Import (초기 번들 크기 최적화)
const PetProfileModal = dynamic(() => import("@/components/PetProfileModal"), {
  loading: () => null,
});
const AuthModal = dynamic(() => import("@/components/AuthModal"), {
  loading: () => null,
});
const HealthReport = dynamic(() => import("@/components/HealthReport"), {
  loading: () => null,
  ssr: false,
});
const NotificationSettings = dynamic(() => import("@/components/NotificationSettings"), {
  loading: () => null,
});
const ChatHistory = dynamic(() => import("@/components/ChatHistory"), {
  loading: () => <div className="p-4 text-center text-gray-500">로딩 중...</div>,
});

// Re-export types for compatibility
export type { PetProfile, ChatRecord, Message } from "@/types/chat";

type ViewType = "landing" | "chat" | "history";

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  // Custom Hooks
  const {
    pets,
    selectedPet,
    isLoaded: petsLoaded,
    selectPet,
    savePet,
    deletePet,
  } = usePets({ userId: user?.id, authLoading });

  const {
    chatHistory,
    selectedRecord,
    usageCount,
    isLoaded: chatLoaded,
    saveChat,
    deleteRecord,
    selectRecord,
    refreshUsage,
  } = useChat({ userId: user?.id, authLoading });

  const {
    modals,
    editingPet,
    openProfileModal,
    closeProfileModal,
    openAuthModal,
    closeAuthModal,
    openHealthReport,
    closeHealthReport,
    openNotification,
    closeNotification,
  } = useModals();

  // View state
  const [currentView, setCurrentView] = useState<ViewType>("landing");

  // Handlers
  const handleSaveChat = useCallback(
    async (messages: Message[], severity?: "low" | "medium" | "high") => {
      await saveChat(messages, selectedPet, severity);
    },
    [saveChat, selectedPet]
  );

  const handleSelectRecord = useCallback(
    (record: ChatRecord) => {
      selectRecord(record);
      setCurrentView("chat");
    },
    [selectRecord]
  );

  const handleSavePet = useCallback(
    async (profile: PetProfile) => {
      await savePet(profile, editingPet?.id);
      closeProfileModal();
    },
    [savePet, editingPet, closeProfileModal]
  );

  const handleDeletePet = useCallback(async () => {
    if (editingPet?.id) {
      await deletePet(editingPet.id);
      closeProfileModal();
    }
  }, [deletePet, editingPet, closeProfileModal]);

  // Loading state
  const isLoaded = petsLoaded && chatLoaded;

  if (!isLoaded || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="mb-4 text-5xl animate-pulse">🐾</div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <Header
        pets={pets}
        selectedPet={selectedPet}
        onSelectPet={selectPet}
        onEditPet={(pet) => openProfileModal(pet)}
        onAddPet={() => openProfileModal(null)}
        onLogoClick={() => {
          setCurrentView("landing");
          selectRecord(null);
        }}
        onLoginClick={openAuthModal}
        onNotificationClick={openNotification}
        usageCount={usageCount}
      />

      <main className="flex flex-1 flex-col">
        {currentView === "landing" && (
          <LandingPage
            petProfile={selectedPet}
            onStartChat={() => {
              selectRecord(null);
              setCurrentView("chat");
            }}
            onRegisterPet={() => openProfileModal(null)}
            onViewHistory={() => setCurrentView("history")}
            onViewReport={openHealthReport}
            historyCount={chatHistory.length}
          />
        )}

        {currentView === "chat" && selectedPet && (
          <ChatInterface
            petProfile={selectedPet}
            onBack={() => {
              setCurrentView("landing");
              selectRecord(null);
            }}
            onSaveChat={handleSaveChat}
            initialMessages={selectedRecord?.messages.map((m, i) => ({
              id: i.toString(),
              ...m,
            }))}
            userId={user?.id}
            onUsageUpdate={refreshUsage}
          />
        )}

        {currentView === "history" && (
          <ChatHistory
            records={chatHistory}
            onSelect={handleSelectRecord}
            onDelete={deleteRecord}
            onBack={() => setCurrentView("landing")}
          />
        )}
      </main>

      {/* Modals */}
      {modals.profile && (
        <PetProfileModal
          initialProfile={editingPet}
          onSave={handleSavePet}
          onClose={closeProfileModal}
          onDelete={editingPet?.id ? handleDeletePet : undefined}
        />
      )}

      {modals.auth && (
        <AuthModal
          onClose={closeAuthModal}
          onSuccess={closeAuthModal}
        />
      )}

      {modals.healthReport && selectedPet && (
        <HealthReport
          pet={selectedPet}
          records={chatHistory}
          onClose={closeHealthReport}
        />
      )}

      {modals.notification && (
        <NotificationSettings
          onClose={closeNotification}
        />
      )}
    </div>
  );
}
