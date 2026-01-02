// 토스페이먼츠 API 유틸리티

const TOSS_API_URL = "https://api.tosspayments.com/v1";

// Basic 인증 헤더 생성
export function getAuthHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error("TOSS_SECRET_KEY is not configured");
  }
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

// 빌링키 발급 (authKey -> billingKey)
export async function issueBillingKey(authKey: string, customerKey: string) {
  const response = await fetch(`${TOSS_API_URL}/billing/authorizations/issue`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ authKey, customerKey }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "빌링키 발급 실패");
  }

  return data;
}

// 빌링키로 결제 실행
export async function chargeBilling(
  billingKey: string,
  customerKey: string,
  amount: number,
  orderId: string,
  orderName: string
) {
  const response = await fetch(`${TOSS_API_URL}/billing/${billingKey}`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerKey,
      amount,
      orderId,
      orderName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "결제 실패");
  }

  return data;
}

// 결제 취소
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number
) {
  const body: Record<string, unknown> = { cancelReason };
  if (cancelAmount) {
    body.cancelAmount = cancelAmount;
  }

  const response = await fetch(`${TOSS_API_URL}/payments/${paymentKey}/cancel`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "결제 취소 실패");
  }

  return data;
}

// 플랜 이름 생성
export function getPlanDisplayName(planType: "premium" | "premium_plus"): string {
  return planType === "premium" ? "프리미엄" : "프리미엄+";
}

// 주문명 생성
export function getOrderName(planType: "premium" | "premium_plus"): string {
  return `펫체키 ${getPlanDisplayName(planType)} 구독`;
}
