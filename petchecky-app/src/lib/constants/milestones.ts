/**
 * 월령별 발달 마일스톤 체크리스트
 * 카테고리: 대근육, 소근육, 언어, 사회성, 인지
 */

import type { MilestoneCategory } from "@/types/baby";

export interface MilestoneItem {
  key: string;
  category: MilestoneCategory;
  ageMonths: number; // 기대 달성 월령
  title: string;
  titleEn: string;
  description: string;
}

export const MILESTONES: MilestoneItem[] = [
  // 0-3개월
  { key: "gm_head_lift", category: "gross_motor", ageMonths: 1, title: "엎드려 고개 들기", titleEn: "Lifts head when on tummy", description: "엎드린 자세에서 머리를 잠시 들 수 있어요" },
  { key: "gm_head_steady", category: "gross_motor", ageMonths: 3, title: "고개 가누기", titleEn: "Holds head steady", description: "안았을 때 고개를 가눌 수 있어요" },
  { key: "fm_hand_fist", category: "fine_motor", ageMonths: 1, title: "주먹 쥐기", titleEn: "Clenches fists", description: "손을 주먹 쥐고 있어요" },
  { key: "fm_hand_open", category: "fine_motor", ageMonths: 3, title: "손 펴기", titleEn: "Opens hands", description: "손을 펴고 물건을 잡으려 해요" },
  { key: "lang_coo", category: "language", ageMonths: 2, title: "옹알이 시작", titleEn: "Cooing", description: "'우~', '아~' 소리를 내요" },
  { key: "soc_smile", category: "social", ageMonths: 2, title: "사회적 미소", titleEn: "Social smile", description: "사람을 보고 미소 지어요" },
  { key: "cog_track_face", category: "cognitive", ageMonths: 1, title: "얼굴 따라보기", titleEn: "Tracks face", description: "사람 얼굴을 눈으로 따라봐요" },
  { key: "cog_track_object", category: "cognitive", ageMonths: 3, title: "물체 추적", titleEn: "Tracks moving objects", description: "움직이는 물체를 눈으로 따라가요" },

  // 4-6개월
  { key: "gm_roll_over", category: "gross_motor", ageMonths: 4, title: "뒤집기", titleEn: "Rolls over", description: "앞에서 뒤로 뒤집을 수 있어요" },
  { key: "gm_sit_support", category: "gross_motor", ageMonths: 5, title: "도움받아 앉기", titleEn: "Sits with support", description: "지지해주면 앉을 수 있어요" },
  { key: "gm_sit_alone", category: "gross_motor", ageMonths: 6, title: "혼자 앉기", titleEn: "Sits without support", description: "도움 없이 잠시 앉을 수 있어요" },
  { key: "fm_grasp", category: "fine_motor", ageMonths: 4, title: "손으로 잡기", titleEn: "Grasps objects", description: "장난감을 손으로 잡을 수 있어요" },
  { key: "fm_transfer", category: "fine_motor", ageMonths: 6, title: "양손 옮기기", titleEn: "Transfers between hands", description: "한 손에서 다른 손으로 물건을 옮겨요" },
  { key: "lang_babble", category: "language", ageMonths: 6, title: "옹알이 (자음)", titleEn: "Babbling with consonants", description: "'바바', '다다' 같은 소리를 내요" },
  { key: "soc_stranger", category: "social", ageMonths: 6, title: "낯가리기 시작", titleEn: "Stranger anxiety begins", description: "낯선 사람을 보면 불안해해요" },
  { key: "cog_object_mouth", category: "cognitive", ageMonths: 4, title: "입으로 탐색", titleEn: "Explores with mouth", description: "물건을 입에 넣어 탐색해요" },

  // 7-9개월
  { key: "gm_crawl", category: "gross_motor", ageMonths: 8, title: "기어가기", titleEn: "Crawling", description: "배를 바닥에서 떼고 기어가요" },
  { key: "gm_pull_stand", category: "gross_motor", ageMonths: 9, title: "잡고 서기", titleEn: "Pulls to stand", description: "가구를 잡고 일어설 수 있어요" },
  { key: "fm_pincer", category: "fine_motor", ageMonths: 9, title: "집게 잡기", titleEn: "Pincer grasp", description: "엄지와 검지로 작은 물건을 집어요" },
  { key: "lang_mama", category: "language", ageMonths: 8, title: "'엄마/아빠' 발음", titleEn: "Says mama/dada", description: "'맘마', '빠빠' 소리를 내요" },
  { key: "soc_wave", category: "social", ageMonths: 9, title: "손 흔들기", titleEn: "Waves bye-bye", description: "바이바이 손을 흔들 수 있어요" },
  { key: "cog_object_permanence", category: "cognitive", ageMonths: 8, title: "대상영속성", titleEn: "Object permanence", description: "숨긴 물건을 찾으려 해요" },

  // 10-12개월
  { key: "gm_cruise", category: "gross_motor", ageMonths: 10, title: "전달 걷기", titleEn: "Cruising", description: "가구를 잡고 옆으로 이동해요" },
  { key: "gm_stand_alone", category: "gross_motor", ageMonths: 11, title: "혼자 서기", titleEn: "Stands alone", description: "잠시 도움 없이 서 있을 수 있어요" },
  { key: "gm_first_steps", category: "gross_motor", ageMonths: 12, title: "첫 걸음", titleEn: "First steps", description: "혼자 몇 걸음 걸을 수 있어요" },
  { key: "fm_stack", category: "fine_motor", ageMonths: 12, title: "블록 쌓기", titleEn: "Stacks blocks", description: "블록 2개를 쌓을 수 있어요" },
  { key: "lang_first_word", category: "language", ageMonths: 12, title: "첫 단어", titleEn: "First meaningful word", description: "의미 있는 첫 단어를 말해요" },
  { key: "soc_imitate", category: "social", ageMonths: 12, title: "행동 모방", titleEn: "Imitates actions", description: "어른의 행동을 따라 해요" },
  { key: "cog_cause_effect", category: "cognitive", ageMonths: 10, title: "인과관계 이해", titleEn: "Cause and effect", description: "버튼을 누르면 소리가 나는 것을 알아요" },

  // 13-18개월
  { key: "gm_walk_steady", category: "gross_motor", ageMonths: 15, title: "안정적 걷기", titleEn: "Walks steadily", description: "넘어지지 않고 잘 걸어요" },
  { key: "gm_climb", category: "gross_motor", ageMonths: 18, title: "계단 오르기", titleEn: "Climbs stairs with help", description: "손을 잡으면 계단을 올라요" },
  { key: "fm_scribble", category: "fine_motor", ageMonths: 15, title: "끼적거리기", titleEn: "Scribbles", description: "크레용으로 끼적거릴 수 있어요" },
  { key: "fm_spoon", category: "fine_motor", ageMonths: 18, title: "숟가락 사용", titleEn: "Uses spoon", description: "숟가락으로 먹으려 해요" },
  { key: "lang_10_words", category: "language", ageMonths: 18, title: "단어 10개 이상", titleEn: "10+ words", description: "10개 이상의 단어를 사용해요" },
  { key: "lang_point", category: "language", ageMonths: 14, title: "가리키기", titleEn: "Points to show", description: "원하는 것을 손가락으로 가리켜요" },
  { key: "soc_parallel_play", category: "social", ageMonths: 18, title: "병행놀이", titleEn: "Parallel play", description: "다른 아이 옆에서 나란히 놀아요" },
  { key: "cog_sort_shape", category: "cognitive", ageMonths: 18, title: "모양 맞추기", titleEn: "Shape sorting", description: "간단한 모양 맞추기를 해요" },

  // 19-24개월
  { key: "gm_run", category: "gross_motor", ageMonths: 20, title: "달리기", titleEn: "Running", description: "달릴 수 있어요" },
  { key: "gm_kick_ball", category: "gross_motor", ageMonths: 24, title: "공 차기", titleEn: "Kicks ball", description: "공을 발로 찰 수 있어요" },
  { key: "fm_stack_6", category: "fine_motor", ageMonths: 24, title: "블록 6개 쌓기", titleEn: "Stacks 6 blocks", description: "블록 6개를 쌓을 수 있어요" },
  { key: "lang_two_word", category: "language", ageMonths: 21, title: "두 단어 문장", titleEn: "Two-word sentences", description: "'엄마 주세요' 같은 문장을 말해요" },
  { key: "lang_50_words", category: "language", ageMonths: 24, title: "단어 50개 이상", titleEn: "50+ words", description: "50개 이상의 단어를 사용해요" },
  { key: "soc_pretend_play", category: "social", ageMonths: 24, title: "가상놀이", titleEn: "Pretend play", description: "인형에게 밥 먹이는 놀이를 해요" },
  { key: "cog_name_objects", category: "cognitive", ageMonths: 24, title: "사물 이름 알기", titleEn: "Names objects", description: "그림책에서 사물 이름을 맞춰요" },

  // 25-36개월
  { key: "gm_jump", category: "gross_motor", ageMonths: 30, title: "두 발 점프", titleEn: "Jumps with both feet", description: "두 발로 점프할 수 있어요" },
  { key: "gm_stairs_alternating", category: "gross_motor", ageMonths: 36, title: "계단 번갈아 오르기", titleEn: "Alternating feet on stairs", description: "발을 번갈아가며 계단을 올라요" },
  { key: "fm_draw_circle", category: "fine_motor", ageMonths: 36, title: "원 그리기", titleEn: "Draws circle", description: "원을 그릴 수 있어요" },
  { key: "lang_sentence", category: "language", ageMonths: 30, title: "3단어 이상 문장", titleEn: "3+ word sentences", description: "3단어 이상의 문장을 말해요" },
  { key: "lang_name_age", category: "language", ageMonths: 36, title: "이름/나이 말하기", titleEn: "Says name and age", description: "자기 이름과 나이를 말할 수 있어요" },
  { key: "soc_take_turns", category: "social", ageMonths: 36, title: "차례 지키기", titleEn: "Takes turns", description: "놀이에서 차례를 지킬 수 있어요" },
  { key: "cog_count_3", category: "cognitive", ageMonths: 36, title: "3까지 세기", titleEn: "Counts to 3", description: "1, 2, 3 셀 수 있어요" },
  { key: "cog_colors", category: "cognitive", ageMonths: 36, title: "색깔 이름 알기", titleEn: "Names colors", description: "기본 색깔 이름을 알아요" },
];

/**
 * 월령별 마일스톤 필터
 */
export function getMilestonesByAge(ageMonths: number): MilestoneItem[] {
  return MILESTONES.filter((m) => m.ageMonths <= ageMonths + 3);
}

/**
 * 카테고리별 마일스톤 필터
 */
export function getMilestonesByCategory(category: MilestoneCategory): MilestoneItem[] {
  return MILESTONES.filter((m) => m.category === category);
}

/**
 * 카테고리 라벨 매핑
 */
export const MILESTONE_CATEGORY_LABELS: Record<MilestoneCategory, { ko: string; en: string; ja: string }> = {
  gross_motor: { ko: "대근육 운동", en: "Gross Motor", ja: "粗大運動" },
  fine_motor: { ko: "소근육 운동", en: "Fine Motor", ja: "微細運動" },
  language: { ko: "언어", en: "Language", ja: "言語" },
  social: { ko: "사회성", en: "Social", ja: "社会性" },
  cognitive: { ko: "인지", en: "Cognitive", ja: "認知" },
};
