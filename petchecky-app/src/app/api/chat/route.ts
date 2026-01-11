import { NextRequest, NextResponse } from "next/server";
import { getUsage, incrementUsage } from "@/lib/supabase";
import { authenticateRequest, sanitizeUserInput, sanitizePetProfile } from "@/lib/auth";
import { LIMITS, API_CONFIG } from "@/lib/constants";
import { ApiErrors, getErrorMessage } from "@/lib/errors";
import { analyzeCombinedSeverity } from "@/lib/severity";

interface PetProfile {
  name: string;
  species: "dog" | "cat";
  breed: string;
  age: number;
  weight: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  petProfile: PetProfile;
  history: Message[];
  image?: {
    data: string; // Base64 encoded image
    mimeType: string; // image/jpeg, image/png, etc.
  };
}

const SYSTEM_PROMPT = `당신은 반려동물 건강 상담 AI 전문가 "펫체키"입니다.

역할:
- 반려동물 보호자가 증상을 설명하면 가능한 원인을 분석하고 대응 방법을 안내합니다.
- 친근하고 이해하기 쉬운 한국어로 설명합니다.
- 의학 용어는 쉽게 풀어서 설명합니다.

응답 규칙:
1. 먼저 증상에 대해 공감을 표현하세요
2. 가능한 원인 2-3가지를 설명하세요
3. 집에서 할 수 있는 조치를 안내하세요
4. 병원 방문이 필요한 경우 명확히 알려주세요
5. 마지막에 "※ 이 정보는 참고용이며, 정확한 진단은 수의사와 상담하세요."를 포함하세요

주의:
- 불필요하게 불안감을 조성하지 마세요
- 반려동물 정보(종류, 품종, 나이, 체중)를 고려하세요
- 절대 JSON 형식으로 응답하지 마세요. 일반 텍스트로만 응답하세요.`;

