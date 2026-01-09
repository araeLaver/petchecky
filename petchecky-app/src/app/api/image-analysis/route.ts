import { NextRequest, NextResponse } from "next/server";

interface ImageAnalysisRequest {
  image: {
    data: string;
    mimeType: string;
  };
  category: string;
  description?: string;
  petName?: string;
  language?: "ko" | "en" | "ja";
}

const CATEGORY_PROMPTS: Record<string, { ko: string; en: string; ja: string }> = {
  skin: {
    ko: "피부와 털 상태",
    en: "skin and fur condition",
    ja: "皮膚と毛の状態",
  },
  eye: {
    ko: "눈 상태",
    en: "eye condition",
    ja: "目の状態",
  },
  ear: {
    ko: "귀 상태",
    en: "ear condition",
    ja: "耳の状態",
  },
  teeth: {
    ko: "치아와 잇몸 상태",
    en: "teeth and gum condition",
    ja: "歯と歯茎の状態",
  },
  wound: {
    ko: "상처나 부상 부위",
    en: "wound or injury",
    ja: "傷や怪我",
  },
  other: {
    ko: "전반적인 건강 상태",
    en: "overall health condition",
    ja: "全般的な健康状態",
  },
};

function getSystemPrompt(language: string, category: string, petName?: string): string {
  const categoryText = CATEGORY_PROMPTS[category]?.[language as keyof typeof CATEGORY_PROMPTS.skin] ||
                       CATEGORY_PROMPTS.other[language as keyof typeof CATEGORY_PROMPTS.other];
  const petText = petName ? (language === "ko" ? `${petName}의` : language === "ja" ? `${petName}の` : `${petName}'s`) : "";

  const prompts = {
    ko: `당신은 반려동물 건강 전문 AI "펫체키"입니다.

역할:
- 보호자가 업로드한 반려동물 사진을 분석하여 ${petText} ${categoryText}를 평가합니다.
- 친근하고 이해하기 쉬운 한국어로 설명합니다.
- 의학 용어는 쉽게 풀어서 설명합니다.

분석 규칙:
1. 이미지에서 관찰되는 특징을 구체적으로 설명하세요
2. 정상 범위인지, 주의가 필요한지, 위험한 상태인지 판단하세요
3. 가능한 원인 2-3가지를 설명하세요
4. 집에서 할 수 있는 관리 방법을 안내하세요
5. 병원 방문이 필요한 경우 명확히 알려주세요
6. 마지막에 "※ 이 분석은 참고용이며, 정확한 진단은 수의사와 상담하세요."를 포함하세요

주의:
- 불필요하게 불안감을 조성하지 마세요
- 이미지가 불명확하면 그 점을 언급하세요
- 절대 JSON 형식으로 응답하지 마세요`,

    en: `You are "PetChecky", an AI pet health specialist.

Role:
- Analyze the uploaded pet photo to evaluate ${petText} ${categoryText}.
- Explain in friendly, easy-to-understand English.
- Use simple terms to explain medical terminology.

Analysis Rules:
1. Describe specific features observed in the image
2. Determine if it's within normal range, requires attention, or is dangerous
3. Explain 2-3 possible causes
4. Provide home care advice
5. Clearly indicate if a vet visit is needed
6. End with "※ This analysis is for reference only. Please consult a veterinarian for accurate diagnosis."

Notes:
- Don't create unnecessary anxiety
- Mention if the image is unclear
- Never respond in JSON format`,

    ja: `あなたは「ペットチェッキー」、ペット健康専門AIです。

役割:
- アップロードされたペットの写真を分析し、${petText}${categoryText}を評価します。
- 親しみやすく、わかりやすい日本語で説明します。
- 医学用語はわかりやすく説明します。

分析ルール:
1. 画像から観察される特徴を具体的に説明してください
2. 正常範囲か、注意が必要か、危険な状態かを判断してください
3. 考えられる原因を2-3つ説明してください
4. 自宅でできるケア方法を案内してください
5. 病院受診が必要な場合は明確に伝えてください
6. 最後に「※この分析は参考情報です。正確な診断は獣医師にご相談ください。」を含めてください

注意:
- 不必要に不安を煽らないでください
- 画像が不鮮明な場合はその点に言及してください
- 絶対にJSON形式で応答しないでください`,
  };

  return prompts[language as keyof typeof prompts] || prompts.ko;
}

