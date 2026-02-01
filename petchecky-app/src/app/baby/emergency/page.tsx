"use client";

import Link from "next/link";

const EMERGENCY_CONTACTS = [
  { name: "응급의료정보센터", number: "1339", desc: "24시간 응급의료 상담", icon: "🚑" },
  { name: "소아과 야간진료", number: "1577-0099", desc: "야간 소아과 안내", icon: "🏥" },
  { name: "중독정보센터", number: "1588-7808", desc: "독극물/약물 중독 상담", icon: "☠️" },
  { name: "아동학대신고", number: "112", desc: "아동학대 신고 및 상담", icon: "🛡️" },
  { name: "정신건강위기상담", number: "1577-0199", desc: "24시간 정신건강 상담", icon: "💚" },
  { name: "육아종합지원센터", number: "1566-3232", desc: "육아 상담 및 지원", icon: "👶" },
];

const EMERGENCY_SYMPTOMS = [
  { symptom: "열성 경련", desc: "경련 중 안전한 곳에 눕히고, 옷을 느슨하게. 경련이 5분 이상 지속되면 119 호출.", color: "bg-red-50 dark:bg-red-900/20", textColor: "text-red-700 dark:text-red-300" },
  { symptom: "고열 (39°C 이상)", desc: "해열제 투여, 미지근한 물로 닦기. 3개월 미만 영아는 즉시 응급실.", color: "bg-orange-50 dark:bg-orange-900/20", textColor: "text-orange-700 dark:text-orange-300" },
  { symptom: "구토/설사 탈수", desc: "소량씩 자주 수분 보충. 6시간 이상 소변이 없으면 응급실.", color: "bg-yellow-50 dark:bg-yellow-900/20", textColor: "text-yellow-700 dark:text-yellow-300" },
  { symptom: "호흡곤란", desc: "갈비뼈 사이가 들어가거나 입술이 파래지면 즉시 119 호출.", color: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-700 dark:text-blue-300" },
  { symptom: "이물질 삼킴", desc: "무리하게 빼내지 말 것. 기도 폐쇄 시 영아 하임리히법 시행 후 119.", color: "bg-purple-50 dark:bg-purple-900/20", textColor: "text-purple-700 dark:text-purple-300" },
  { symptom: "머리 부딪힘", desc: "의식 확인, 구토/졸림/동공 크기 변화 시 응급실. 48시간 관찰.", color: "bg-pink-50 dark:bg-pink-900/20", textColor: "text-pink-700 dark:text-pink-300" },
];

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/baby" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-bold text-gray-800 dark:text-gray-100">🚨 소아과 응급</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-4 space-y-6">
        {/* Emergency contacts */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">긴급 연락처</h2>
          <div className="grid grid-cols-2 gap-3">
            {EMERGENCY_CONTACTS.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm transition-transform hover:scale-[1.02] dark:bg-gray-800"
              >
                <span className="text-2xl">{contact.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{contact.name}</span>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{contact.number}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{contact.desc}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Emergency symptoms guide */}
        <div>
          <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-gray-100">응급 증상 대처법</h2>
          <div className="space-y-3">
            {EMERGENCY_SYMPTOMS.map((item) => (
              <div key={item.symptom} className={`rounded-xl ${item.color} p-4`}>
                <h3 className={`font-bold ${item.textColor}`}>{item.symptom}</h3>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            ※ 위 정보는 참고용입니다. 응급 상황에서는 즉시 119에 전화하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
