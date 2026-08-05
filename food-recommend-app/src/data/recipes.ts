export interface RecipeBadge {
  label: string;
  variant: "success" | "warning";
}

export interface RecipeIngredient {
  name: string;
  qty: string;
  /** true면 "사야 함" + 쿠팡 주문 버튼 노출 */
  toBuy?: boolean;
}

export interface RecipeDetail {
  badges: RecipeBadge[];
  /** 장보기 카드 */
  cost: { total: string; meals: string; mealCost: string; deliveryCost: string };
  /** 재계산 경고 배너 문구 */
  recalcNote: string;
  ingredients: RecipeIngredient[];
  video: { channel: string; title: string; meta: string; url: string };
  steps: string[];
}

export interface Recipe {
  id: string;
  name: string;
  /** 카드 한 줄 설명 */
  description: string;
  time: string;
  burners: string;
  dishes: string;
  serving: string;
  image: string;
  /** 상세 히어로 이미지 (기본은 image) */
  heroImage?: string;
  /** 홈 히어로 카드 팁 (히어로 레시피만) */
  tip?: string;
  detail: RecipeDetail;
}

export const RECIPES: Recipe[] = [
  {
    id: "hobak-deopbap",
    name: "애호박 새우젓 덮밥",
    description: "애호박이 제철이라 한 개 980원, 어제 단백질이 모자랐어요",
    time: "15분",
    burners: "1구",
    dishes: "설거지 2개",
    serving: "1인분",
    image: "/images/hobak-deopbap.jpg",
    heroImage: "/images/hobak-deopbap-hero.jpg",
    tip: "애호박이 제철이라 한 개 980원, 어제 단백질이 모자랐어요.",
    detail: {
      badges: [
        { label: "단백질 풍부", variant: "success" },
        { label: "채소 보충", variant: "success" },
        { label: "나트륨 주의", variant: "warning" },
      ],
      cost: { total: "3,200원", meals: "2끼", mealCost: "1,600원", deliveryCost: "15,000원" },
      recalcNote:
        '2인분 원본을 1인분으로 다시 계산했어요. "계란 1.5개" 대신 작은 계란 2개, 국물은 물을 조금 더 잡았어요.',
      ingredients: [
        { name: "애호박", qty: "1/2개 (중간 크기)" },
        { name: "계란", qty: "2개 (작은 것)" },
        { name: "새우젓", qty: "밥숟갈 1/3", toBuy: true },
        { name: "밥", qty: "종이컵 1.5컵" },
        { name: "참기름", qty: "밥숟갈 1/2" },
      ],
      video: {
        channel: "EBS 최고의 요리비결 · 유튜브",
        title: "[1분레시피] 담백한 맛! 호박새우젓 볶음 레시피",
        meta: "조회 5.6만 · 1분 43초",
        url: "youtube.com/watch?v=BLyD_dOQxSw",
      },
      steps: [
        "애호박은 반달 모양으로 얇게 썰어요. 두께 0.5cm(동전 두 개 정도)면 3분이면 익어요.",
        "팬에 참기름을 두르고 애호박을 중불에 3분 볶아요. 소금은 넣지 마세요 — 새우젓이 간을 합니다.",
        "새우젓 1/3숟갈을 넣고 30초 더 볶아요. 짠맛이 걱정되면 절반만 먼저.",
        "계란 2개를 팬 한쪽에서 스크램블로 익혀 함께 섞고, 밥 위에 올려요.",
      ],
    },
  },
  {
    id: "dubu-kimchi",
    name: "두부 김치",
    description: "김치가 3주째예요. 지금이 제일 맛있어요",
    time: "12분",
    burners: "1구",
    dishes: "설거지 2개",
    serving: "1인분",
    image: "/images/dubu-kimchi.jpg",
    detail: {
      badges: [
        { label: "단백질 풍부", variant: "success" },
        { label: "나트륨 주의", variant: "warning" },
      ],
      cost: { total: "2,800원", meals: "2끼", mealCost: "1,400원", deliveryCost: "15,000원" },
      recalcNote: "2인분 원본을 1인분으로 다시 계산했어요. 두부는 반 모만 쓰고 나머지는 냉장 보관하세요.",
      ingredients: [
        { name: "두부", qty: "1/2모" },
        { name: "김치", qty: "종이컵 1컵" },
        { name: "돼지고기 앞다리", qty: "손바닥 반 장", toBuy: true },
        { name: "참기름", qty: "밥숟갈 1/2" },
      ],
      video: {
        channel: "백종원의 요리비책 · 유튜브",
        title: "두부김치, 이렇게 하면 실패 없습니다",
        meta: "조회 120만 · 6분 12초",
        url: "youtube.com/watch?v=dubu-kimchi",
      },
      steps: [
        "두부는 끓는 물에 소금을 약간 넣고 3분 데쳐 물기를 빼요.",
        "팬에 기름을 두르고 김치를 중불에 4분 볶아요. 신맛이 강하면 설탕 반 숟갈.",
        "데친 두부를 썰어 접시에 두르고 가운데 볶은 김치를 올려요.",
      ],
    },
  },
  {
    id: "kongnamul-gyeranguk",
    name: "콩나물 계란국",
    description: "콩나물 반 봉지가 이틀 남았어요",
    time: "10분",
    burners: "1구",
    dishes: "설거지 1개",
    serving: "1인분",
    image: "/images/kongnamul-gyeranguk.jpg",
    detail: {
      badges: [
        { label: "저칼로리", variant: "success" },
        { label: "채소 보충", variant: "success" },
      ],
      cost: { total: "1,900원", meals: "2끼", mealCost: "950원", deliveryCost: "15,000원" },
      recalcNote: "2인분 원본을 1인분으로 다시 계산했어요. 물은 종이컵 2컵이면 충분해요.",
      ingredients: [
        { name: "콩나물", qty: "반 봉지" },
        { name: "계란", qty: "1개" },
        { name: "대파", qty: "1/4대" },
        { name: "국간장", qty: "밥숟갈 1/2" },
      ],
      video: {
        channel: "만개의레시피 · 유튜브",
        title: "10분 완성 콩나물 계란국, 시원한 국물 비법",
        meta: "조회 34만 · 3분 05초",
        url: "youtube.com/watch?v=kongnamul-guk",
      },
      steps: [
        "냄비에 물 2컵과 콩나물을 넣고 뚜껑을 덮어 5분 끓여요. 중간에 열지 마세요 — 비린내가 나요.",
        "국간장으로 간을 하고 계란을 풀어 둘러 넣어요.",
        "대파를 썰어 넣고 30초 후 불을 꺼요.",
      ],
    },
  },
  {
    id: "gaji-deopbap",
    name: "가지 덮밥",
    description: "가지가 제철이라 한 개 690원이에요",
    time: "14분",
    burners: "1구",
    dishes: "설거지 2개",
    serving: "1인분",
    image: "/images/gaji-deopbap.jpg",
    detail: {
      badges: [
        { label: "채소 보충", variant: "success" },
        { label: "기름 주의", variant: "warning" },
      ],
      cost: { total: "2,100원", meals: "1끼", mealCost: "2,100원", deliveryCost: "15,000원" },
      recalcNote: "2인분 원본을 1인분으로 다시 계산했어요. 가지 1개면 밥 한 공기 분량이 나와요.",
      ingredients: [
        { name: "가지", qty: "1개" },
        { name: "양파", qty: "1/4개" },
        { name: "간장", qty: "밥숟갈 1" },
        { name: "밥", qty: "종이컵 1.5컵" },
      ],
      video: {
        channel: "쿠캣 · 유튜브",
        title: "밥도둑 가지덮밥, 가지 싫어하는 사람도 반합니다",
        meta: "조회 89만 · 4분 40초",
        url: "youtube.com/watch?v=gaji-deopbap",
      },
      steps: [
        "가지는 어슷하게 썰어 팬에 기름을 넉넉히 두르고 중불에 4분 구워요.",
        "양파를 넣고 2분 더 볶다가 간장·설탕 반 숟갈·물 3숟갈을 넣어요.",
        "양념이 자작해지면 밥 위에 올리고 통깨를 뿌려요.",
      ],
    },
  },
  {
    id: "gyeran-kimchi-bokkeumbap",
    name: "계란 김치볶음밥",
    description: "냉장고 재료만으로 됩니다",
    time: "11분",
    burners: "1구",
    dishes: "설거지 1개",
    serving: "1인분",
    image: "/images/gyeran-kimchi-bokkeumbap.jpg",
    detail: {
      badges: [
        { label: "재료 소진", variant: "success" },
        { label: "나트륨 주의", variant: "warning" },
      ],
      cost: { total: "1,500원", meals: "1끼", mealCost: "1,500원", deliveryCost: "15,000원" },
      recalcNote: "2인분 원본을 1인분으로 다시 계산했어요. 찬밥이면 더 고슬고슬해요.",
      ingredients: [
        { name: "김치", qty: "종이컵 1컵" },
        { name: "계란", qty: "1개" },
        { name: "밥", qty: "종이컵 1.5컵" },
        { name: "참기름", qty: "밥숟갈 1/2" },
      ],
      video: {
        channel: "자취요리신 · 유튜브",
        title: "실패 없는 김치볶음밥 공식, 이 순서만 기억하세요",
        meta: "조회 210만 · 5분 20초",
        url: "youtube.com/watch?v=kimchi-bokkeumbap",
      },
      steps: [
        "팬에 기름을 두르고 김치를 중불에 3분 볶아요.",
        "밥을 넣고 주걱으로 눌러가며 3분 볶은 뒤 참기름을 둘러요.",
        "팬 한쪽에서 계란프라이를 만들어 밥 위에 올려요.",
      ],
    },
  },
];

export function findRecipe(id: string): Recipe | undefined {
  return RECIPES.find((recipe) => recipe.id === id);
}
