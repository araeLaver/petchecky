"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface PetProfile {
  id: string;
  name: string;
  species: "dog" | "cat";
}

interface CalendarEvent {
  id: string;
  petId: string;
  petName: string;
  type: "vaccination" | "reminder" | "health" | "walk" | "vet_visit";
  title: string;
  date: string;
  time?: string;
  description?: string;
}

const DAYS_OF_WEEK_KO = ["일", "월", "화", "수", "목", "금", "토"];
const DAYS_OF_WEEK_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_OF_WEEK_JA = ["日", "月", "火", "水", "木", "金", "土"];

const MONTHS_KO = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_JA = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

const EVENT_ICONS: Record<CalendarEvent["type"], string> = {
  vaccination: "💉",
  reminder: "🔔",
  health: "📊",
  walk: "🚶",
  vet_visit: "🏥",
};

const EVENT_COLORS: Record<CalendarEvent["type"], string> = {
  vaccination: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  reminder: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  health: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  walk: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  vet_visit: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function CalendarPage() {
  const { t, language } = useLanguage();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysOfWeek = language === "ko" ? DAYS_OF_WEEK_KO : language === "ja" ? DAYS_OF_WEEK_JA : DAYS_OF_WEEK_EN;
  const months = language === "ko" ? MONTHS_KO : language === "ja" ? MONTHS_JA : MONTHS_EN;

  // Load pets and events
  useEffect(() => {
    const savedPets = localStorage.getItem("petchecky_pets");
    if (savedPets) {
      const parsed = JSON.parse(savedPets);
      const petsArray = Array.isArray(parsed) ? parsed : [{ ...parsed, id: `local_${Date.now()}` }];
      setPets(petsArray);
    }

    loadEvents();
  }, []);

  const loadEvents = () => {
    const allEvents: CalendarEvent[] = [];

    // Load vaccination records
    try {
      const vaccinations = JSON.parse(localStorage.getItem("petchecky_vaccination") || "[]");
      vaccinations.forEach((v: { id: string; petId: string; petName: string; vaccineType: string; vaccinationDate: string; nextVaccination?: string }) => {
        if (v.nextVaccination) {
          allEvents.push({
            id: `vac_${v.id}`,
            petId: v.petId,
            petName: v.petName || "Pet",
            type: "vaccination",
            title: v.vaccineType,
            date: v.nextVaccination,
          });
        }
      });
    } catch {}

    // Load reminders
    try {
      const reminders = JSON.parse(localStorage.getItem("petchecky_reminders") || "[]");
      reminders.forEach((r: { id: string; petId: string; petName: string; title: string; date: string; time: string; type: string; enabled: boolean }) => {
        if (r.enabled) {
          allEvents.push({
            id: `rem_${r.id}`,
            petId: r.petId,
            petName: r.petName,
            type: r.type === "vet_visit" ? "vet_visit" : "reminder",
            title: r.title,
            date: r.date,
            time: r.time,
          });
        }
      });
    } catch {}

    // Load health records
    try {
      const healthRecords = JSON.parse(localStorage.getItem("petchecky_health_records") || "[]");
      healthRecords.forEach((h: { id: string; petId: string; petName: string; date: string; weight: number }) => {
        allEvents.push({
          id: `health_${h.id}`,
          petId: h.petId,
          petName: h.petName || "Pet",
          type: "health",
          title: `${h.weight}kg`,
          date: h.date,
        });
      });
    } catch {}

    // Load walk records
    try {
      const walkRecords = JSON.parse(localStorage.getItem("petchecky_walk_records") || "[]");
      walkRecords.forEach((w: { id: string; petId: string; petName: string; date: string; duration: number; distance: number }) => {
        allEvents.push({
          id: `walk_${w.id}`,
          petId: w.petId,
          petName: w.petName || "Pet",
          type: "walk",
          title: `${w.duration}min / ${w.distance}km`,
          date: w.date,
        });
      });
    } catch {}

    setEvents(allEvents);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const getEventsForDate = (dateStr: string) => {
    let filtered = events.filter((e) => e.date === dateStr);
    if (selectedPetId) {
      filtered = filtered.filter((e) => e.petId === selectedPetId);
    }
    return filtered;
  };

  const formatDateStr = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const today = formatDateStr(new Date());

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(today);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              ←
            </Link>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {t.calendar.title}
            </h1>
          </div>
          <button
            onClick={goToToday}
            className="rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
          >
            {t.calendar.today}
          </button>
        </div>
      </header>

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
              {t.calendar.all}
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

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={goToPreviousMonth}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {year}년 {months[month]}
        </h2>
        <button
          onClick={goToNextMonth}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {daysOfWeek.map((day, i) => (
            <div
              key={day}
              className={`py-2 text-center text-sm font-medium ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dateStr = formatDateStr(date);
            const dayEvents = getEventsForDate(dateStr);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const dayOfWeek = date.getDay();

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative min-h-[80px] border-b border-r border-gray-100 p-1 text-left transition-colors dark:border-gray-700 ${
                  isCurrentMonth ? "" : "bg-gray-50 dark:bg-gray-900/50"
                } ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                <div
                  className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                    isToday
                      ? "bg-blue-500 text-white"
                      : isCurrentMonth
                      ? dayOfWeek === 0
                        ? "text-red-500"
                        : dayOfWeek === 6
                        ? "text-blue-500"
                        : "text-gray-700 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`truncate rounded px-1 py-0.5 text-xs ${EVENT_COLORS[event.type]}`}
                    >
                      {EVENT_ICONS[event.type]} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="px-1 text-xs text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="flex-1 p-4">
          <h3 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
            {new Date(selectedDate).toLocaleDateString(
              language === "ko" ? "ko-KR" : language === "ja" ? "ja-JP" : "en-US",
              { year: "numeric", month: "long", day: "numeric", weekday: "long" }
            )}
          </h3>

          {selectedDateEvents.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-gray-500 dark:text-gray-400">{t.calendar.noEvents}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className={`rounded-xl border p-4 ${EVENT_COLORS[event.type].replace("text-", "border-").split(" ")[0]} bg-white dark:bg-gray-800`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{EVENT_ICONS[event.type]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-800 dark:text-gray-100">
                          {event.title}
                        </h4>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${EVENT_COLORS[event.type]}`}>
                          {t.calendar.eventTypes[event.type as keyof typeof t.calendar.eventTypes]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {event.petName}
                        {event.time && ` · ${event.time}`}
                      </p>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(EVENT_ICONS).map(([type, icon]) => (
            <div key={type} className="flex items-center gap-1">
              <span>{icon}</span>
              <span className="text-gray-600 dark:text-gray-400">
                {t.calendar.eventTypes[type as keyof typeof t.calendar.eventTypes]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
