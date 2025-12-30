"use client";

interface QuickSymptomsProps {
  onSelect: (symptom: string) => void;
  disabled?: boolean;
}

const SYMPTOMS = [
  { emoji: "🤮", label: "구토", query: "구토를 해요" },
  { emoji: "💩", label: "설사", query: "설사를 해요" },
  { emoji: "😫", label: "식욕부진", query: "밥을 안 먹어요" },
  { emoji: "💧", label: "음수량 변화", query: "물을 많이/적게 마셔요" },
  { emoji: "🤒", label: "발열", query: "열이 나는 것 같아요" },
  { emoji: "🦵", label: "절뚝거림", query: "다리를 절뚝거려요" },
  { emoji: "😴", label: "무기력", query: "기운이 없어요" },
  { emoji: "🤧", label: "기침/재채기", query: "기침이나 재채기를 해요" },
  { emoji: "👁️", label: "눈 이상", query: "눈에 이상이 있어요" },
  { emoji: "👂", label: "귀 이상", query: "귀를 자주 긁어요" },
  { emoji: "🩸", label: "피부/털", query: "피부에 이상이 있어요" },
  { emoji: "😰", label: "호흡 이상", query: "숨쉬기 힘들어해요" },
];

export default function QuickSymptoms({ onSelect, disabled }: QuickSymptomsProps) {
  return (
    <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
      <p className="mb-2 text-xs font-medium text-gray-500">빠른 증상 선택</p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {SYMPTOMS.map((symptom) => (
          <button
            key={symptom.label}
            onClick={() => onSelect(symptom.query)}
            disabled={disabled}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm transition-all hover:shadow-md hover:bg-blue-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{symptom.emoji}</span>
            <span className="text-gray-700">{symptom.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