function analyzeSeverity(response: string, language: string): "low" | "medium" | "high" {
  const lowerResponse = response.toLowerCase();

  const highRiskKeywords = {
    ko: ["응급", "즉시 병원", "바로 병원", "위험", "심각", "감염", "출혈", "종양", "악성"],
    en: ["emergency", "immediately", "urgent", "dangerous", "serious", "infection", "bleeding", "tumor", "malignant"],
    ja: ["緊急", "直ちに病院", "危険", "深刻", "感染", "出血", "腫瘍", "悪性"],
  };

  const mediumRiskKeywords = {
    ko: ["병원 방문", "수의사 상담", "진료", "검사", "주의", "염증", "이상", "확인 필요"],
    en: ["vet visit", "consult", "examination", "attention", "inflammation", "abnormal", "check needed"],
    ja: ["病院受診", "獣医師", "診察", "検査", "注意", "炎症", "異常", "確認必要"],
  };

  const keywords = {
    high: highRiskKeywords[language as keyof typeof highRiskKeywords] || highRiskKeywords.ko,
    medium: mediumRiskKeywords[language as keyof typeof mediumRiskKeywords] || mediumRiskKeywords.ko,
  };

  if (keywords.high.some(keyword => lowerResponse.includes(keyword))) {
    return "high";
  }

  if (keywords.medium.some(keyword => lowerResponse.includes(keyword))) {
    return "medium";
  }

  return "low";
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageAnalysisRequest = await request.json();
    const { image, category, description, petName, language = "ko" } = body;

    // Validate image
    if (!image || !image.data || !image.mimeType) {
      return NextResponse.json(
        {
          message: language === "ko" ? "이미지가 필요합니다." :
                   language === "ja" ? "画像が必要です。" :
                   "Image is required.",
        },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          message: language === "ko" ? "서비스 설정이 완료되지 않았습니다." :
                   language === "ja" ? "サービス設定が完了していません。" :
                   "Service configuration incomplete.",
        },
        { status: 500 }
      );
    }

    // Build prompt
    const systemPrompt = getSystemPrompt(language, category, petName);
    const userPrompt = description
      ? (language === "ko" ? `보호자 설명: ${description}\n\n위 사진을 분석해주세요.` :
         language === "ja" ? `飼い主の説明: ${description}\n\n上の写真を分析してください。` :
         `Owner's description: ${description}\n\nPlease analyze the above photo.`)
      : (language === "ko" ? "위 사진을 분석해주세요." :
         language === "ja" ? "上の写真を分析してください。" :
         "Please analyze the above photo.");

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Call Gemini API
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
              parts: [
                {
                  inline_data: {
                    mime_type: image.mimeType,
                    data: image.data,
                  },
                },
                { text: fullPrompt },
              ],
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

      if (response.status === 429) {
        return NextResponse.json(
          {
            message: language === "ko" ? "현재 많은 분들이 이용 중이에요. 잠시 후 다시 시도해주세요." :
                     language === "ja" ? "現在多くの方がご利用中です。しばらくしてから再試行してください。" :
                     "Many users are currently using the service. Please try again later.",
          },
          { status: 429 }
        );
      }

      throw new Error("Gemini API request failed");
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean up response
    const cleanAnalysis = rawText
      .replace(/```[\s\S]*?```/g, "")
      .trim();

    // Determine severity
    const severity = analyzeSeverity(cleanAnalysis, language);

    return NextResponse.json({
      analysis: cleanAnalysis || (language === "ko" ? "이미지를 분석할 수 없습니다. 다른 사진을 시도해주세요." :
                                  language === "ja" ? "画像を分析できません。別の写真をお試しください。" :
                                  "Unable to analyze the image. Please try a different photo."),
      severity,
    });
  } catch (error) {
    console.error("Image Analysis API Error:", error);
    return NextResponse.json(
      {
        message: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}
