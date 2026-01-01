import { NextRequest, NextResponse } from "next/server";
import { getUsage, incrementUsage, MONTHLY_FREE_LIMIT } from "@/lib/supabase";

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
  userId?: string; // 로그인 사용자 ID
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

// 위험도 자동 판단 함수
function analyzeSeverity(message: string, response: string): "low" | "medium" | "high" {
  const combined = (message + " " + response).toLowerCase();

  // 고위험 키워드
  const highRisk = [
    "응급", "즉시 병원", "바로 병원", "빨리 병원", "위험",
    "호흡곤란", "의식", "경련", "발작", "출혈", "중독",
    "먹지 못", "물을 못", "탈수", "쇼크", "마비"
  ];

  // 중위험 키워드
  const mediumRisk = [
    "병원 방문", "수의사 상담", "진료", "검사",
    "지속", "악화", "열", "구토", "설사", "기침",
    "절뚝", "통증", "붓기", "염증"
  ];

  if (highRisk.some(keyword => combined.includes(keyword))) {
    return "high";
  }

  if (mediumRisk.some(keyword => combined.includes(keyword))) {
    return "medium";
  }

  return "low";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, petProfile, history, userId }: ChatRequest = body;

    // 로그인 사용자 사용량 체크
    if (userId) {
      const currentUsage = await getUsage(userId);
      if (currentUsage >= MONTHLY_FREE_LIMIT) {
        return NextResponse.json(
          {
            message: `이번 달 무료 상담 횟수(${MONTHLY_FREE_LIMIT}회)를 모두 사용했어요. 다음 달 1일에 초기화됩니다.`,
            severity: "low",
            limitExceeded: true,
            usage: currentUsage,
            limit: MONTHLY_FREE_LIMIT
          },
          { status: 429 }
        );
      }
    }

    // 입력 유효성 검사
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { message: "메시지를 입력해주세요.", severity: "low" },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { message: "메시지가 너무 깁니다. 1000자 이내로 입력해주세요.", severity: "low" },
        { status: 400 }
      );
    }

    if (!petProfile || !petProfile.name || !petProfile.species) {
      return NextResponse.json(
        { message: "반려동물 정보가 필요합니다. 프로필을 먼저 등록해주세요.", severity: "low" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "서비스 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.", severity: "low" },
        { status: 500 }
      );
    }

    const petContext = `
반려동물 정보:
- 이름: ${petProfile.name}
- 종류: ${petProfile.species === "dog" ? "강아지" : "고양이"}
- 품종: ${petProfile.breed}
- 나이: ${petProfile.age}세
- 체중: ${petProfile.weight}kg`;

    const conversationHistory = history
      .slice(-4)
      .map((msg) => `${msg.role === "user" ? "보호자" : "펫체키"}: ${msg.content}`)
      .join("\n");

    const fullPrompt = `${SYSTEM_PROMPT}

${petContext}

${conversationHistory ? `이전 대화:\n${conversationHistory}\n` : ""}
보호자: ${message}

펫체키:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
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

    // 위험도 자동 판단
    const severity = analyzeSeverity(message, cleanMessage);

    // 로그인 사용자 사용량 증가
    if (userId) {
      await incrementUsage(userId);
    }

    return NextResponse.json({
      message: cleanMessage || "증상에 대해 더 자세히 설명해주시겠어요?",
      severity,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      {
        message: "죄송합니다. 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        severity: "low",
      },
      { status: 500 }
    );
  }
}