export async function POST(request: NextRequest) {
  try {
    // 서버 사이드 인증 검증 - 클라이언트에서 보낸 userId, isPremium을 신뢰하지 않음
    const authHeader = request.headers.get('authorization');
    const { user, subscription, error: authError } = await authenticateRequest(authHeader);

    if (authError) {
      console.warn('Auth warning:', authError);
    }

    const body = await request.json();
    const { message, petProfile: rawPetProfile, history, image }: ChatRequest = body;

    // 서버에서 검증한 인증 정보 사용
    const userId = user?.id;
    const isPremium = subscription.isPremium;
    const isPremiumPlus = subscription.isPremiumPlus;

    // 이미지 분석은 프리미엄+ 전용 (서버에서 검증된 구독 상태 사용)
    if (image && !isPremiumPlus) {
      return NextResponse.json(
        {
          message: "이미지 분석은 프리미엄+ 구독자 전용 기능입니다. 업그레이드하시면 반려동물 사진으로 증상을 분석받을 수 있어요!",
          severity: "low",
          requirePremiumPlus: true,
        },
        { status: 403 }
      );
    }

    // 로그인 사용자 사용량 체크 (서버에서 검증된 구독 상태 사용)
    if (userId && !isPremium) {
      const currentUsage = await getUsage(userId);
      if (currentUsage >= LIMITS.MONTHLY_FREE_MESSAGES) {
        return NextResponse.json(
          {
            message: `이번 달 무료 상담 횟수(${LIMITS.MONTHLY_FREE_MESSAGES}회)를 모두 사용했어요. 프리미엄 구독으로 업그레이드하시면 무제한으로 이용할 수 있어요!`,
            severity: "low",
            limitExceeded: true,
            usage: currentUsage,
            limit: LIMITS.MONTHLY_FREE_MESSAGES,
            showUpgrade: true
          },
          { status: 429 }
        );
      }
    }

    // 펫 프로필 정제 (프롬프트 인젝션 방어)
    const petProfile = sanitizePetProfile(rawPetProfile);

    // 입력 유효성 검사
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { message: "메시지를 입력해주세요.", severity: "low" },
        { status: 400 }
      );
    }

    if (message.length > LIMITS.MESSAGE_MAX_LENGTH) {
      return NextResponse.json(
        { message: `메시지가 너무 깁니다. ${LIMITS.MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.`, severity: "low" },
        { status: 400 }
      );
    }

    if (!petProfile || !petProfile.name || !petProfile.species) {
      return NextResponse.json(
        { message: "반려동물 정보가 필요합니다. 프로필을 먼저 등록해주세요.", severity: "low" },
        { status: 400 }
      );
    }

    // 사용자 메시지 정제 (프롬프트 인젝션 방어)
    const sanitizedMessage = sanitizeUserInput(message);

    // 히스토리 메시지 정제
    const sanitizedHistory = (history || []).slice(-4).map((msg) => ({
      role: msg.role,
      content: sanitizeUserInput(msg.content),
    }));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "서비스 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.", severity: "low" },
        { status: 500 }
      );
    }

    // 정제된 데이터로 컨텍스트 생성
    const petContext = `
반려동물 정보:
- 이름: ${petProfile.name}
- 종류: ${petProfile.species === "dog" ? "강아지" : "고양이"}
- 품종: ${petProfile.breed}
- 나이: ${petProfile.age}세
- 체중: ${petProfile.weight}kg`;

    const conversationHistory = sanitizedHistory
      .map((msg) => `${msg.role === "user" ? "보호자" : "펫체키"}: ${msg.content}`)
      .join("\n");

    // 이미지가 있는 경우 추가 안내
    const imagePrompt = image
      ? `\n\n[이미지 분석 요청]\n보호자가 반려동물의 사진을 첨부했습니다. 이미지에서 보이는 증상이나 상태를 분석하고, 보호자의 질문과 함께 종합적인 건강 상담을 제공해주세요.`
      : "";

    // 정제된 메시지 사용
    const fullPrompt = `${SYSTEM_PROMPT}${imagePrompt}

${petContext}

${conversationHistory ? `이전 대화:\n${conversationHistory}\n` : ""}
보호자: ${sanitizedMessage}

펫체키:`;

    // API 요청 본문 구성
    const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

    // 이미지가 있으면 먼저 추가
    if (image) {
      parts.push({
        inline_data: {
          mime_type: image.mimeType,
          data: image.data,
        },
      });
    }

    // 텍스트 프롬프트 추가
    parts.push({ text: fullPrompt });

    const response = await fetch(
      `${API_CONFIG.GEMINI_BASE_URL}/${API_CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts,
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API Error:", response.status, error);

      // Rate limit 처리
      if (response.status === 429) {
        return NextResponse.json(
          {
            message: "현재 많은 분들이 이용 중이에요. 잠시 후 다시 시도해주세요.",
            severity: "low"
          },
          { status: 429 }
        );
      }

      // API 키 오류
      if (response.status === 400 || response.status === 403) {
        return NextResponse.json(
          {
            message: "서비스 연결에 문제가 있어요. 잠시 후 다시 시도해주세요.",
            severity: "low"
          },
          { status: 500 }
        );
      }

      throw new Error("Gemini API 요청 실패");
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 응답 텍스트 정리
    const cleanMessage = rawText
      .replace(/^펫체키:\s*/i, "")
      .replace(/```[\s\S]*?```/g, "")
      .trim();

    // 위험도 자동 판단 (공통 유틸리티 사용)
    const severity = analyzeCombinedSeverity(message, cleanMessage);

    // 로그인 사용자 사용량 증가 (프리미엄 구독자는 카운트 제외)
    if (userId && !isPremium) {
      await incrementUsage(userId);
    }

    return NextResponse.json({
      message: cleanMessage || "증상에 대해 더 자세히 설명해주시겠어요?",
      severity,
    });
  } catch (error) {
    console.error("Chat API Error:", getErrorMessage(error));
    return NextResponse.json(
      {
        message: "죄송합니다. 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        severity: "low",
      },
      { status: 500 }
    );
  }
}
