/**
 * 대한민국 국가예방접종 스케줄 (질병관리청 기준)
 * 18종 예방접종
 */

export interface VaccineSchedule {
  key: string;
  name: string;
  nameEn: string;
  disease: string;
  doses: VaccineDose[];
  required: boolean;
  description: string;
}

export interface VaccineDose {
  doseNumber: number;
  label: string;
  ageMonths: number; // 권장 접종 월령
  ageRangeStart: number; // 접종 가능 시작 월령
  ageRangeEnd: number; // 접종 가능 종료 월령
}

export const BABY_VACCINATIONS: VaccineSchedule[] = [
  {
    key: "bcg",
    name: "BCG (결핵)",
    nameEn: "BCG",
    disease: "결핵",
    required: true,
    description: "출생 후 4주 이내 접종 권장",
    doses: [
      { doseNumber: 1, label: "1회", ageMonths: 0, ageRangeStart: 0, ageRangeEnd: 1 },
    ],
  },
  {
    key: "hepb",
    name: "B형간염",
    nameEn: "HepB",
    disease: "B형간염",
    required: true,
    description: "출생 시, 1개월, 6개월 접종",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 0, ageRangeStart: 0, ageRangeEnd: 0 },
      { doseNumber: 2, label: "2차", ageMonths: 1, ageRangeStart: 1, ageRangeEnd: 2 },
      { doseNumber: 3, label: "3차", ageMonths: 6, ageRangeStart: 6, ageRangeEnd: 18 },
    ],
  },
  {
    key: "dtap",
    name: "DTaP (디프테리아/파상풍/백일해)",
    nameEn: "DTaP",
    disease: "디프테리아, 파상풍, 백일해",
    required: true,
    description: "2, 4, 6개월 기초접종 후 15-18개월, 4-6세 추가접종",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 2, ageRangeStart: 2, ageRangeEnd: 4 },
      { doseNumber: 2, label: "2차", ageMonths: 4, ageRangeStart: 4, ageRangeEnd: 6 },
      { doseNumber: 3, label: "3차", ageMonths: 6, ageRangeStart: 6, ageRangeEnd: 18 },
      { doseNumber: 4, label: "4차 (추가)", ageMonths: 18, ageRangeStart: 15, ageRangeEnd: 18 },
      { doseNumber: 5, label: "5차 (추가)", ageMonths: 54, ageRangeStart: 48, ageRangeEnd: 72 },
    ],
  },
  {
    key: "ipv",
    name: "IPV (폴리오)",
    nameEn: "IPV",
    disease: "폴리오(소아마비)",
    required: true,
    description: "2, 4, 6개월 기초접종 후 4-6세 추가접종",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 2, ageRangeStart: 2, ageRangeEnd: 4 },
      { doseNumber: 2, label: "2차", ageMonths: 4, ageRangeStart: 4, ageRangeEnd: 6 },
      { doseNumber: 3, label: "3차", ageMonths: 6, ageRangeStart: 6, ageRangeEnd: 18 },
      { doseNumber: 4, label: "4차 (추가)", ageMonths: 54, ageRangeStart: 48, ageRangeEnd: 72 },
    ],
  },
  {
    key: "hib",
    name: "Hib (b형 헤모필루스 인플루엔자)",
    nameEn: "Hib",
    disease: "b형 헤모필루스 인플루엔자",
    required: true,
    description: "2, 4, 6개월 기초접종 후 12-15개월 추가접종",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 2, ageRangeStart: 2, ageRangeEnd: 4 },
      { doseNumber: 2, label: "2차", ageMonths: 4, ageRangeStart: 4, ageRangeEnd: 6 },
      { doseNumber: 3, label: "3차", ageMonths: 6, ageRangeStart: 6, ageRangeEnd: 12 },
      { doseNumber: 4, label: "4차 (추가)", ageMonths: 14, ageRangeStart: 12, ageRangeEnd: 15 },
    ],
  },
  {
    key: "pcv",
    name: "PCV (폐렴구균)",
    nameEn: "PCV13",
    disease: "폐렴구균",
    required: true,
    description: "2, 4, 6개월 기초접종 후 12-15개월 추가접종",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 2, ageRangeStart: 2, ageRangeEnd: 4 },
      { doseNumber: 2, label: "2차", ageMonths: 4, ageRangeStart: 4, ageRangeEnd: 6 },
      { doseNumber: 3, label: "3차", ageMonths: 6, ageRangeStart: 6, ageRangeEnd: 12 },
      { doseNumber: 4, label: "4차 (추가)", ageMonths: 14, ageRangeStart: 12, ageRangeEnd: 15 },
    ],
  },
  {
    key: "mmr",
    name: "MMR (홍역/유행성이하선염/풍진)",
    nameEn: "MMR",
    disease: "홍역, 유행성이하선염, 풍진",
    required: true,
    description: "12-15개월 1차, 4-6세 2차",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 12, ageRangeStart: 12, ageRangeEnd: 15 },
      { doseNumber: 2, label: "2차", ageMonths: 54, ageRangeStart: 48, ageRangeEnd: 72 },
    ],
  },
  {
    key: "var",
    name: "VAR (수두)",
    nameEn: "VAR",
    disease: "수두",
    required: true,
    description: "12-15개월 접종",
    doses: [
      { doseNumber: 1, label: "1회", ageMonths: 12, ageRangeStart: 12, ageRangeEnd: 15 },
    ],
  },
  {
    key: "hepa",
    name: "A형간염",
    nameEn: "HepA",
    disease: "A형간염",
    required: true,
    description: "12개월 이후 2회 접종 (6개월 간격)",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 12, ageRangeStart: 12, ageRangeEnd: 24 },
      { doseNumber: 2, label: "2차", ageMonths: 18, ageRangeStart: 18, ageRangeEnd: 36 },
    ],
  },
  {
    key: "je_inactivated",
    name: "일본뇌염 (불활성화 백신)",
    nameEn: "JE (Inactivated)",
    disease: "일본뇌염",
    required: true,
    description: "12-23개월 기초접종 후 추가접종",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 12, ageRangeStart: 12, ageRangeEnd: 18 },
      { doseNumber: 2, label: "2차", ageMonths: 13, ageRangeStart: 12, ageRangeEnd: 24 },
      { doseNumber: 3, label: "3차 (추가)", ageMonths: 24, ageRangeStart: 24, ageRangeEnd: 36 },
      { doseNumber: 4, label: "4차 (추가)", ageMonths: 72, ageRangeStart: 72, ageRangeEnd: 84 },
      { doseNumber: 5, label: "5차 (추가)", ageMonths: 144, ageRangeStart: 144, ageRangeEnd: 156 },
    ],
  },
  {
    key: "je_live",
    name: "일본뇌염 (약독화 생백신)",
    nameEn: "JE (Live)",
    disease: "일본뇌염",
    required: true,
    description: "12-23개월 기초접종",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 12, ageRangeStart: 12, ageRangeEnd: 24 },
      { doseNumber: 2, label: "2차", ageMonths: 24, ageRangeStart: 24, ageRangeEnd: 36 },
    ],
  },
  {
    key: "rv",
    name: "로타바이러스",
    nameEn: "RV",
    disease: "로타바이러스 감염증",
    required: false,
    description: "2, 4개월 (또는 2, 4, 6개월) 접종. 제품에 따라 접종 횟수 다름",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 2, ageRangeStart: 2, ageRangeEnd: 3 },
      { doseNumber: 2, label: "2차", ageMonths: 4, ageRangeStart: 4, ageRangeEnd: 5 },
      { doseNumber: 3, label: "3차", ageMonths: 6, ageRangeStart: 6, ageRangeEnd: 8 },
    ],
  },
  {
    key: "iiv",
    name: "인플루엔자",
    nameEn: "IIV",
    disease: "인플루엔자",
    required: true,
    description: "6개월 이상 매년 접종. 최초 접종 시 4주 간격 2회",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 6, ageRangeStart: 6, ageRangeEnd: 12 },
      { doseNumber: 2, label: "2차", ageMonths: 7, ageRangeStart: 7, ageRangeEnd: 13 },
    ],
  },
  {
    key: "tdap",
    name: "Tdap (파상풍/디프테리아/백일해)",
    nameEn: "Tdap",
    disease: "파상풍, 디프테리아, 백일해",
    required: true,
    description: "11-12세 접종",
    doses: [
      { doseNumber: 1, label: "1회", ageMonths: 132, ageRangeStart: 132, ageRangeEnd: 156 },
    ],
  },
  {
    key: "hpv",
    name: "HPV (사람유두종바이러스)",
    nameEn: "HPV",
    disease: "사람유두종바이러스 감염증",
    required: true,
    description: "12-13세 여성 대상 2회 접종",
    doses: [
      { doseNumber: 1, label: "1차", ageMonths: 144, ageRangeStart: 108, ageRangeEnd: 156 },
      { doseNumber: 2, label: "2차", ageMonths: 150, ageRangeStart: 114, ageRangeEnd: 162 },
    ],
  },
];

