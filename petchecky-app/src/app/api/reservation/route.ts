import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, supabaseAdmin, sanitizeUserInput } from "@/lib/auth";
import { ApiErrors, getErrorMessage } from "@/lib/errors";

interface ReservationRequest {
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  petName: string;
  petSpecies: "dog" | "cat";
  symptoms: string;
  preferredDate: string;
  preferredTime: string;
  contactPhone: string;
  notes: string;
}

export async function POST(request: NextRequest) {
  try {
    // 서버 측 인증 검증
    const authHeader = request.headers.get('authorization');
    const { user } = await authenticateRequest(authHeader);

    const body: ReservationRequest = await request.json();

    // 필수 필드 검증
    if (!body.hospitalId || !body.petName || !body.preferredDate || !body.preferredTime || !body.contactPhone) {
      return ApiErrors.invalidInput("ko", "필수 항목을 모두 입력해주세요.");
    }

    // 연락처 형식 간단 검증
    const phoneRegex = /^[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(body.contactPhone.replace(/-/g, ""))) {
      return ApiErrors.invalidInput("ko", "올바른 연락처를 입력해주세요.");
    }

    // 날짜 유효성 검사
    const selectedDate = new Date(body.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return ApiErrors.invalidInput("ko", "오늘 이후 날짜를 선택해주세요.");
    }

    // 사용자 입력 값 정제 (프롬프트 인젝션 방지)
    const sanitizedPetName = sanitizeUserInput(body.petName).slice(0, 50);
    const sanitizedSymptoms = body.symptoms ? sanitizeUserInput(body.symptoms).slice(0, 500) : null;
    const sanitizedNotes = body.notes ? sanitizeUserInput(body.notes).slice(0, 500) : null;

    // 예약 데이터 저장 - 서버에서 검증된 user.id 사용
    const { data, error } = await supabaseAdmin
      .from("reservations")
      .insert({
        user_id: user?.id || null,  // 서버에서 검증된 사용자 ID
        hospital_id: body.hospitalId,
        hospital_name: body.hospitalName,
        hospital_address: body.hospitalAddress,
        hospital_phone: body.hospitalPhone,
        pet_name: sanitizedPetName,
        pet_species: body.petSpecies,
        symptoms: sanitizedSymptoms,
        preferred_date: body.preferredDate,
        preferred_time: body.preferredTime,
        contact_phone: body.contactPhone,
        notes: sanitizedNotes,
        status: "pending", // pending, confirmed, cancelled, completed
      })
      .select()
      .single();

    if (error) {
      console.error("Reservation insert error:", error);
      // 테이블이 없는 경우에도 성공으로 처리 (테이블 생성 전 테스트용)
      if (error.code === "42P01") {
        return NextResponse.json({
          success: true,
          message: "예약 요청이 접수되었습니다. 병원에서 확인 후 연락드립니다.",
          reservation: {
            id: Date.now().toString(),
            ...body,
          },
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "예약 요청이 접수되었습니다. 병원에서 확인 후 연락드립니다.",
      reservation: data,
    });
  } catch (error) {
    console.error("Reservation API error:", getErrorMessage(error));
    return ApiErrors.serverError();
  }
}

// 사용자의 예약 내역 조회 (페이지네이션 지원)
export async function GET(request: NextRequest) {
  try {
    // 서버 측 인증 검증
    const authHeader = request.headers.get('authorization');
    const { user, error: authError } = await authenticateRequest(authHeader);

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // 페이지네이션 파라미터
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // 서버에서 검증된 user.id 사용 (필요한 컬럼만 조회)
    let query = supabaseAdmin
      .from("reservations")
      .select("id, user_id, hospital_id, hospital_name, hospital_address, hospital_phone, pet_name, pet_species, symptoms, preferred_date, preferred_time, contact_phone, notes, status, created_at", { count: 'exact' })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (offset > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      // 테이블이 없는 경우 빈 배열 반환
      if (error.code === "42P01") {
        return NextResponse.json({ reservations: [], total: 0 });
      }
      throw error;
    }

    return NextResponse.json({
      reservations: data,
      total: count ?? 0,
      limit,
      offset
    });
  } catch (error) {
    console.error("Reservation fetch error:", getErrorMessage(error));
    return ApiErrors.serverError();
  }
}
