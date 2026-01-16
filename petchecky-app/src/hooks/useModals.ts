"use client";

import { useState, useCallback } from "react";
import { PetProfile } from "./usePets";

type ModalType = "profile" | "auth" | "healthReport" | "notification";

interface ModalState {
  profile: boolean;
  auth: boolean;
  healthReport: boolean;
  notification: boolean;
}

interface UseModalsReturn {
  modals: ModalState;
  editingPet: PetProfile | null;
  openProfileModal: (pet?: PetProfile | null) => void;
  closeProfileModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openHealthReport: () => void;
  closeHealthReport: () => void;
  openNotification: () => void;
  closeNotification: () => void;
  closeAll: () => void;
}

export function useModals(): UseModalsReturn {
  const [modals, setModals] = useState<ModalState>({
    profile: false,
    auth: false,
    healthReport: false,
    notification: false,
  });
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);

  const openModal = useCallback((modal: ModalType) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  }, []);

  const closeModal = useCallback((modal: ModalType) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  }, []);

  const openProfileModal = useCallback((pet?: PetProfile | null) => {
    setEditingPet(pet || null);
    openModal("profile");
  }, [openModal]);

  const closeProfileModal = useCallback(() => {
    closeModal("profile");
    setEditingPet(null);
  }, [closeModal]);

  const openAuthModal = useCallback(() => {
    openModal("auth");
  }, [openModal]);

  const closeAuthModal = useCallback(() => {
    closeModal("auth");
  }, [closeModal]);

  const openHealthReport = useCallback(() => {
    openModal("healthReport");
  }, [openModal]);

  const closeHealthReport = useCallback(() => {
    closeModal("healthReport");
  }, [closeModal]);

  const openNotification = useCallback(() => {
    openModal("notification");
  }, [openModal]);

  const closeNotification = useCallback(() => {
    closeModal("notification");
  }, [closeModal]);

  const closeAll = useCallback(() => {
    setModals({
      profile: false,
      auth: false,
      healthReport: false,
      notification: false,
    });
    setEditingPet(null);
  }, []);

  return {
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
    closeAll,
  };
}
