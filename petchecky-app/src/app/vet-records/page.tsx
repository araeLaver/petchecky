"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useLanguage } from "@/contexts/LanguageContext";

interface VetRecord {
  id: string;
  petId: string;
  date: string;
  hospitalName: string;
  vetName?: string;
  visitType: "checkup" | "vaccination" | "treatment" | "surgery" | "emergency" | "other";
  diagnosis?: string;
  symptoms?: string[];
  treatment?: string;
  prescriptions?: Prescription[];
  testResults?: TestResult[];
  nextVisitDate?: string;
  cost?: number;
  notes?: string;
  attachments?: string[];
  createdAt: string;
}

interface Prescription {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface TestResult {
  testName: string;
  result: string;
  normalRange?: string;
  status: "normal" | "abnormal" | "critical";
}

interface Pet {
  id: string;
  name: string;
  species: "dog" | "cat";
}

const VISIT_TYPES = [
  { id: "checkup", icon: "🩺", label: "정기검진" },
  { id: "vaccination", icon: "💉", label: "예방접종" },
  { id: "treatment", icon: "💊", label: "치료" },
  { id: "surgery", icon: "🏥", label: "수술" },
  { id: "emergency", icon: "🚨", label: "응급" },
  { id: "other", icon: "📋", label: "기타" },
];

export default function VetRecordsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [records, setRecords] = useState<VetRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<VetRecord | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    hospitalName: "",
    vetName: "",
    visitType: "checkup" as VetRecord["visitType"],
    diagnosis: "",
    symptoms: "",
    treatment: "",
    nextVisitDate: "",
    cost: "",
    notes: "",
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  useEffect(() => {
    const storedPets = localStorage.getItem("pets");
    if (storedPets) {
      const parsedPets = JSON.parse(storedPets);
      setPets(parsedPets);
      if (parsedPets.length > 0) {
        setSelectedPetId(parsedPets[0].id);
      }
    }

    const storedRecords = localStorage.getItem("vetRecords");
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    }
  }, []);

  const petRecords = records.filter((r) => r.petId === selectedPetId);
  const filteredRecords = filterType === "all"
    ? petRecords
    : petRecords.filter((r) => r.visitType === filterType);

  const getVisitTypeInfo = (type: string) => {
    return VISIT_TYPES.find((v) => v.id === type) || VISIT_TYPES[5];
  };

  const handleAddRecord = () => {
    if (!newRecord.hospitalName || !newRecord.date || !selectedPetId) return;

    const record: VetRecord = {
      id: uuidv4(),
      petId: selectedPetId,
      date: newRecord.date,
      hospitalName: newRecord.hospitalName,
      vetName: newRecord.vetName || undefined,
      visitType: newRecord.visitType,
      diagnosis: newRecord.diagnosis || undefined,
      symptoms: newRecord.symptoms ? newRecord.symptoms.split(",").map((s) => s.trim()) : undefined,
      treatment: newRecord.treatment || undefined,
      prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
      testResults: testResults.length > 0 ? testResults : undefined,
      nextVisitDate: newRecord.nextVisitDate || undefined,
      cost: newRecord.cost ? parseFloat(newRecord.cost) : undefined,
      notes: newRecord.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedRecords = [...records, record];
    setRecords(updatedRecords);
    localStorage.setItem("vetRecords", JSON.stringify(updatedRecords));

    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setNewRecord({
      date: new Date().toISOString().split("T")[0],
      hospitalName: "",
      vetName: "",
      visitType: "checkup",
      diagnosis: "",
      symptoms: "",
      treatment: "",
      nextVisitDate: "",
      cost: "",
      notes: "",
    });
    setPrescriptions([]);
    setTestResults([]);
  };

  const handleDeleteRecord = (id: string) => {
    const updatedRecords = records.filter((r) => r.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem("vetRecords", JSON.stringify(updatedRecords));
    setShowDetailModal(null);
  };

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const addTestResult = () => {
    setTestResults([...testResults, { testName: "", result: "", normalRange: "", status: "normal" }]);
  };

  const updateTestResult = (index: number, field: keyof TestResult, value: string) => {
    const updated = [...testResults];
    if (field === "status") {
      updated[index][field] = value as TestResult["status"];
    } else {
      updated[index][field] = value;
    }
    setTestResults(updated);
  };

  const removeTestResult = (index: number) => {
    setTestResults(testResults.filter((_, i) => i !== index));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
  };

  // Get upcoming visits
  const upcomingVisits = petRecords
    .filter((r) => r.nextVisitDate && new Date(r.nextVisitDate) >= new Date())
    .sort((a, b) => new Date(a.nextVisitDate!).getTime() - new Date(b.nextVisitDate!).getTime());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {t.vetRecords?.title || "진료 기록"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.vetRecords?.subtitle || "수의사 진료 내역을 관리하세요"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {/* Pet Selector */}
        {pets.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPetId(pet.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedPetId === pet.id
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                <span>{pet.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Upcoming Visits Alert */}
        {upcomingVisits.length > 0 && (
          <div className="mb-4 rounded-2xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-300">
              <span>📅</span>
              {t.vetRecords?.upcomingVisits || "예정된 방문"}
            </h3>
            <div className="space-y-2">
              {upcomingVisits.slice(0, 3).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{record.hospitalName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(record.nextVisitDate!)}
                    </p>
                  </div>
                  <span className="text-2xl">{getVisitTypeInfo(record.visitType).icon}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visit Type Filter */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterType("all")}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filterType === "all"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {t.vetRecords?.all || "전체"}
          </button>
          {VISIT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filterType === type.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              <span>{type.icon}</span>
              <span>{t.vetRecords?.visitTypes?.[type.id as keyof typeof t.vetRecords.visitTypes] || type.label}</span>
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-gray-800">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{petRecords.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.vetRecords?.totalVisits || "총 방문"}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-gray-800">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {petRecords.filter((r) => r.visitType === "checkup").length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.vetRecords?.checkups || "정기검진"}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-gray-800">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(petRecords.reduce((sum, r) => sum + (r.cost || 0), 0))}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.vetRecords?.totalCost || "총 비용"}</p>
          </div>
        </div>

        {/* Records List */}
        <div className="mb-20 space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center dark:bg-gray-800">
              <p className="text-4xl mb-3">🏥</p>
              <p className="text-gray-500 dark:text-gray-400">
                {t.vetRecords?.noRecords || "진료 기록이 없습니다"}
              </p>
            </div>
          ) : (
            filteredRecords
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record) => {
                const typeInfo = getVisitTypeInfo(record.visitType);
                return (
                  <button
                    key={record.id}
                    onClick={() => setShowDetailModal(record)}
                    className="w-full rounded-2xl bg-white p-4 shadow-sm text-left transition-all hover:shadow-md dark:bg-gray-800"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                        <span className="text-2xl">{typeInfo.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {record.hospitalName}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(record.date)}
                          </span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {t.vetRecords?.visitTypes?.[record.visitType as keyof typeof t.vetRecords.visitTypes] || typeInfo.label}
                        </p>
                        {record.diagnosis && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                            {record.diagnosis}
                          </p>
                        )}
                        {record.cost && (
                          <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency(record.cost)}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 active:scale-95"
        >
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </main>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 dark:bg-gray-800 sm:rounded-3xl">
            <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
              {t.vetRecords?.addRecord || "진료 기록 추가"}
            </h2>

            {/* Visit Type */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.vetRecords?.visitType || "방문 유형"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {VISIT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setNewRecord({ ...newRecord, visitType: type.id as VetRecord["visitType"] })}
                    className={`flex flex-col items-center rounded-xl p-3 transition-all ${
                      newRecord.visitType === type.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="mt-1 text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Hospital */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.vetRecords?.date || "진료일"}
                </label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.vetRecords?.nextVisit || "다음 방문"}
                </label>
                <input
                  type="date"
                  value={newRecord.nextVisitDate}
                  onChange={(e) => setNewRecord({ ...newRecord, nextVisitDate: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.vetRecords?.hospitalName || "병원명"} *
              </label>
              <input
                type="text"
                value={newRecord.hospitalName}
                onChange={(e) => setNewRecord({ ...newRecord, hospitalName: e.target.value })}
                placeholder={t.vetRecords?.hospitalPlaceholder || "병원 이름을 입력하세요"}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.vetRecords?.vetName || "담당 수의사"}
              </label>
              <input
                type="text"
                value={newRecord.vetName}
                onChange={(e) => setNewRecord({ ...newRecord, vetName: e.target.value })}
                placeholder={t.vetRecords?.vetPlaceholder || "수의사 이름 (선택)"}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Diagnosis & Treatment */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.vetRecords?.diagnosis || "진단명"}
              </label>
              <input
                type="text"
                value={newRecord.diagnosis}
                onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                placeholder={t.vetRecords?.diagnosisPlaceholder || "진단 내용"}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.vetRecords?.symptoms || "증상"} ({t.vetRecords?.commaSeparated || "쉼표로 구분"})
              </label>
              <input
                type="text"
                value={newRecord.symptoms}
                onChange={(e) => setNewRecord({ ...newRecord, symptoms: e.target.value })}
                placeholder={t.vetRecords?.symptomsPlaceholder || "구토, 설사, 식욕부진"}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.vetRecords?.treatment || "치료 내용"}
              </label>
              <textarea
                value={newRecord.treatment}
                onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                placeholder={t.vetRecords?.treatmentPlaceholder || "받은 치료 내용을 입력하세요"}
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Prescriptions */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.vetRecords?.prescriptions || "처방약"}
                </label>
                <button
                  onClick={addPrescription}
                  className="text-sm text-blue-500 hover:underline"
                >
                  + {t.vetRecords?.addPrescription || "추가"}
                </button>
              </div>
              {prescriptions.map((p, i) => (
                <div key={i} className="mb-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-700">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updatePrescription(i, "name", e.target.value)}
                      placeholder={t.vetRecords?.medicineName || "약 이름"}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      value={p.dosage}
                      onChange={(e) => updatePrescription(i, "dosage", e.target.value)}
                      placeholder={t.vetRecords?.dosage || "용량"}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={p.frequency}
                      onChange={(e) => updatePrescription(i, "frequency", e.target.value)}
                      placeholder={t.vetRecords?.frequency || "복용횟수"}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      value={p.duration}
                      onChange={(e) => updatePrescription(i, "duration", e.target.value)}
                      placeholder={t.vetRecords?.duration || "기간"}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    />
                    <button
                      onClick={() => removePrescription(i)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Test Results */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.vetRecords?.testResults || "검사 결과"}
                </label>
                <button
                  onClick={addTestResult}
                  className="text-sm text-blue-500 hover:underline"
                >
                  + {t.vetRecords?.addTest || "추가"}
                </button>
              </div>
              {testResults.map((tr, i) => (
                <div key={i} className="mb-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-700">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={tr.testName}
                      onChange={(e) => updateTestResult(i, "testName", e.target.value)}
                      placeholder={t.vetRecords?.testName || "검사명"}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    />
                    <select
                      value={tr.status}
                      onChange={(e) => updateTestResult(i, "status", e.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    >
                      <option value="normal">{t.vetRecords?.normal || "정상"}</option>
                      <option value="abnormal">{t.vetRecords?.abnormal || "이상"}</option>
                      <option value="critical">{t.vetRecords?.critical || "위험"}</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tr.result}
                      onChange={(e) => updateTestResult(i, "result", e.target.value)}
                      placeholder={t.vetRecords?.resultValue || "결과값"}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      value={tr.normalRange || ""}
                      onChange={(e) => updateTestResult(i, "normalRange", e.target.value)}
                      placeholder={t.vetRecords?.normalRange || "정상범위"}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    />
                    <button
                      onClick={() => removeTestResult(i)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cost & Notes */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.vetRecords?.cost || "비용"} (₩)
              </label>
              <input
                type="number"
                value={newRecord.cost}
                onChange={(e) => setNewRecord({ ...newRecord, cost: e.target.value })}
                placeholder="0"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.vetRecords?.notes || "메모"}
              </label>
              <textarea
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                placeholder={t.vetRecords?.notesPlaceholder || "추가 메모"}
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t.common?.cancel || "취소"}
              </button>
              <button
                onClick={handleAddRecord}
                disabled={!newRecord.hospitalName}
                className="flex-1 rounded-xl bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {t.common?.save || "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 dark:bg-gray-800 sm:rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {t.vetRecords?.recordDetail || "진료 상세"}
              </h2>
              <button
                onClick={() => setShowDetailModal(null)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getVisitTypeInfo(showDetailModal.visitType).icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      {showDetailModal.hospitalName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(showDetailModal.date)}
                    </p>
                  </div>
                </div>
                {showDetailModal.vetName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.vetRecords?.vetName || "담당"}: {showDetailModal.vetName}
                  </p>
                )}
              </div>

              {/* Diagnosis */}
              {showDetailModal.diagnosis && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.vetRecords?.diagnosis || "진단"}
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200">{showDetailModal.diagnosis}</p>
                </div>
              )}

              {/* Symptoms */}
              {showDetailModal.symptoms && showDetailModal.symptoms.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.vetRecords?.symptoms || "증상"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {showDetailModal.symptoms.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Treatment */}
              {showDetailModal.treatment && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.vetRecords?.treatment || "치료"}
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200">{showDetailModal.treatment}</p>
                </div>
              )}

              {/* Prescriptions */}
              {showDetailModal.prescriptions && showDetailModal.prescriptions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.vetRecords?.prescriptions || "처방약"}
                  </h4>
                  <div className="space-y-2">
                    {showDetailModal.prescriptions.map((p, i) => (
                      <div key={i} className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <p className="font-medium text-blue-800 dark:text-blue-300">{p.name}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {p.dosage} · {p.frequency} · {p.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Results */}
              {showDetailModal.testResults && showDetailModal.testResults.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.vetRecords?.testResults || "검사 결과"}
                  </h4>
                  <div className="space-y-2">
                    {showDetailModal.testResults.map((tr, i) => (
                      <div
                        key={i}
                        className={`rounded-lg p-3 ${
                          tr.status === "critical"
                            ? "bg-red-50 dark:bg-red-900/20"
                            : tr.status === "abnormal"
                            ? "bg-yellow-50 dark:bg-yellow-900/20"
                            : "bg-green-50 dark:bg-green-900/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{tr.testName}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              tr.status === "critical"
                                ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200"
                                : tr.status === "abnormal"
                                ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                                : "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                            }`}
                          >
                            {tr.status === "critical"
                              ? t.vetRecords?.critical || "위험"
                              : tr.status === "abnormal"
                              ? t.vetRecords?.abnormal || "이상"
                              : t.vetRecords?.normal || "정상"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tr.result} {tr.normalRange && `(${t.vetRecords?.normalRange || "정상"}: ${tr.normalRange})`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost */}
              {showDetailModal.cost && (
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">{t.vetRecords?.cost || "비용"}</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {formatCurrency(showDetailModal.cost)}
                  </span>
                </div>
              )}

              {/* Next Visit */}
              {showDetailModal.nextVisitDate && (
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                  <span>📅</span>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {t.vetRecords?.nextVisit || "다음 방문"}
                    </p>
                    <p className="font-medium text-blue-800 dark:text-blue-300">
                      {formatDate(showDetailModal.nextVisitDate)}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {showDetailModal.notes && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.vetRecords?.notes || "메모"}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{showDetailModal.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleDeleteRecord(showDetailModal.id)}
                className="flex-1 rounded-xl border border-red-200 py-3 font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {t.common?.delete || "삭제"}
              </button>
              <button
                onClick={() => setShowDetailModal(null)}
                className="flex-1 rounded-xl bg-blue-500 py-3 font-medium text-white hover:bg-blue-600"
              >
                {t.common?.close || "닫기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
