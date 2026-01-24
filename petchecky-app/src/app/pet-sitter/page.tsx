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

interface PetSitter {
  id: string;
  name: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  experience: number;
  specialties: string[];
  pricePerDay: number;
  pricePerHour: number;
  distance: number;
  verified: boolean;
  description: string;
  availableServices: string[];
}

// Sample pet sitters data
const SAMPLE_SITTERS: PetSitter[] = [
  {
    id: "1",
    name: "김민지",
    profileImage: "",
    rating: 4.9,
    reviewCount: 127,
    experience: 5,
    specialties: ["dog", "cat"],
    pricePerDay: 35000,
    pricePerHour: 15000,
    distance: 0.8,
    verified: true,
    description: "반려동물 돌봄 전문가입니다. 수의테크니션 자격증 보유.",
    availableServices: ["daycare", "boarding", "walking", "grooming"],
  },
  {
    id: "2",
    name: "이준호",
    profileImage: "",
    rating: 4.7,
    reviewCount: 89,
    experience: 3,
    specialties: ["dog"],
    pricePerDay: 30000,
    pricePerHour: 12000,
    distance: 1.2,
    verified: true,
    description: "대형견 전문 펫시터. 강아지와 함께하는 시간을 즐깁니다.",
    availableServices: ["daycare", "boarding", "walking"],
  },
  {
    id: "3",
    name: "박서연",
    profileImage: "",
    rating: 5.0,
    reviewCount: 45,
    experience: 2,
    specialties: ["cat"],
    pricePerDay: 28000,
    pricePerHour: 10000,
    distance: 2.1,
    verified: false,
    description: "고양이 전문 펫시터입니다. 고양이 행동학 전공.",
    availableServices: ["daycare", "boarding"],
  },
  {
    id: "4",
    name: "최영수",
    profileImage: "",
    rating: 4.8,
    reviewCount: 203,
    experience: 7,
    specialties: ["dog", "cat"],
    pricePerDay: 40000,
    pricePerHour: 18000,
    distance: 3.5,
    verified: true,
    description: "7년 경력의 전문 펫시터. 응급상황 대처 가능.",
    availableServices: ["daycare", "boarding", "walking", "grooming", "training"],
  },
];

type ServiceType = "all" | "daycare" | "boarding" | "walking" | "grooming" | "training";
type PetType = "all" | "dog" | "cat";

