"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePushNotification } from "@/contexts/PushNotificationContext";

interface PetProfile {
  id: string;
  name: string;
  species: "dog" | "cat";
  breed: string;
  age: number;
  weight: number;
}

interface Reminder {
  id: string;
  petId: string;
  petName: string;
  type: "vaccination" | "medication" | "vet_visit" | "grooming" | "other";
  title: string;
  description?: string;
  date: string;
  time: string;
  repeat: "none" | "daily" | "weekly" | "monthly" | "yearly";
  enabled: boolean;
  notified?: boolean;
}

const REMINDER_TYPES = [
  { value: "vaccination", icon: "💉", labelKey: "vaccination" },
  { value: "medication", icon: "💊", labelKey: "medication" },
  { value: "vet_visit", icon: "🏥", labelKey: "vetVisit" },
  { value: "grooming", icon: "✂️", labelKey: "grooming" },
  { value: "other", icon: "📌", labelKey: "other" },
] as const;

const REPEAT_OPTIONS = [
  { value: "none", labelKey: "none" },
  { value: "daily", labelKey: "daily" },
  { value: "weekly", labelKey: "weekly" },
  { value: "monthly", labelKey: "monthly" },
  { value: "yearly", labelKey: "yearly" },
] as const;

export default function RemindersPage() {
  const { t } = useLanguage();
  const { isSupported, isSubscribed, enableNotifications } = usePushNotification();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  // Load pets and reminders
  useEffect(() => {
    const savedPets = localStorage.getItem("petchecky_pets");
    if (savedPets) {
      const parsed = JSON.parse(savedPets);
      const petsArray = Array.isArray(parsed) ? parsed : [{ ...parsed, id: `local_${Date.now()}` }];
      setPets(petsArray);
      if (petsArray.length > 0) {
        setSelectedPetId(petsArray[0].id);
      }
    }

    const savedReminders = localStorage.getItem("petchecky_reminders");
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  const getTypeLabel = (type: Reminder["type"]) => {
    const typeData = REMINDER_TYPES.find((rt) => rt.value === type);
    return typeData ? `${typeData.icon} ${t.reminders[typeData.labelKey as keyof typeof t.reminders]}` : type;
  };

  // Check for due reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      reminders.forEach((reminder) => {
        if (!reminder.enabled || reminder.notified) return;

        const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
        const timeDiff = reminderDateTime.getTime() - now.getTime();

        // Notify if within 1 minute
        if (timeDiff >= 0 && timeDiff <= 60000) {
          if (isSubscribed && "Notification" in window && Notification.permission === "granted") {
            new Notification(`${reminder.petName} - ${reminder.title}`, {
              body: reminder.description || getTypeLabel(reminder.type),
              icon: "/icons/icon-192x192.png",
            });

            // Mark as notified
            const updated = reminders.map((r) =>
              r.id === reminder.id ? { ...r, notified: true } : r
            );
            setReminders(updated);
            localStorage.setItem("petchecky_reminders", JSON.stringify(updated));
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 30000);
    checkReminders();

    return () => clearInterval(interval);
  }, [reminders, isSubscribed]);

  const getRepeatLabel = (repeat: Reminder["repeat"]) => {
    return t.reminders[repeat as keyof typeof t.reminders] || repeat;
  };

  const handleSaveReminder = (reminder: Omit<Reminder, "id" | "notified">) => {
    let updated: Reminder[];

    if (editingReminder) {
      updated = reminders.map((r) =>
        r.id === editingReminder.id ? { ...reminder, id: editingReminder.id, notified: false } : r
      );
    } else {
      const newReminder: Reminder = {
        ...reminder,
        id: Date.now().toString(),
        notified: false,
      };
      updated = [...reminders, newReminder];
    }

    setReminders(updated);
    localStorage.setItem("petchecky_reminders", JSON.stringify(updated));
    setShowModal(false);
    setEditingReminder(null);
  };

  const handleDeleteReminder = (id: string) => {
    if (!confirm(t.common.confirm + "?")) return;
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    localStorage.setItem("petchecky_reminders", JSON.stringify(updated));
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled, notified: false } : r
    );
    setReminders(updated);
    localStorage.setItem("petchecky_reminders", JSON.stringify(updated));
  };

  const getFilteredReminders = () => {
    const now = new Date();
    let filtered = selectedPetId
      ? reminders.filter((r) => r.petId === selectedPetId)
      : reminders;

    if (filter === "upcoming") {
      filtered = filtered.filter((r) => new Date(`${r.date}T${r.time}`) >= now);
    } else if (filter === "past") {
      filtered = filtered.filter((r) => new Date(`${r.date}T${r.time}`) < now);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);

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
            {t.reminders.title}
          </h1>
        </div>
      </header>

      {/* Notification Permission Banner */}
      {isSupported && !isSubscribed && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 dark:bg-yellow-900/20 dark:border-yellow-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {t.reminders.enableNotifications}
            </p>
            <button
              onClick={() => enableNotifications()}
              className="rounded-lg bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600"
            >
              {t.notifications.enable}
            </button>
          </div>
        </div>
      )}

      {/* Pet Selector */}
      {pets.length > 1 && (
        <div className="border-b border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedPetId(null)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !selectedPetId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {t.vaccination.all}
            </button>
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedPetId === pet.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                <span>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex">
          {(["all", "upcoming", "past"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                filter === f
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {t.reminders[f as keyof typeof t.reminders]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4">
        {/* Add Button */}
        <button
          onClick={() => {
            setEditingReminder(null);
            setShowModal(true);
          }}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-4 text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          <span className="text-xl">+</span>
          <span>{t.reminders.addReminder}</span>
        </button>

        {/* Reminders List */}
        {getFilteredReminders().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-gray-500 dark:text-gray-400">{t.reminders.noReminders}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {getFilteredReminders().map((reminder) => {
              const isPast = new Date(`${reminder.date}T${reminder.time}`) < new Date();
              const typeData = REMINDER_TYPES.find((t) => t.value === reminder.type);

              return (
                <div
                  key={reminder.id}
                  className={`rounded-xl border bg-white p-4 transition-all dark:bg-gray-800 ${
                    isPast
                      ? "border-gray-200 opacity-60 dark:border-gray-700"
                      : reminder.enabled
                      ? "border-blue-200 dark:border-blue-700"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{typeData?.icon || "📌"}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-800 dark:text-gray-100">
                            {reminder.title}
                          </h3>
                          {!reminder.enabled && (
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700">
                              {t.reminders.disabled}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {reminder.petName}
                        </p>
                        {reminder.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {reminder.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>📅 {reminder.date}</span>
                          <span>⏰ {reminder.time}</span>
                          {reminder.repeat !== "none" && (
                            <span>🔄 {getRepeatLabel(reminder.repeat)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggleReminder(reminder.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          reminder.enabled ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            reminder.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingReminder(reminder);
                          setShowModal(true);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <ReminderModal
          pets={pets}
          selectedPetId={selectedPetId}
          reminder={editingReminder}
          onSave={handleSaveReminder}
          onClose={() => {
            setShowModal(false);
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
}

// Reminder Modal Component
function ReminderModal({
  pets,
  selectedPetId,
  reminder,
  onSave,
  onClose,
}: {
  pets: PetProfile[];
  selectedPetId: string | null;
  reminder: Reminder | null;
  onSave: (reminder: Omit<Reminder, "id" | "notified">) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [petId, setPetId] = useState(reminder?.petId || selectedPetId || pets[0]?.id || "");
  const [type, setType] = useState<Reminder["type"]>(reminder?.type || "vaccination");
  const [title, setTitle] = useState(reminder?.title || "");
  const [description, setDescription] = useState(reminder?.description || "");
  const [date, setDate] = useState(reminder?.date || new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(reminder?.time || "09:00");
  const [repeat, setRepeat] = useState<Reminder["repeat"]>(reminder?.repeat || "none");
  const [enabled, setEnabled] = useState(reminder?.enabled ?? true);

  const selectedPet = pets.find((p) => p.id === petId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId || !title.trim()) return;

    onSave({
      petId,
      petName: selectedPet?.name || "",
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time,
      repeat,
      enabled,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-gray-100">
          {reminder ? t.reminders.editReminder : t.reminders.addReminder}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              {t.pet.selectPet}
            </label>
            <select
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.species === "dog" ? "🐕" : "🐈"} {pet.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reminder Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              {t.reminders.type}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {REMINDER_TYPES.map((typeOption) => (
                <button
                  key={typeOption.value}
                  type="button"
                  onClick={() => setType(typeOption.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors ${
                    type === typeOption.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <span className="text-xl">{typeOption.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {t.reminders[typeOption.labelKey as keyof typeof t.reminders]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              {t.reminders.reminderTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.reminders.titlePlaceholder}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              {t.reminders.descriptionLabel}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                {t.reminders.date}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                {t.reminders.time}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              {t.reminders.repeat}
            </label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as Reminder["repeat"])}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {REPEAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t.reminders[option.labelKey as keyof typeof t.reminders]}
                </option>
              ))}
            </select>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.reminders.enableReminder}
            </span>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
