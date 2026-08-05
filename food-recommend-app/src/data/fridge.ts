export interface FridgeItem {
  name: string;
  status: string;
  statusTone: "success" | "warning";
  /** 신선도 바 너비(%) */
  freshness: number;
  purchasedOn: string;
}

export const FRIDGE_ITEMS: FridgeItem[] = [
  { name: "계란", status: "2주 남음", statusTone: "success", freshness: 65, purchasedOn: "8월 2일 구매" },
  { name: "두부 1모", status: "4일 남음", statusTone: "success", freshness: 35, purchasedOn: "7월 30일 구매" },
  { name: "대파", status: "5일 남음", statusTone: "success", freshness: 40, purchasedOn: "7월 29일 구매" },
  { name: "김치", status: "넉넉함", statusTone: "success", freshness: 75, purchasedOn: "7월 12일 구매" },
  { name: "콩나물", status: "2일 남음", statusTone: "warning", freshness: 18, purchasedOn: "8월 1일 구매" },
  { name: "애호박", status: "3일 남음", statusTone: "warning", freshness: 25, purchasedOn: "8월 1일 구매" },
  { name: "새우젓", status: "넉넉함", statusTone: "success", freshness: 80, purchasedOn: "6월 20일 구매" },
];

export interface UrgentItem {
  name: string;
  note: string;
  recipeName: string;
  /** 상세 페이지가 있는 레시피면 id, 없으면 null */
  recipeId: string | null;
}

export const URGENT_ITEMS: UrgentItem[] = [
  {
    name: "콩나물 반 봉지",
    note: "2일 남음 · 구매일 기준 추정",
    recipeName: "콩나물 계란국",
    recipeId: "kongnamul-gyeranguk",
  },
  { name: "애호박 반 개", note: "3일 남음 · 구매일 기준 추정", recipeName: "된장찌개", recipeId: null },
];

export const FRIDGE_STATS = [
  { value: "82%", label: "이번 주 소진율" },
  { value: "0개", label: "버린 재료" },
  { value: "7", label: "등록 재료" },
] as const;
