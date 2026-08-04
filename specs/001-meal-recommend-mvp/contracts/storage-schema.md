# Contract: 로컬 저장소 (`src/storage`)

사용자 상태의 유일한 영속 계층. 도메인·UI는 localStorage를 직접 호출하지 않고 어댑터 함수만 사용한다 (교체 대비 격리, research R4).

## 키 구성

| 키 | 값 (JSON) | 대응 엔티티 |
|----|-----------|-------------|
| `fr.v1.profile` | TasteProfile | 취향 프로필 |
| `fr.v1.meals` | MealRecord[] | 식사 이력 |
| `fr.v1.inventory` | InventoryItem[] | 재고 항목 |
| `fr.v1.recolog` | RecommendationLog[] | 추천 기록 (날짜별, 최근 90일 보존) |
| `fr.v1.savings` | SavingsLedger | 절약 집계 |

- 접두사 `fr.v1.` — 스키마 버전. 필드 추가는 하위 호환으로 처리하고, 파괴적 변경 시 `v2` 키로 마이그레이션 함수를 제공한다.
- 값이 없거나 파싱 불가 → 어댑터는 빈 기본값을 반환한다 (콜드스타트와 동일 경로 — FR-005 우아한 성능 저하).

## 어댑터 계약

```ts
interface Storage {
  loadProfile(): TasteProfile | null;      // null = 온보딩 미완료 → 온보딩 화면으로
  saveProfile(p: TasteProfile): void;

  loadMeals(): MealRecord[];
  appendMeal(m: MealRecord): void;

  loadInventory(): InventoryItem[];
  saveInventory(items: InventoryItem[]): void;

  loadTodayLog(today: string): RecommendationLog | null;  // 하루 고정 복원 (FR-002a)
  saveTodayLog(log: RecommendationLog): void;

  loadSavings(): SavingsLedger;
  appendSaving(entry: SavingsEntry): void;
}
```

**보장 사항**:

1. 동기 API — 홈 첫 렌더에서 오늘 추천을 재계산 없이 복원 (KR1).
2. `loadTodayLog`는 `date !== today`인 기록을 절대 반환하지 않는다 — 자정 경계·지침 모드 자동 해제가 여기서 성립 (FR-002a, FR-017).
3. 쓰기 실패(용량 초과 등)는 조용히 삼키지 않고 호출부에 오류를 전파한다 — 이력 유실은 지표(SC-002) 오염이기 때문.

## 테스트 의무

- 파싱 불가 값 → 기본값 폴백 경로.
- 자정 경계: 어제 로그 존재 + 오늘 조회 → null.
- v1 → v2 마이그레이션 스텁의 왕복(round-trip) 테스트.
