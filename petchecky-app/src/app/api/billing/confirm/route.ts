import { NextRequest, NextResponse } from "next/server";
import { issueBillingKey, chargeBilling, getOrderName } from "@/lib/toss";
import { authenticateRequest, supabaseAdmin } from "@/lib/auth";
import { ApiErrors, getErrorMessage } from "@/lib/errors";

interface ConfirmRequest {
  authKey: string;
  customerKey: string;
  planType: "premium" | "premium_plus";
}

export async function POST(request: NextRequest) {
  try {
    // 서버 사이드 인증 검증 - 클라이언트에서 보낸 userId를 신뢰하지 않음
    const authHeader = request.headers.get('authorization');
    const { user } = await authenticateRequest(authHeader);

    // 인증되지 않은 사용자는 결제 불가
    if (!user) {
      return ApiErrors.unauthorized();
    }

    const userId = user.id; // 서버에서 검증된 사용자 ID 사용

    const body: ConfirmRequest = await request.json();
    const { authKey, customerKey, planType } = body;

    // 입력 검증
    if (!authKey || !customerKey || !planType) {
      return ApiErrors.invalidInput("ko", "필수 파라미터가 누락되었습니다.");
    }

    if (!["premium", "premium_plus"].includes(planType)) {
      return ApiErrors.invalidInput("ko", "유효하지 않은 플랜입니다.");
    }

    // 1. 기존 활성 구독 확인
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (existingSub) {
      return ApiErrors.invalidInput("ko", "이미 활성화된 구독이 있습니다.");
    }

    // 2. 빌링키 발급
    let billingData;
    try {
      billingData = await issueBillingKey(authKey, customerKey);
    } catch (error) {
      console.error("Billing key issue error:", getErrorMessage(error));
      return ApiErrors.invalidInput("ko", error instanceof Error ? error.message : "빌링키 발급에 실패했습니다.");
    }

    // 3. 첫 결제 실행
    const price = planType === "premium" ? 5900 : 9900;
    const orderId = `SUB_${userId.slice(0, 8)}_${Date.now()}`;
    const orderName = getOrderName(planType);

    let paymentData;
    try {
      paymentData = await chargeBilling(
        billingData.billingKey,
        customerKey,
        price,
        orderId,
        orderName
      );
    } catch (error) {
      console.error("Payment charge error:", getErrorMessage(error));
      return ApiErrors.invalidInput("ko", error instanceof Error ? error.message : "결제에 실패했습니다.");
    }

    // 4. 구독 정보 DB 저장
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_type: planType,
        price,
        billing_key: billingData.billingKey,
        customer_key: customerKey,
        card_company: billingData.card?.company || null,
        card_number: billingData.card?.number || null,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        vet_consultations_remaining: planType === "premium_plus" ? 2 : 0,
      })
      .select()
      .single();

    if (subError) {
      console.error("Subscription insert error:", getErrorMessage(subError));
      // 결제는 되었지만 DB 저장 실패 - 수동 처리 필요
      return ApiErrors.databaseError("ko", { paymentKey: paymentData.paymentKey });
    }

    // 5. 결제 내역 저장
    const { error: paymentError } = await supabaseAdmin.from("payments").insert({
      subscription_id: subscription.id,
      user_id: userId,
      payment_key: paymentData.paymentKey,
      order_id: orderId,
      amount: price,
      plan_type: planType,
      status: "done",
      card_company: paymentData.card?.company || null,
      card_number: paymentData.card?.number || null,
      approved_at: paymentData.approvedAt,
    });

    if (paymentError) {
      console.error("Payment record insert error:", paymentError);
      // 결제 내역 저장 실패는 치명적이지 않음
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan_type: subscription.plan_type,
        current_period_end: subscription.current_period_end,
      },
      message: "구독이 시작되었습니다!",
    });
  } catch (error) {
    console.error("Billing confirm error:", getErrorMessage(error));
    return ApiErrors.serverError();
  }
}