export default function PetSitterPage() {
  const { t } = useLanguage();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [sitters] = useState<PetSitter[]>(SAMPLE_SITTERS);
  const [serviceFilter, setServiceFilter] = useState<ServiceType>("all");
  const [petFilter, setPetFilter] = useState<PetType>("all");
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "price">("distance");
  const [selectedSitter, setSelectedSitter] = useState<PetSitter | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);

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
  }, []);

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  const filteredSitters = sitters
    .filter((sitter) => {
      if (serviceFilter !== "all" && !sitter.availableServices.includes(serviceFilter)) {
        return false;
      }
      if (petFilter !== "all" && !sitter.specialties.includes(petFilter)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price") return a.pricePerDay - b.pricePerDay;
      return 0;
    });

  const handleContact = () => {
    if (!contactMessage.trim()) return;
    // In a real app, this would send a message via API
    setContactSent(true);
    setTimeout(() => {
      setShowContactForm(false);
      setContactSent(false);
      setContactMessage("");
      setSelectedSitter(null);
    }, 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            aria-label={t.common.back}
          >
            ←
          </Link>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {t.petSitter.title}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {/* Description */}
        <div className="mb-4 rounded-xl bg-gradient-to-r from-orange-100 to-yellow-100 p-4 dark:from-orange-900/30 dark:to-yellow-900/30">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            {t.petSitter.description}
          </p>
        </div>

        {/* Pet Selection */}
        {pets.length > 0 && (
          <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              {t.petSitter.selectPet}
            </label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              aria-label={t.petSitter.selectPet}
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.species === "dog" ? "🐕" : "🐈"} {pet.name} - {pet.breed}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Filters */}
        <section className="mb-4 space-y-3">
          {/* Service Filter */}
          <div className="flex flex-wrap gap-2">
            {(["all", "daycare", "boarding", "walking", "grooming", "training"] as ServiceType[]).map((service) => (
              <button
                key={service}
                onClick={() => setServiceFilter(service)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  serviceFilter === service
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                }`}
                aria-pressed={serviceFilter === service}
              >
                {t.petSitter.services[service]}
              </button>
            ))}
          </div>

          {/* Pet Type & Sort */}
          <div className="flex gap-2">
            <select
              value={petFilter}
              onChange={(e) => setPetFilter(e.target.value as PetType)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              aria-label={t.petSitter.petType}
            >
              <option value="all">{t.petSitter.allPets}</option>
              <option value="dog">🐕 {t.pet.dog}</option>
              <option value="cat">🐈 {t.pet.cat}</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "distance" | "rating" | "price")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              aria-label={t.petSitter.sortBy}
            >
              <option value="distance">{t.petSitter.sortByDistance}</option>
              <option value="rating">{t.petSitter.sortByRating}</option>
              <option value="price">{t.petSitter.sortByPrice}</option>
            </select>
          </div>
        </section>

        {/* Sitter List */}
        <section className="space-y-4">
          {filteredSitters.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <p className="text-gray-500 dark:text-gray-400">{t.petSitter.noSitters}</p>
            </div>
          ) : (
            filteredSitters.map((sitter) => (
              <article
                key={sitter.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex gap-4">
                  {/* Profile Image */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange-100 text-2xl dark:bg-orange-900/30">
                    {sitter.specialties.includes("dog") && sitter.specialties.includes("cat")
                      ? "🐾"
                      : sitter.specialties.includes("dog")
                      ? "🐕"
                      : "🐈"}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800 dark:text-gray-100">{sitter.name}</h3>
                      {sitter.verified && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {t.petSitter.verified}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-yellow-500">★</span>
                      <span>{sitter.rating}</span>
                      <span>({sitter.reviewCount})</span>
                      <span>·</span>
                      <span>{sitter.distance}km</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {sitter.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sitter.availableServices.map((service) => (
                        <span
                          key={service}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        >
                          {t.petSitter.services[service as ServiceType]}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          ₩{formatPrice(sitter.pricePerDay)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">/{t.petSitter.perDay}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSitter(sitter);
                          setShowContactForm(true);
                        }}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                      >
                        {t.petSitter.contact}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Safety Tips */}
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="font-semibold text-gray-800 mb-3 dark:text-gray-100">
            {t.petSitter.safetyTips}
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              {t.petSitter.tip1}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              {t.petSitter.tip2}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">✓</span>
              {t.petSitter.tip3}
            </li>
          </ul>
        </section>

        {/* Disclaimer */}
        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          {t.petSitter.disclaimer}
        </p>
      </main>

      {/* Contact Modal */}
      {showContactForm && selectedSitter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800" role="dialog" aria-modal="true">
            {contactSent ? (
              <div className="text-center">
                <div className="text-5xl mb-4">✉️</div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {t.petSitter.messageSent}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t.petSitter.messageDesc}
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                  {t.petSitter.contactTitle} - {selectedSitter.name}
                </h3>

                {selectedPet && (
                  <div className="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedPet.species === "dog" ? "🐕" : "🐈"} {selectedPet.name} ({selectedPet.breed}, {selectedPet.age}{t.pet.years})
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    {t.petSitter.messageLabel}
                  </label>
                  <textarea
                    id="contact-message"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder={t.petSitter.messagePlaceholder}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowContactForm(false);
                      setSelectedSitter(null);
                      setContactMessage("");
                    }}
                    className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    onClick={handleContact}
                    disabled={!contactMessage.trim()}
                    className="flex-1 rounded-lg bg-orange-500 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {t.common.send}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
