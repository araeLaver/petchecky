"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type AppMode = "pet" | "baby";

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
  isPetMode: boolean;
  isBabyMode: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

const STORAGE_KEY = "petchecky-app-mode";

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("pet");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "pet" || saved === "baby") {
      setModeState(saved);
    }
  }, []);

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "pet" ? "baby" : "pet");
  }, [mode, setMode]);

  return (
    <AppModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isPetMode: mode === "pet",
        isBabyMode: mode === "baby",
      }}
    >
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error("useAppMode must be used within an AppModeProvider");
  }
  return context;
}
