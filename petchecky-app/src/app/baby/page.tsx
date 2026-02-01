"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useChildStore } from "@/stores/childStore";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import ChildProfileModal from "@/components/baby/ChildProfileModal";
import BabyDashboard from "@/components/baby/BabyDashboard";
import type { ChildProfile } from "@/types/baby";

// Simple chat interface for baby mode
function BabyChatInterface({ child }: { child: ChildProfile }) {
  const { getAccessToken } = useAuth();
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `안녕하세요! ${child.name} 부모님, 베이비체키입니다. 👶\n\n육아 관련 궁금한 점이나 아이 건강에 대해 물어보세요!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: "user" as const, content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const token = await getAccessToken();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const birth = new Date(child.birthDate);
      const now = new Date();
      const ageMonths = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userMsg.content,
          mode: "baby",
          childProfile: {
            name: child.name,
            ageMonths,
            gender: child.gender,
            birthWeight: child.birthWeight,
          },
          history: messages.slice(-6),
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "네트워크 오류가 발생했습니다. 다시 시도해주세요." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-pink-500 text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-500 dark:bg-gray-700">
              답변 작성 중...
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-pink-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="육아 관련 질문을 입력하세요..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50"
          >
            전송
          </button>
        </form>
        <p className="mt-2 text-center text-xs text-gray-400">
          ※ AI 상담은 참고용이며, 정확한 진단은 소아과 전문의와 상담하세요.
        </p>
      </div>
    </div>
  );
}

export default function BabyPage() {
  const { t } = useLanguage();
  const { children, selectedChildId, selectChild, addChild, updateChild } = useChildStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [view, setView] = useState<"dashboard" | "chat">("dashboard");

  const selectedChild = children.find((c) => c.id === selectedChildId) || null;

  // Auto-select first child
  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      selectChild(children[0].id);
    }
  }, [children, selectedChildId, selectChild]);

  const handleSaveChild = useCallback(
    (child: ChildProfile) => {
      if (editingChild) {
        updateChild(child.id, child);
      } else {
        addChild(child);
        selectChild(child.id);
      }
      setEditingChild(null);
    },
    [editingChild, addChild, updateChild, selectChild]
  );

  // No children registered
  if (children.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">👶</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.baby?.welcome || "베이비체키에 오신 걸 환영합니다!"}
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {t.baby?.registerFirst || "아이를 등록하고 AI 육아 상담을 시작하세요."}
          </p>
          <button
            onClick={() => setShowProfileModal(true)}
            className="rounded-xl bg-pink-500 px-6 py-3 text-lg font-medium text-white hover:bg-pink-600 transition-colors"
          >
            👶 {t.baby?.addChild || "아이 등록하기"}
          </button>
        </div>
        <Link href="/" className="mt-8 text-sm text-gray-500 hover:text-gray-700">
          ← {t.baby?.backToPet || "펫체키로 돌아가기"}
        </Link>

        <ChildProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveChild}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-xl">👶</span>
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {t.baby?.appName || "베이비체키"}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Child selector */}
            {children.length > 1 && (
              <select
                value={selectedChildId || ""}
                onChange={(e) => selectChild(e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => {
                setEditingChild(null);
                setShowProfileModal(true);
              }}
              className="rounded-lg bg-pink-100 px-2 py-1 text-sm text-pink-600 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400"
            >
              + 추가
            </button>
          </div>
        </div>
      </header>

      {/* View toggle */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-3">
        <div className="flex gap-1 rounded-lg bg-gray-200 p-1 dark:bg-gray-700">
          <button
            onClick={() => setView("dashboard")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              view === "dashboard" ? "bg-white text-gray-900 shadow dark:bg-gray-800 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
            }`}
          >
            대시보드
          </button>
          <button
            onClick={() => setView("chat")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              view === "chat" ? "bg-white text-gray-900 shadow dark:bg-gray-800 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
            }`}
          >
            AI 상담
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-3xl flex-1 p-4">
        {selectedChild && view === "dashboard" && <BabyDashboard child={selectedChild} />}
        {selectedChild && view === "chat" && <BabyChatInterface child={selectedChild} />}
      </div>

      <ChildProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setEditingChild(null);
        }}
        onSave={handleSaveChild}
        child={editingChild}
      />
    </div>
  );
}
