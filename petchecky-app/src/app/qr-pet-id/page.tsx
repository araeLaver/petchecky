"use client";

import { useState, useEffect, useRef } from "react";
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

export default function QrPetIdPage() {
  const { t } = useLanguage();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [emergencyNote, setEmergencyNote] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

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

    // Load saved owner info
    const savedOwner = localStorage.getItem("petchecky_owner_info");
    if (savedOwner) {
      const owner = JSON.parse(savedOwner);
      setOwnerName(owner.name || "");
      setOwnerPhone(owner.phone || "");
    }
  }, []);

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  const generateQrData = () => {
    if (!selectedPet || !ownerName || !ownerPhone) return null;

    const data = {
      pet: {
        name: selectedPet.name,
        species: selectedPet.species === "dog" ? "강아지" : "고양이",
        breed: selectedPet.breed,
        age: selectedPet.age,
      },
      owner: {
        name: ownerName,
        phone: ownerPhone,
      },
      note: emergencyNote || undefined,
      app: "PetChecky",
    };

    return JSON.stringify(data);
  };

  const handleGenerate = () => {
    if (!selectedPet || !ownerName || !ownerPhone) return;

    // Save owner info
    localStorage.setItem("petchecky_owner_info", JSON.stringify({
      name: ownerName,
      phone: ownerPhone,
    }));

    setQrGenerated(true);
  };

  const qrData = generateQrData();
  const qrUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
    : null;

  const handleDownload = async () => {
    if (!qrUrl) return;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `petchecky-qr-${selectedPet?.name || "pet"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(qrUrl, "_blank");
    }
  };

  const handlePrint = () => {
    if (!qrRef.current) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>PetChecky QR - ${selectedPet?.name}</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 20px; }
              .qr-card { border: 2px solid #000; padding: 20px; display: inline-block; }
              img { width: 200px; height: 200px; }
              h2 { margin: 10px 0 5px; }
              p { margin: 5px 0; color: #666; }
            </style>
          </head>
          <body>
            <div class="qr-card">
              <img src="${qrUrl}" alt="QR Code" />
              <h2>${selectedPet?.name}</h2>
              <p>${selectedPet?.species === "dog" ? "🐕" : "🐈"} ${selectedPet?.breed}</p>
              <p>스캔하여 보호자에게 연락하세요</p>
              <p style="font-size: 12px; color: #999;">PetChecky</p>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const isValid = selectedPet && ownerName.trim() && ownerPhone.trim();

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
            {t.qrPetId.title}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        {pets.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="text-5xl mb-4">🐾</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t.pet.addPet}
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
            >
              {t.pet.register}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pet Selection */}
            <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="font-semibold text-gray-800 mb-3 dark:text-gray-100">
                {t.qrPetId.petInfo}
              </h2>
              <select
                value={selectedPetId}
                onChange={(e) => {
                  setSelectedPetId(e.target.value);
                  setQrGenerated(false);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.species === "dog" ? "🐕" : "🐈"} {pet.name} - {pet.breed}
                  </option>
                ))}
              </select>
            </section>

            {/* Owner Info */}
            <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="font-semibold text-gray-800 mb-3 dark:text-gray-100">
                {t.qrPetId.ownerInfo}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">
                    {t.qrPetId.ownerName} *
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => {
                      setOwnerName(e.target.value);
                      setQrGenerated(false);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">
                    {t.qrPetId.ownerPhone} *
                  </label>
                  <input
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => {
                      setOwnerPhone(e.target.value);
                      setQrGenerated(false);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="010-1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1 dark:text-gray-400">
                    {t.qrPetId.emergencyNote}
                  </label>
                  <textarea
                    value={emergencyNote}
                    onChange={(e) => {
                      setEmergencyNote(e.target.value);
                      setQrGenerated(false);
                    }}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="예: 심장병 약 복용 중, 낯선 사람 경계"
                  />
                </div>
              </div>
            </section>

            {/* Generate Button */}
            {!qrGenerated && (
              <button
                onClick={handleGenerate}
                disabled={!isValid}
                className="w-full rounded-xl bg-blue-500 py-4 font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.qrPetId.generate}
              </button>
            )}

            {/* QR Code Preview */}
            {qrGenerated && qrUrl && (
              <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
                <h2 className="font-semibold text-blue-800 mb-4 text-center dark:text-blue-200">
                  {t.qrPetId.preview}
                </h2>
                <div ref={qrRef} className="flex flex-col items-center">
                  <div className="rounded-xl bg-white p-4 shadow-lg">
                    <img
                      src={qrUrl}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                    <div className="mt-3 text-center">
                      <p className="font-bold text-gray-800">
                        {selectedPet?.species === "dog" ? "🐕" : "🐈"} {selectedPet?.name}
                      </p>
                      <p className="text-sm text-gray-500">{selectedPet?.breed}</p>
                      <p className="text-xs text-gray-400 mt-1">PetChecky</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleDownload}
                    className="flex-1 rounded-lg bg-green-500 py-3 font-medium text-white hover:bg-green-600"
                  >
                    📥 {t.qrPetId.download}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 rounded-lg bg-purple-500 py-3 font-medium text-white hover:bg-purple-600"
                  >
                    🖨️ {t.qrPetId.print}
                  </button>
                </div>
              </section>
            )}

            {/* How to Use */}
            <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="font-semibold text-gray-800 mb-3 dark:text-gray-100">
                {t.qrPetId.howToUse}
              </h2>
              <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">1</span>
                  {t.qrPetId.step1}
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">2</span>
                  {t.qrPetId.step2}
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">3</span>
                  {t.qrPetId.step3}
                </li>
              </ol>
            </section>

            {/* Disclaimer */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              🔒 {t.qrPetId.disclaimer}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
