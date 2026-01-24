"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface PetProfile {
  id: string;
  name: string;
  species: "dog" | "cat";
  breed: string;
  age: number;
  weight: number;
}

interface InsuranceProduct {
  id: string;
  name: string;
  company: string;
  monthlyPremium: number;
  coveragePercent: number;
  maxCoverage: number;
  deductible: number;
  features: string[];
  excludedConditions: string[];
  targetSpecies: "dog" | "cat" | "all";
  maxAge: number;
}

interface InsuranceClaim {
  id: string;
  petId: string;
  date: string;
  hospitalName: string;
  treatmentType: string;
  totalAmount: number;
  claimedAmount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  notes?: string;
}

// Sample insurance products
const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    id: "1",
    name: "펫케어 베이직",
    company: "펫라이프 보험",
    monthlyPremium: 15000,
    coveragePercent: 50,
    maxCoverage: 1000000,
    deductible: 30000,
    features: ["입원/수술 보장", "질병 치료비", "사고 치료비"],
    excludedConditions: ["선천성 질환", "예방접종", "미용/목욕"],
    targetSpecies: "all",
    maxAge: 10,
  },
  {
    id: "2",
    name: "펫케어 스탠다드",
    company: "펫라이프 보험",
    monthlyPremium: 25000,
    coveragePercent: 70,
    maxCoverage: 3000000,
    deductible: 20000,
    features: ["입원/수술 보장", "질병 치료비", "사고 치료비", "통원 치료", "약제비"],
    excludedConditions: ["선천성 질환", "예방접종", "미용/목욕"],
    targetSpecies: "all",
    maxAge: 12,
  },
  {
    id: "3",
    name: "펫케어 프리미엄",
    company: "펫라이프 보험",
    monthlyPremium: 45000,
    coveragePercent: 90,
    maxCoverage: 5000000,
    deductible: 10000,
    features: ["입원/수술 보장", "질병 치료비", "사고 치료비", "통원 치료", "약제비", "MRI/CT", "물리치료"],
    excludedConditions: ["미용/목욕"],
    targetSpecies: "all",
    maxAge: 15,
  },
  {
    id: "4",
    name: "강아지 전용 플랜",
    company: "도그케어 보험",
    monthlyPremium: 30000,
    coveragePercent: 80,
    maxCoverage: 4000000,
    deductible: 15000,
    features: ["입원/수술 보장", "슬개골탈구", "고관절이형성증", "피부질환", "치과치료"],
    excludedConditions: ["선천성 질환", "예방접종"],
    targetSpecies: "dog",
    maxAge: 12,
  },
  {
    id: "5",
    name: "고양이 전용 플랜",
    company: "캣케어 보험",
    monthlyPremium: 28000,
    coveragePercent: 80,
    maxCoverage: 4000000,
    deductible: 15000,
    features: ["입원/수술 보장", "비뇨기질환", "신장질환", "구내염", "치과치료"],
    excludedConditions: ["선천성 질환", "예방접종"],
    targetSpecies: "cat",
    maxAge: 15,
  },
];

