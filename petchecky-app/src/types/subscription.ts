export type PlanType = "free" | "premium" | "premium_plus";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "payment_failed" | "expired";

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: "premium" | "premium_plus";
  price: number;
  billing_key: string;
  customer_key: string;
  card_company: string | null;
  card_number: string | null;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  vet_consultations_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  subscription_id: string | null;
  user_id: string;
  payment_key: string;
  order_id: string;
  amount: number;
  plan_type: string;
  status: string;
  card_company: string | null;
  card_number: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  monthlyPrice: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "무료",
    price: 0,
    monthlyPrice: "0원",
    features: [
      "월 20회 AI 상담",
      "상담 기록 저장",
      "위험도 분석",
    ],
  },
  {
    id: "premium",
    name: "프리미엄",
    price: 5900,
    monthlyPrice: "5,900원",
    features: [
      "무제한 AI 상담",
      "상담 기록 저장",
      "위험도 분석",
      "우선 응답",
    ],
    highlighted: true,
    badge: "인기",
  },
  {
    id: "premium_plus",
    name: "프리미엄+",
    price: 9900,
    monthlyPrice: "9,900원",
    features: [
      "무제한 AI 상담",
      "이미지 분석 기능",
      "수의사 상담 월 2회",
      "상담 기록 저장",
      "위험도 분석",
      "우선 응답",
    ],
    badge: "최고 혜택",
  },
];
