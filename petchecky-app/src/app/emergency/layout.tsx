import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { FAQJsonLd, HowToJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = generatePageMetadata("emergency");

// 응급 상황 FAQ 데이터
const emergencyFAQs = [
  {
    question: "반려동물이 숨을 못 쉴 때 어떻게 해야 하나요?",
    answer: "즉시 입안의 이물질을 확인하고 제거하세요. 작은 반려동물은 거꾸로 들어 등을 두드리고, 큰 반려동물은 하임리히법을 시도하세요. 동시에 가까운 동물병원에 연락하세요.",
  },
  {
    question: "반려동물이 독성 물질을 먹었을 때 응급 처치법은?",
    answer: "절대로 임의로 구토를 유발하지 마세요. 먹은 물질과 양을 확인하고 즉시 동물병원이나 동물 독극물 센터에 연락하세요. 가능하면 포장지나 성분표를 가지고 병원에 가세요.",
  },
  {
    question: "반려동물 열사병 증상과 대처법은?",
    answer: "과도한 헐떡임, 침 흘림, 무기력, 붉은 잇몸이 열사병 증상입니다. 시원한 곳으로 옮기고 미지근한 물로 몸을 식히세요. 절대 얼음물이나 아이스팩을 직접 대지 마세요.",
  },
  {
    question: "반려동물이 경련을 일으킬 때 어떻게 해야 하나요?",
    answer: "주변의 위험한 물건을 치우고 반려동물을 만지지 마세요. 경련 시간을 기록하고, 5분 이상 지속되면 즉시 동물병원으로 이동하세요.",
  },
];

export default function EmergencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FAQJsonLd faqs={emergencyFAQs} />
      <HowToJsonLd
        name="반려동물 응급 처치 가이드"
        description="반려동물 응급 상황 시 올바른 대처 방법을 안내합니다."
        steps={[
          { name: "침착하게 상황 파악", text: "반려동물의 상태와 증상을 빠르게 확인합니다." },
          { name: "안전한 장소로 이동", text: "반려동물을 안전한 곳으로 옮깁니다." },
          { name: "응급 처치 실시", text: "상황에 맞는 응급 처치를 시행합니다." },
          { name: "동물병원 연락", text: "가까운 동물병원에 연락하고 이동합니다." },
        ]}
        totalTime="PT5M"
      />
      {children}
    </>
  );
}
