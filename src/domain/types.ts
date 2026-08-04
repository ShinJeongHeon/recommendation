// data-model.md의 엔티티 정의 (specs/001-meal-recommend-mvp/data-model.md)

export interface RecipeIngredient {
  ingredientId: string;
  /** 1인분 현실 계량 표기 — 소수점 개수 금지, 밥숟가락·종이컵 병기 (FR-011) */
  display: string;
  amount: number;
  unit: string;
}

export interface RecipeSource {
  channel: string;
  videoTitle: string;
  url: string;
}

export interface Recipe {
  id: string;
  name: string;
  steps: string[];
  ingredients: RecipeIngredient[];
  cookMinutes: number;
  difficulty: 'easy' | 'normal';
  dishwashTag: 'minimal' | 'normal';
  burnerCount: number;
  nutritionTags: string[];
  /** 끼당(1인분 1회 조리분) 예상 재료비(원) — 장보기 총액 아님 */
  estimatedCost: number;
  source: RecipeSource;
  isStaple: boolean;
  spicyLevel: number; // 0~3
}

export interface Ingredient {
  id: string;
  name: string;
  shelfLifeDays: number;
  seasonalMonths: number[]; // 1~12
  priceRef?: string;
}

export interface PriceItem {
  id: string;
  unit: string;
  price: number;
}

export interface PriceTable {
  asOf: string; // "YYYY-MM"
  items: PriceItem[];
}

export interface InventoryItem {
  ingredientId: string;
  purchasedAt: string; // ISO date
  roughAmount: 'enough' | 'some' | 'little';
}

export interface TasteProfile {
  excludedIngredients: string[];
  spicyTolerance: number; // 0~3
  basePreferences: string[];
  createdAt: string; // ISO date — 첫 주 판정 기준 (FR-009)
  /** 수용/거절 이력 학습 점수: 거절 −1, 완료 +2 (게이트 A/B로 조정) */
  learned: Record<string, number>;
}

export interface MealRecord {
  recipeId: string;
  completedAt: string; // ISO datetime
}

export interface RejectionRecord {
  recipeId: string;
  at: string; // ISO datetime
}

export interface RecommendationLog {
  date: string; // "YYYY-MM-DD" 로컬 자정 기준 — 하루 고정의 키 (FR-002a)
  currentRecipeId: string;
  tiredMode: boolean;
  rejections: RejectionRecord[];
  reasonParts: string[];
  accepted: boolean;
  videoOpenedAt?: string; // SC-008 측정 입력
}

/** 근거 한 줄을 구성하는 기여 요소 조각 — inventory는 항상 확인형 문구 (FR-006) */
export interface ReasonPart {
  kind: 'taste' | 'nutrition' | 'seasonal' | 'price' | 'inventory' | 'leftover';
  text: string;
}

/** 완화 단계 식별자 — 일반 완화는 화면 비노출, tired-20min만 tiredOverrunMinutes로 노출 (FR-007) */
export type Relaxation = 'dedupe-5d' | 'missing-3' | 'tired-20min' | 'recycle-rejected' | 'dedupe-off';

export interface SavingsEntry {
  weekStart: string; // 주 시작(월요일) "YYYY-MM-DD"
  recipeId: string;
  saved: number;
}

export interface SavingsLedger {
  entries: SavingsEntry[];
}
