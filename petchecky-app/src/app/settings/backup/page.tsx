"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface BackupData {
  version: string;
  exportDate: string;
  pets: unknown[];
  reminders: unknown[];
  chatHistory: unknown[];
  vaccination: unknown[];
  healthRecords: unknown[];
  walkRecords: unknown[];
  dietLogs: unknown[];
  gallery: unknown[];
}

const STORAGE_KEYS = [
  "petchecky_pets",
  "petchecky_reminders",
  "petchecky_chat_history",
  "petchecky_vaccination",
  "petchecky_health_records",
  "petchecky_walk_records",
  "petchecky_diet_logs",
  "petchecky_gallery",
  "petchecky_usage",
  "petchecky_settings",
];

export default function BackupPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      const backupData: BackupData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        pets: JSON.parse(localStorage.getItem("petchecky_pets") || "[]"),
        reminders: JSON.parse(localStorage.getItem("petchecky_reminders") || "[]"),
        chatHistory: JSON.parse(localStorage.getItem("petchecky_chat_history") || "[]"),
        vaccination: JSON.parse(localStorage.getItem("petchecky_vaccination") || "[]"),
        healthRecords: JSON.parse(localStorage.getItem("petchecky_health_records") || "[]"),
        walkRecords: JSON.parse(localStorage.getItem("petchecky_walk_records") || "[]"),
        dietLogs: JSON.parse(localStorage.getItem("petchecky_diet_logs") || "[]"),
        gallery: JSON.parse(localStorage.getItem("petchecky_gallery") || "[]"),
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `petchecky-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: "success", text: t.backup.exportSuccess });
    } catch {
      setMessage({ type: "error", text: t.backup.exportError });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const data: BackupData = JSON.parse(text);

      // Validate backup data
      if (!data.version || !data.exportDate) {
        throw new Error("Invalid backup file");
      }

      // Restore data
      if (data.pets && Array.isArray(data.pets)) {
        localStorage.setItem("petchecky_pets", JSON.stringify(data.pets));
      }
      if (data.reminders && Array.isArray(data.reminders)) {
        localStorage.setItem("petchecky_reminders", JSON.stringify(data.reminders));
      }
      if (data.chatHistory && Array.isArray(data.chatHistory)) {
        localStorage.setItem("petchecky_chat_history", JSON.stringify(data.chatHistory));
      }
      if (data.vaccination && Array.isArray(data.vaccination)) {
        localStorage.setItem("petchecky_vaccination", JSON.stringify(data.vaccination));
      }
      if (data.healthRecords && Array.isArray(data.healthRecords)) {
        localStorage.setItem("petchecky_health_records", JSON.stringify(data.healthRecords));
      }
      if (data.walkRecords && Array.isArray(data.walkRecords)) {
        localStorage.setItem("petchecky_walk_records", JSON.stringify(data.walkRecords));
      }
      if (data.dietLogs && Array.isArray(data.dietLogs)) {
        localStorage.setItem("petchecky_diet_logs", JSON.stringify(data.dietLogs));
      }
      if (data.gallery && Array.isArray(data.gallery)) {
        localStorage.setItem("petchecky_gallery", JSON.stringify(data.gallery));
      }

      setMessage({ type: "success", text: t.backup.importSuccess });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setMessage({ type: "error", text: t.backup.importError });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = () => {
    if (!confirm(t.backup.clearConfirm)) return;

    STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    setMessage({ type: "success", text: t.backup.clearSuccess });
  };

  const getDataStats = () => {
    const stats = {
      pets: 0,
      reminders: 0,
      chatHistory: 0,
      vaccination: 0,
      healthRecords: 0,
      walkRecords: 0,
      dietLogs: 0,
      gallery: 0,
    };

    try {
      stats.pets = JSON.parse(localStorage.getItem("petchecky_pets") || "[]").length;
      stats.reminders = JSON.parse(localStorage.getItem("petchecky_reminders") || "[]").length;
      stats.chatHistory = JSON.parse(localStorage.getItem("petchecky_chat_history") || "[]").length;
      stats.vaccination = JSON.parse(localStorage.getItem("petchecky_vaccination") || "[]").length;
      stats.healthRecords = JSON.parse(localStorage.getItem("petchecky_health_records") || "[]").length;
      stats.walkRecords = JSON.parse(localStorage.getItem("petchecky_walk_records") || "[]").length;
      stats.dietLogs = JSON.parse(localStorage.getItem("petchecky_diet_logs") || "[]").length;
      stats.gallery = JSON.parse(localStorage.getItem("petchecky_gallery") || "[]").length;
    } catch {
      // Ignore parse errors
    }

    return stats;
  };

  const stats = getDataStats();
  const totalItems = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ←
          </Link>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {t.backup.title}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {/* Message */}
        {message && (
          <div
            className={`mb-4 rounded-xl p-4 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Data Stats */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
            {t.backup.currentData}
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.backup.pets}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{stats.pets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.backup.reminders}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{stats.reminders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.backup.chatHistory}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{stats.chatHistory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.backup.vaccination}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{stats.vaccination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.backup.healthRecords}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{stats.healthRecords}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.backup.walkRecords}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{stats.walkRecords}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.backup.dietLogs}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{stats.dietLogs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t.backup.gallery}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{stats.gallery}</span>
            </div>
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <div className="flex justify-between font-medium">
              <span className="text-gray-700 dark:text-gray-300">{t.backup.total}</span>
              <span className="text-blue-600 dark:text-blue-400">{totalItems}</span>
            </div>
          </div>
        </section>

        {/* Cloud Sync (for logged in users) */}
        {user && (
          <section className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">☁️</span>
              <div>
                <h2 className="font-semibold text-blue-800 dark:text-blue-200">
                  {t.backup.cloudSync}
                </h2>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {t.backup.cloudSyncDesc}
                </p>
              </div>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t.backup.syncedAs}: {user.email}
            </p>
          </section>
        )}

        {/* Export Section */}
        <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">📤</span>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                {t.backup.export}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.backup.exportDesc}
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting || totalItems === 0}
            className="w-full rounded-xl bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? t.common.loading : t.backup.exportButton}
          </button>
        </section>

        {/* Import Section */}
        <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">📥</span>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                {t.backup.import}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.backup.importDesc}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="backup-file-input"
          />
          <label
            htmlFor="backup-file-input"
            className={`block w-full rounded-xl border-2 border-dashed border-gray-300 py-6 text-center cursor-pointer hover:border-blue-400 transition-colors dark:border-gray-600 dark:hover:border-blue-500 ${
              isImporting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="text-3xl mb-2">📁</div>
            <p className="text-gray-600 dark:text-gray-400">
              {isImporting ? t.common.loading : t.backup.selectFile}
            </p>
            <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
              {t.backup.fileFormat}
            </p>
          </label>
        </section>

        {/* Warning Section */}
        <section className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="text-sm text-yellow-700 dark:text-yellow-400">
              <p className="font-medium mb-1">{t.backup.warning}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t.backup.warningItem1}</li>
                <li>{t.backup.warningItem2}</li>
                <li>{t.backup.warningItem3}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Clear Data Section */}
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">🗑️</span>
            <div>
              <h2 className="font-semibold text-red-800 dark:text-red-200">
                {t.backup.clearData}
              </h2>
              <p className="text-sm text-red-600 dark:text-red-400">
                {t.backup.clearDataDesc}
              </p>
            </div>
          </div>
          <button
            onClick={handleClearData}
            className="w-full rounded-xl border-2 border-red-300 bg-white py-3 font-medium text-red-600 hover:bg-red-100 dark:border-red-600 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/30"
          >
            {t.backup.clearButton}
          </button>
        </section>
      </main>
    </div>
  );
}