/**
 * 생년월일 기반 예방접종 스케줄 생성
 */
export function generateVaccinationSchedule(
  birthDate: string,
  vaccinations: VaccineSchedule[] = BABY_VACCINATIONS
): {
  vaccineKey: string;
  vaccineName: string;
  doseNumber: number;
  doseLabel: string;
  scheduledDate: string;
  rangeStart: string;
  rangeEnd: string;
  required: boolean;
}[] {
  const birth = new Date(birthDate);
  const schedule: {
    vaccineKey: string;
    vaccineName: string;
    doseNumber: number;
    doseLabel: string;
    scheduledDate: string;
    rangeStart: string;
    rangeEnd: string;
    required: boolean;
  }[] = [];

  for (const vaccine of vaccinations) {
    for (const dose of vaccine.doses) {
      const scheduled = new Date(birth);
      scheduled.setMonth(scheduled.getMonth() + dose.ageMonths);

      const rangeStart = new Date(birth);
      rangeStart.setMonth(rangeStart.getMonth() + dose.ageRangeStart);

      const rangeEnd = new Date(birth);
      rangeEnd.setMonth(rangeEnd.getMonth() + dose.ageRangeEnd);

      schedule.push({
        vaccineKey: vaccine.key,
        vaccineName: vaccine.name,
        doseNumber: dose.doseNumber,
        doseLabel: dose.label,
        scheduledDate: scheduled.toISOString().split("T")[0],
        rangeStart: rangeStart.toISOString().split("T")[0],
        rangeEnd: rangeEnd.toISOString().split("T")[0],
        required: vaccine.required,
      });
    }
  }

  return schedule.sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
}