export default function InsurancePage() {
  const { t } = useLanguage();
  const [_pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "claims" | "info">("products");
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [enrolledProducts, setEnrolledProducts] = useState<string[]>([]);

  useEffect(() => {
    // Load pet profile
    const savedProfile = localStorage.getItem("petProfile");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      const petWithId = { ...profile, id: profile.id || "pet-1" };
      setPets([petWithId]);
      setSelectedPet(petWithId);
    }

    // Load enrolled products
    const savedEnrolled = localStorage.getItem("petchecky_enrolled_insurance");
    if (savedEnrolled) {
      setEnrolledProducts(JSON.parse(savedEnrolled));
    }
  }, []);

  useEffect(() => {
    if (selectedPet) {
      // Load claims for selected pet
      const savedClaims = localStorage.getItem(`petchecky_insurance_claims_${selectedPet.id}`);
      if (savedClaims) {
        setClaims(JSON.parse(savedClaims));
      } else {
        setClaims([]);
      }
    }
  }, [selectedPet]);

  const handleEnroll = (productId: string) => {
    const newEnrolled = [...enrolledProducts, productId];
    setEnrolledProducts(newEnrolled);
    localStorage.setItem("petchecky_enrolled_insurance", JSON.stringify(newEnrolled));
    alert(t.insurance.enrollSuccess);
  };

  const handleSaveClaim = (claim: Omit<InsuranceClaim, "id" | "petId" | "status">) => {
    if (!selectedPet) return;

    const newClaim: InsuranceClaim = {
      ...claim,
      id: Date.now().toString(),
      petId: selectedPet.id,
      status: "pending",
    };

    const updatedClaims = [...claims, newClaim];
    setClaims(updatedClaims);
    localStorage.setItem(`petchecky_insurance_claims_${selectedPet.id}`, JSON.stringify(updatedClaims));
    setShowClaimModal(false);
  };

  const getFilteredProducts = () => {
    if (!selectedPet) return INSURANCE_PRODUCTS;
    return INSURANCE_PRODUCTS.filter(
      (p) =>
        (p.targetSpecies === "all" || p.targetSpecies === selectedPet.species) &&
        selectedPet.age <= p.maxAge
    );
  };

  const getStatusBadge = (status: InsuranceClaim["status"]) => {
    const badges = {
      pending: { text: t.insurance.statusPending, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
      approved: { text: t.insurance.statusApproved, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      rejected: { text: t.insurance.statusRejected, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
      paid: { text: t.insurance.statusPaid, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    };
    return badges[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount) + "원";
  };

  if (!selectedPet) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              ←
            </Link>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t.insurance.title}</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <p className="text-gray-500 mb-4 dark:text-gray-400">{t.pet.selectPet}</p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
            >
              {t.landing.registerPet}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            ←
          </Link>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t.insurance.title}</h1>
        </div>
      </header>

      {/* Pet Info */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedPet.species === "dog" ? "🐕" : "🐈"}</span>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">{selectedPet.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedPet.breed} · {selectedPet.age}{t.pet.years}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex">
          {(["products", "claims", "info"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab === "products" && t.insurance.products}
              {tab === "claims" && t.insurance.claims}
              {tab === "info" && t.insurance.info}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4">
        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t.insurance.productsDesc}
            </p>

            {getFilteredProducts().map((product) => {
              const isEnrolled = enrolledProducts.includes(product.id);
              return (
                <div
                  key={product.id}
                  className={`rounded-xl border p-4 ${
                    isEnrolled
                      ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100">{product.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.company}</p>
                    </div>
                    {isEnrolled && (
                      <span className="rounded-full bg-green-500 px-3 py-1 text-xs text-white">
                        {t.insurance.enrolled}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
                      <p className="text-gray-500 dark:text-gray-400">{t.insurance.monthlyPremium}</p>
                      <p className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(product.monthlyPremium)}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
                      <p className="text-gray-500 dark:text-gray-400">{t.insurance.coveragePercent}</p>
                      <p className="font-bold text-green-600 dark:text-green-400">{product.coveragePercent}%</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
                      <p className="text-gray-500 dark:text-gray-400">{t.insurance.maxCoverage}</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(product.maxCoverage)}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
                      <p className="text-gray-500 dark:text-gray-400">{t.insurance.deductible}</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(product.deductible)}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t.insurance.features}</p>
                    <div className="flex flex-wrap gap-1">
                      {product.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">{t.insurance.excluded}</p>
                    <div className="flex flex-wrap gap-1">
                      {product.excludedConditions.map((condition, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>

                  {!isEnrolled && (
                    <button
                      onClick={() => handleEnroll(product.id)}
                      className="w-full rounded-lg bg-blue-500 py-2 text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                      {t.insurance.enroll}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === "claims" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.insurance.claimsDesc}</p>
              <button
                onClick={() => setShowClaimModal(true)}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
              >
                + {t.insurance.newClaim}
              </button>
            </div>

            {claims.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📄</div>
                <p className="text-gray-500 dark:text-gray-400">{t.insurance.noClaims}</p>
              </div>
            ) : (
              claims.map((claim) => {
                const badge = getStatusBadge(claim.status);
                return (
                  <div
                    key={claim.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{claim.hospitalName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{claim.treatmentType}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">{t.insurance.treatmentDate}</span>
                      <span className="text-gray-800 dark:text-gray-200">{claim.date}</span>
                    </div>

                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">{t.insurance.totalAmount}</span>
                      <span className="text-gray-800 dark:text-gray-200">{formatCurrency(claim.totalAmount)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t.insurance.claimedAmount}</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(claim.claimedAmount)}</span>
                    </div>

                    {claim.notes && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {t.vaccination.notes}: {claim.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="space-y-4">
            {/* How Insurance Works */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-bold text-gray-800 mb-3 dark:text-gray-100">💡 {t.insurance.howItWorks}</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold dark:bg-blue-900/30 dark:text-blue-400">1</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.insurance.step1}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold dark:bg-blue-900/30 dark:text-blue-400">2</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.insurance.step2}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold dark:bg-blue-900/30 dark:text-blue-400">3</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.insurance.step3}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold dark:bg-blue-900/30 dark:text-blue-400">4</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.insurance.step4}</p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-bold text-gray-800 mb-3 dark:text-gray-100">❓ {t.insurance.faq}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.insurance.faq1Q}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.insurance.faq1A}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.insurance.faq2Q}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.insurance.faq2A}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t.insurance.faq3Q}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.insurance.faq3A}</p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-700">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                ⚠️ {t.insurance.disclaimer}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Claim Modal */}
      {showClaimModal && selectedPet && (
        <ClaimModal
          petName={selectedPet.name}
          onSave={handleSaveClaim}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </div>
  );
}

// Claim Modal Component
function ClaimModal({
  petName,
  onSave,
  onClose,
}: {
  petName: string;
  onSave: (claim: Omit<InsuranceClaim, "id" | "petId" | "status">) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [hospitalName, setHospitalName] = useState("");
  const [treatmentType, setTreatmentType] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [claimedAmount, setClaimedAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalName.trim() || !treatmentType.trim() || !totalAmount || !claimedAmount) return;

    onSave({
      date,
      hospitalName: hospitalName.trim(),
      treatmentType: treatmentType.trim(),
      totalAmount: parseInt(totalAmount),
      claimedAmount: parseInt(claimedAmount),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-gray-100">
          {t.insurance.newClaim}
        </h2>
        <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
          {petName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              {t.insurance.treatmentDate}
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
              {t.insurance.hospitalName}
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder={t.insurance.hospitalNamePlaceholder}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              {t.insurance.treatmentType}
            </label>
            <input
              type="text"
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
              placeholder={t.insurance.treatmentTypePlaceholder}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              {t.insurance.totalAmount}
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="150000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              {t.insurance.claimedAmount}
            </label>
            <input
              type="number"
              value={claimedAmount}
              onChange={(e) => setClaimedAmount(e.target.value)}
              placeholder="100000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              {t.vaccination.notes} ({t.common.cancel})
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

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
              {t.common.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
