"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: "once" | "twice" | "three" | "asNeeded";
  timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  notes?: string;
  refillDate?: string;
  remainingDoses?: number;
  isActive: boolean;
  logs: MedicationLog[];
}

interface MedicationLog {
  id: string;
  date: string;
  time: string;
  taken: boolean;
  notes?: string;
}

interface Pet {
  id: string;
  name: string;
  species: "dog" | "cat";
}

const FREQUENCY_OPTIONS: { value: Medication["frequency"]; label: string; times: number }[] = [
  { value: "once", label: "1일 1회", times: 1 },
  { value: "twice", label: "1일 2회", times: 2 },
  { value: "three", label: "1일 3회", times: 3 },
  { value: "asNeeded", label: "필요시", times: 0 },
];

const TIME_OF_DAY: { value: Medication["timeOfDay"][number]; label: string; icon: string; time: string }[] = [
  { value: "morning", label: "아침", icon: "🌅", time: "08:00" },
  { value: "afternoon", label: "점심", icon: "☀️", time: "12:00" },
  { value: "evening", label: "저녁", icon: "🌆", time: "18:00" },
  { value: "night", label: "밤", icon: "🌙", time: "22:00" },
];

export default function MedicationPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");
  const [showLogModal, setShowLogModal] = useState<Medication | null>(null);

  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "once" as Medication["frequency"],
    timeOfDay: ["morning"] as Medication["timeOfDay"],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    prescribedBy: "",
    notes: "",
    refillDate: "",
    remainingDoses: "",
  });

  // Load data
  useEffect(() => {
    const savedPets = localStorage.getItem("petProfiles");
    if (savedPets) {
      const parsed = JSON.parse(savedPets);
      setPets(Array.isArray(parsed) ? parsed : [parsed]);
      if (parsed.length > 0 || parsed.id) {
        setSelectedPetId(Array.isArray(parsed) ? parsed[0].id : parsed.id);
      }
    }

    const savedMeds = localStorage.getItem("medications");
    if (savedMeds) {
      setMedications(JSON.parse(savedMeds));
    }
  }, []);

  // Save medications
  useEffect(() => {
    if (medications.length > 0) {
      localStorage.setItem("medications", JSON.stringify(medications));
    }
  }, [medications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMed: Medication = {
      id: editingMed?.id || uuidv4(),
      petId: selectedPetId === "all" ? pets[0]?.id || "default" : selectedPetId,
      name: form.name,
      dosage: form.dosage,
      frequency: form.frequency,
      timeOfDay: form.timeOfDay,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      prescribedBy: form.prescribedBy || undefined,
      notes: form.notes || undefined,
      refillDate: form.refillDate || undefined,
      remainingDoses: form.remainingDoses ? parseInt(form.remainingDoses) : undefined,
      isActive: true,
      logs: editingMed?.logs || [],
    };

    if (editingMed) {
      setMedications(medications.map(m => m.id === editingMed.id ? newMed : m));
    } else {
      setMedications([...medications, newMed]);
    }

    resetForm();
  };

  const resetForm = () => {
    setForm({
      name: "",
      dosage: "",
      frequency: "once",
      timeOfDay: ["morning"],
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      prescribedBy: "",
      notes: "",
      refillDate: "",
      remainingDoses: "",
    });
    setShowForm(false);
    setEditingMed(null);
  };

  const handleEdit = (med: Medication) => {
    setForm({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      timeOfDay: med.timeOfDay,
      startDate: med.startDate,
      endDate: med.endDate || "",
      prescribedBy: med.prescribedBy || "",
      notes: med.notes || "",
      refillDate: med.refillDate || "",
      remainingDoses: med.remainingDoses?.toString() || "",
    });
    setEditingMed(med);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("이 약물을 삭제하시겠습니까?")) {
      setMedications(medications.filter(m => m.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setMedications(medications.map(m =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const handleLogDose = (med: Medication, timeOfDay: string, taken: boolean) => {
    const now = new Date();
    const log: MedicationLog = {
      id: uuidv4(),
      date: now.toISOString().split("T")[0],
      time: timeOfDay,
      taken,
      notes: taken ? undefined : "복용 건너뜀",
    };

    setMedications(medications.map(m =>
      m.id === med.id
        ? {
            ...m,
            logs: [...m.logs, log],
            remainingDoses: m.remainingDoses && taken ? m.remainingDoses - 1 : m.remainingDoses
          }
        : m
    ));
  };

  const getTodayLogs = (med: Medication) => {
    const today = new Date().toISOString().split("T")[0];
    return med.logs.filter(log => log.date === today);
  };

  const getComplianceRate = (med: Medication) => {
    if (med.logs.length === 0) return 0;
    const taken = med.logs.filter(log => log.taken).length;
    return Math.round((taken / med.logs.length) * 100);
  };

  const filteredMedications = medications
    .filter(m => selectedPetId === "all" || m.petId === selectedPetId)
    .filter(m => {
      if (filter === "active") return m.isActive;
      if (filter === "completed") return !m.isActive;
      return true;
    });

  const needsRefill = medications.filter(m => {
    if (!m.refillDate || !m.isActive) return false;
    const refillDate = new Date(m.refillDate);
    const today = new Date();
    const diffDays = Math.ceil((refillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  });

  const lowStock = medications.filter(m =>
    m.isActive && m.remainingDoses !== undefined && m.remainingDoses <= 5
  );

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.name || "반려동물";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold text-gray-800 dark:text-white">펫체키</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">💊 약물 관리</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Alerts */}
        {(needsRefill.length > 0 || lowStock.length > 0) && (
          <div className="space-y-3">
            {needsRefill.length > 0 && (
              <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 dark:bg-orange-900/20 dark:border-orange-800">
                <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
                  <span className="text-xl">📅</span>
                  <span className="font-medium">리필 예정: {needsRefill.map(m => m.name).join(", ")}</span>
                </div>
              </div>
            )}
            {lowStock.length > 0 && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4 dark:bg-red-900/20 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium">재고 부족: {lowStock.map(m => `${m.name} (${m.remainingDoses}회분 남음)`).join(", ")}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pet & Filter Selection */}
        <div className="flex flex-wrap gap-3">
          {pets.length > 1 && (
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">전체 반려동물</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>
                  {pet.species === "dog" ? "🐕" : "🐈"} {pet.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            {[
              { value: "active", label: "복용 중" },
              { value: "completed", label: "완료" },
              { value: "all", label: "전체" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === opt.value
                    ? "bg-white text-green-600 shadow dark:bg-gray-700 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="ml-auto rounded-xl bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600"
          >
            + 약물 추가
          </button>
        </div>

        {/* Today's Schedule */}
        {filter === "active" && filteredMedications.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-100 p-6 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">오늘의 복용 일정</h2>
            <div className="space-y-4">
              {TIME_OF_DAY.map(time => {
                const medsAtTime = filteredMedications.filter(m =>
                  m.isActive && m.timeOfDay.includes(time.value)
                );
                if (medsAtTime.length === 0) return null;

                return (
                  <div key={time.value} className="border-l-4 border-green-400 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{time.icon}</span>
                      <span className="font-medium text-gray-800 dark:text-white">{time.label}</span>
                      <span className="text-sm text-gray-500">{time.time}</span>
                    </div>
                    <div className="space-y-2">
                      {medsAtTime.map(med => {
                        const todayLogs = getTodayLogs(med);
                        const takenThisTime = todayLogs.some(log => log.time === time.value && log.taken);

                        return (
                          <div
                            key={med.id}
                            className={`flex items-center justify-between rounded-xl p-3 ${
                              takenThisTime
                                ? "bg-green-50 dark:bg-green-900/20"
                                : "bg-gray-50 dark:bg-gray-700"
                            }`}
                          >
                            <div>
                              <p className={`font-medium ${takenThisTime ? "text-green-700 dark:text-green-300" : "text-gray-800 dark:text-white"}`}>
                                {med.name}
                              </p>
                              <p className="text-sm text-gray-500">{med.dosage}</p>
                            </div>
                            {takenThisTime ? (
                              <span className="text-green-500 text-2xl">✓</span>
                            ) : (
                              <button
                                onClick={() => handleLogDose(med, time.value, true)}
                                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                              >
                                복용 완료
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Medication List */}
        <div className="space-y-4">
          {filteredMedications.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">💊</span>
              <p className="text-gray-500 dark:text-gray-400">등록된 약물이 없습니다</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-green-600 font-medium hover:underline"
              >
                첫 약물 등록하기
              </button>
            </div>
          ) : (
            filteredMedications.map(med => (
              <div
                key={med.id}
                className={`rounded-2xl border p-5 ${
                  med.isActive
                    ? "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                    : "bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{med.name}</h3>
                      {!med.isActive && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full dark:bg-gray-600 dark:text-gray-300">
                          완료
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{med.dosage}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowLogModal(med)}
                      className="p-2 text-gray-400 hover:text-blue-500"
                      title="복용 기록"
                    >
                      📊
                    </button>
                    <button
                      onClick={() => handleEdit(med)}
                      className="p-2 text-gray-400 hover:text-green-500"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">⏰</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {FREQUENCY_OPTIONS.find(f => f.value === med.frequency)?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📅</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {med.startDate} ~ {med.endDate || "계속"}
                    </span>
                  </div>
                  {med.prescribedBy && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">👨‍⚕️</span>
                      <span className="text-gray-600 dark:text-gray-300">{med.prescribedBy}</span>
                    </div>
                  )}
                  {med.remainingDoses !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">💊</span>
                      <span className={`${med.remainingDoses <= 5 ? "text-red-500 font-medium" : "text-gray-600 dark:text-gray-300"}`}>
                        {med.remainingDoses}회분 남음
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {med.timeOfDay.map(time => {
                    const timeInfo = TIME_OF_DAY.find(t => t.value === time);
                    return (
                      <span
                        key={time}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400"
                      >
                        {timeInfo?.icon} {timeInfo?.label}
                      </span>
                    );
                  })}
                </div>

                {med.isActive && med.logs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">복용 순응도</span>
                      <span className={`font-medium ${
                        getComplianceRate(med) >= 80 ? "text-green-600" :
                        getComplianceRate(med) >= 50 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {getComplianceRate(med)}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full ${
                          getComplianceRate(med) >= 80 ? "bg-green-500" :
                          getComplianceRate(med) >= 50 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${getComplianceRate(med)}%` }}
                      />
                    </div>
                  </div>
                )}

                {med.isActive && (
                  <button
                    onClick={() => handleToggleActive(med.id)}
                    className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg dark:border-gray-600"
                  >
                    복용 완료로 표시
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                {editingMed ? "약물 수정" : "새 약물 등록"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    약물명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="예: 심장사상충 예방약"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    용량/복용량 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    placeholder="예: 1정, 5ml, 반 알"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    복용 횟수
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FREQUENCY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, frequency: opt.value })}
                        className={`p-3 rounded-lg border text-sm ${
                          form.frequency === opt.value
                            ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    복용 시간대
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_OF_DAY.map(time => (
                      <button
                        key={time.value}
                        type="button"
                        onClick={() => {
                          const newTimes = form.timeOfDay.includes(time.value)
                            ? form.timeOfDay.filter(t => t !== time.value)
                            : [...form.timeOfDay, time.value];
                          setForm({ ...form, timeOfDay: newTimes.length > 0 ? newTimes : form.timeOfDay });
                        }}
                        className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${
                          form.timeOfDay.includes(time.value)
                            ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        <span>{time.icon}</span>
                        <span>{time.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      종료일 (선택)
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    처방 병원/수의사
                  </label>
                  <input
                    type="text"
                    value={form.prescribedBy}
                    onChange={(e) => setForm({ ...form, prescribedBy: e.target.value })}
                    placeholder="예: 행복동물병원 김수의사"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      리필 예정일
                    </label>
                    <input
                      type="date"
                      value={form.refillDate}
                      onChange={(e) => setForm({ ...form, refillDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      남은 복용 횟수
                    </label>
                    <input
                      type="number"
                      value={form.remainingDoses}
                      onChange={(e) => setForm({ ...form, remainingDoses: e.target.value })}
                      placeholder="예: 30"
                      min="0"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    메모
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="복용 시 주의사항 등"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 rounded-lg border border-gray-300 font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg bg-green-500 font-medium text-white hover:bg-green-600"
                  >
                    {editingMed ? "수정" : "등록"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Log History Modal */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {showLogModal.name} 복용 기록
                </h2>
                <button
                  onClick={() => setShowLogModal(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">총 복용 순응도</span>
                  <span className="text-2xl font-bold text-green-600">{getComplianceRate(showLogModal)}%</span>
                </div>
              </div>

              {showLogModal.logs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">아직 복용 기록이 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {[...showLogModal.logs].reverse().slice(0, 30).map(log => (
                    <div
                      key={log.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        log.taken
                          ? "bg-green-50 dark:bg-green-900/20"
                          : "bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{log.date}</p>
                        <p className="text-sm text-gray-500">
                          {TIME_OF_DAY.find(t => t.value === log.time)?.label}
                        </p>
                      </div>
                      <span className={`text-xl ${log.taken ? "text-green-500" : "text-red-500"}`}>
                        {log.taken ? "✓" : "✕"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowLogModal(null)}
                className="w-full mt-4 py-3 rounded-lg border border-gray-300 font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
