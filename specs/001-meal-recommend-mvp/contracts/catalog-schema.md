# Contract: 카탈로그 JSON (`src/data/catalog.json`)

콘텐츠 큐레이션(선별·계량 보정·태깅)과 개발의 접점. 큐레이터는 이 계약만 지키면 코드 수정 없이 레시피를 추가·수정할 수 있다. 필드 의미·제약은 [data-model.md](../data-model.md)의 Recipe/Ingredient 정의를 따른다.

## 파일 구성

```text
src/data/
├── catalog.json      # Recipe[]
├── ingredients.json  # Ingredient[]
└── prices.json       # { asOf: "YYYY-MM", items: { id, unit, price }[] }
```

## catalog.json 예시 (항목 1건)

```json
{
  "id": "dubu-jorim",
  "name": "두부조림",
  "steps": [
    "두부 반 모를 1cm 두께로 썰어 키친타월로 물기를 뺀다.",
    "팬에 기름을 밥숟가락 1술 두르고 중불에서 두부를 앞뒤로 굽는다.",
    "간장 2술 + 물 종이컵 반 컵 + 고춧가루 1술을 섞어 붓고 5분 졸인다."
  ],
  "ingredients": [
    { "ingredientId": "tofu", "display": "두부 반 모", "amount": 0.5, "unit": "모" },
    { "ingredientId": "soy-sauce", "display": "간장 밥숟가락 2술", "amount": 2, "unit": "숟가락" }
  ],
  "cookMinutes": 15,
  "difficulty": "easy",
  "dishwashTag": "minimal",
  "burnerCount": 1,
  "nutritionTags": ["단백질 풍부"],
  "estimatedCost": 2500,
  "source": {
    "channel": "자취요리신",
    "videoTitle": "두부조림 이렇게만 하세요",
    "url": "https://youtube.com/watch?v=..."
  },
  "isStaple": true,
  "spicyLevel": 1
}
```

## 큐레이션 규칙 (스키마 밖의 콘텐츠 의무)

- `steps`는 원본 영상을 **자체 문장으로 재작성** — 복사 금지, `source` 3필드 필수 (FR-012).
- 계량 표기(`display`)는 1인분 현실 단위: 소수점 개수 금지("계란 1.5개" → "계란 2개(소)"), 밥숟가락·종이컵 병기, 국물 요리는 물·간 보정 (FR-011).
- 선별 기준: 1~2인분 가능 · 15분 내외 · 기본 재료 중심 · 1구 인덕션 가능 (FR-023).

## 큐레이션 산출물 수용 절차 (30개 투입 시)

1. 큐레이터가 이 계약대로 `catalog.json`·`ingredients.json` 항목을 추가한다 (코드 수정 불필요).
2. `npm test` 실행 — 로더 검증(아래 표)과 계량 표기 규칙(`checkDisplay`)이 자동으로 전 항목을 검사한다.
3. 30개 도달 시 `src/app.tsx`의 `loadCatalog('dev')`를 `loadCatalog('prod')`로 전환한다 — 운영 임계(30개, staple ≥ 7)가 활성화된다.
4. `npm run build`가 통과하면 수용 완료. 실패 메시지는 위반 레시피 id를 명시한다.

## 로더 검증 (빌드·테스트에서 실패 처리)

| 검사 | 규칙 |
|------|------|
| 참조 무결성 | 모든 `ingredientId`가 ingredients.json에 존재 |
| 1구 제약 | 전 레시피 `burnerCount === 1` |
| 15분 비중 | `cookMinutes <= 15` 레시피 ≥ 전체의 50% |
| 출처 | `source.channel`·`videoTitle`·`url` 비어 있지 않음 |
| 지침 모드 공급 | `cookMinutes <= 15 && dishwashTag === "minimal"` 레시피 ≥ 1개 (FR-017 후보 보장) |
| 콜드스타트 공급 | `isStaple === true` 레시피 ≥ 7개 (첫 주 중복 회피 감당) |
