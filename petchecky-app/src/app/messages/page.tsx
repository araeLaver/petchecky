"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

// Mock user data for demo
const MOCK_USERS = [
  { id: "user1", name: "멍멍이집사", avatar: "🐕" },
  { id: "user2", name: "냥이맘", avatar: "🐈" },
  { id: "user3", name: "행복한펫", avatar: "🐾" },
  { id: "user4", name: "동물사랑", avatar: "❤️" },
];

export default function MessagesPage() {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = "me"; // Current user ID

  // Load conversations
  useEffect(() => {
    const saved = localStorage.getItem("petchecky_conversations");
    if (saved) {
      setConversations(JSON.parse(saved));
    } else {
      // Initialize with demo conversations
      const demoConversations: Conversation[] = MOCK_USERS.slice(0, 2).map((user) => ({
        id: `conv_${user.id}`,
        participantId: user.id,
        participantName: user.name,
        participantAvatar: user.avatar,
        lastMessage: "안녕하세요! 반가워요 😊",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 1,
      }));
      setConversations(demoConversations);
      localStorage.setItem("petchecky_conversations", JSON.stringify(demoConversations));
    }
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const saved = localStorage.getItem(`petchecky_messages_${selectedConversation.id}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Demo messages
        setMessages([
          {
            id: "msg1",
            senderId: selectedConversation.participantId,
            receiverId: currentUserId,
            content: "안녕하세요! 반가워요 😊",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: true,
          },
        ]);
      }

      // Mark messages as read
      const updatedConversations = conversations.map((c) =>
        c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c
      );
      setConversations(updatedConversations);
      localStorage.setItem("petchecky_conversations", JSON.stringify(updatedConversations));
    }
  }, [selectedConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: selectedConversation.participantId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(
      `petchecky_messages_${selectedConversation.id}`,
      JSON.stringify(updatedMessages)
    );

    // Update conversation
    const updatedConversations = conversations.map((c) =>
      c.id === selectedConversation.id
        ? { ...c, lastMessage: message.content, lastMessageTime: message.timestamp }
        : c
    );
    setConversations(updatedConversations);
    localStorage.setItem("petchecky_conversations", JSON.stringify(updatedConversations));

    setNewMessage("");
  };

  // Start new conversation
  const handleStartConversation = (user: typeof MOCK_USERS[0]) => {
    const existingConv = conversations.find((c) => c.participantId === user.id);
    if (existingConv) {
      setSelectedConversation(existingConv);
    } else {
      const newConv: Conversation = {
        id: `conv_${user.id}`,
        participantId: user.id,
        participantName: user.name,
        participantAvatar: user.avatar,
        unreadCount: 0,
      };
      const updated = [...conversations, newConv];
      setConversations(updated);
      localStorage.setItem("petchecky_conversations", JSON.stringify(updated));
      setSelectedConversation(newConv);
    }
    setShowNewChatModal(false);
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return "방금";
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {selectedConversation ? (
              <>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedConversation.participantAvatar}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">
                    {selectedConversation.participantName}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">💬 메시지</h1>
              </>
            )}
          </div>
          {!selectedConversation && (
            <button
              onClick={() => setShowNewChatModal(true)}
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              + 새 대화
            </button>
          )}
        </div>
      </header>

      {/* Conversations List */}
      {!selectedConversation && (
        <main className="flex-1 mx-auto max-w-3xl w-full p-4">
          {conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className="w-full flex items-center gap-3 rounded-xl bg-white border border-gray-200 p-4 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <div className="text-3xl">{conv.participantAvatar}</div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {conv.participantName}
                      </span>
                      {conv.lastMessageTime && (
                        <span className="text-xs text-gray-400">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-gray-200 p-8 text-center dark:bg-gray-800 dark:border-gray-700">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-500 mb-4 dark:text-gray-400">아직 대화가 없습니다</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="rounded-full bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                새 대화 시작하기
              </button>
            </div>
          )}
        </main>
      )}

      {/* Chat View */}
      {selectedConversation && (
        <div className="flex-1 flex flex-col mx-auto max-w-3xl w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isMine
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMine ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="rounded-full bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-gray-800">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">새 대화 시작</h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                대화를 시작할 사용자를 선택하세요
              </p>
              <div className="space-y-2">
                {MOCK_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartConversation(user)}
                    className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <span className="text-2xl">{user.avatar}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {user.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
