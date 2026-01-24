import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, supabaseAdmin } from "@/lib/auth";
import { ApiErrors, getErrorMessage } from "@/lib/errors";

// GET: 구독 상태 조회
export async function GET(request: NextRequest) {
  try {
    // 서버 사이드 인증 검증 - URL 파라미터가 아닌 인증 헤더에서 사용자 확인
    const authHeader = request.headers.get('authorization');
    const { user } = await authenticateRequest(authHeader);

    // 인증되지 않은 사용자
    if (!user) {
      return NextResponse.json({
        subscription: null,
        isPremium: false,
        isPremiumPlus: false,
      });
    }

    const userId = user.id;
    const now = new Date().toISOString();

    const { data: subscriptionData, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .gte("current_period_end", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Subscription fetch error:", getErrorMessage(error));
      return ApiErrors.databaseError();
    }

    return NextResponse.json({
      subscription: subscriptionData || null,
      isPremium: !!subscriptionData,
      isPremiumPlus: subscriptionData?.plan_type === "premium_plus",
    });
  } catch (error) {
    console.error("Subscription API error:", getErrorMessage(error));
    return ApiErrors.serverError();
  }
}

// DELETE: 구독 해지
export async function DELETE(request: NextRequest) {
  try {
    // 서버 사이드 인증 검증 - URL 파라미터가 아닌 인증 헤더에서 사용자 확인
    const authHeader = request.headers.get('authorization');
    const { user } = await authenticateRequest(authHeader);

    // 인증되지 않은 사용자는 구독 해지 불가
    if (!user) {
      return ApiErrors.unauthorized();
    }

    const userId = user.id;

    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (fetchError || !subscription) {
      return ApiErrors.notFound("활성 구독");
    }

    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("Subscription cancel error:", getErrorMessage(updateError));
      return ApiErrors.databaseError();
    }

    return NextResponse.json({
      success: true,
      message: "구독이 해지되었습니다. 현재 결제 기간까지는 이용 가능합니다.",
    });
  } catch (error) {
    console.error("Subscription cancel API error:", getErrorMessage(error));
    return ApiErrors.serverError();
  }
}
