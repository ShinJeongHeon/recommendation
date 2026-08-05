# 하이파이 5페이지 Next.js 핸드오프 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pencil 하이파이 5장(로그인·홈·레시피 상세·냉장고·마이)을 `food-recommend-app`에 반응형(모바일→1280px)으로 구현한다.

**Architecture:** App Router 페이지 5개 + 탭 공유 레이아웃 `(tabs)`. 기존 디자인시스템(`src/ui/`, `src/foundation/`, `src/styles/tokens.css`)을 그대로 재사용하고, 반복 UI는 `src/blocks/`에 스토리와 함께 신설한다. 데이터는 `src/data/` 목 픽스처, 이미지는 `public/images/`(추출 완료).

**Tech Stack:** Next.js 16.3(App Router, 전역 `LayoutProps`/`PageProps` 타입), React 19, Tailwind v4(`@theme` 토큰), Storybook 10 + vitest(`--project storybook`).

**Spec:** `docs/superpowers/specs/2026-08-05-handoff-5-pages-design.md`
**시각 레퍼런스:** `docs/superpowers/plans/references/{00-login,02-home,05-recipe-detail,07-fridge,10-my}.png` (360px 원본 디자인 — 구현 결과와 대조할 것)

## Global Constraints

- 작업 디렉터리: 모든 명령은 `food-recommend-app/`에서 실행.
- 스토리북 = 디자인 SSOT: 기존 22종 UI 컴포넌트를 재사용하고, 스토리에 없는 반복 UI는 컴포넌트+콜로케이트 스토리를 먼저 추가한 후 사용 (`food-recommend-app/CLAUDE.md`).
- Tailwind 클래스는 **정적 리터럴만** (동적 조합은 스캐너가 감지 못함). 상태별 색은 JS 분기. 퍼센트 너비 등 연속값만 inline style 허용.
- 색·타이포는 반드시 토큰 클래스 사용: `bg-background-*`, `text-text-*`, `border-border-*`, `typo-*`, `rounded-card`. 임의 hex 금지.
- 한국어 카피는 디자인 원문 그대로 (레퍼런스 PNG 기준, 변경 금지).
- 반응형: 컨테이너 `max-w-[1280px] mx-auto`, 초과분 좌우 여백. 브레이크포인트 md(768)/lg(1024)만 사용.
- 아이콘은 `Icon` 컴포넌트(`IconName`)만 사용. 사용 가능 이름은 `src/foundation/icon/icons.ts` 참고.
- 커밋 메시지 끝에 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- 각 태스크 검증: `npx vitest --project storybook run` 그린 + 해당 태스크 명시 명령.

## File Structure

```
food-recommend-app/
  public/images/                      # 완료(추출됨): hobak-deopbap(-hero), dubu-kimchi,
                                      # kongnamul-gyeranguk, gaji-deopbap, gyeran-kimchi-bokkeumbap, youtube-thumb
  src/app/layout.tsx                  # 수정: Pretendard·lang=ko·메타데이터
  src/app/globals.css                 # 수정: 스캐폴드 토큰 제거, body 배경 토큰화
  src/app/(tabs)/layout.tsx           # 신규: 컨테이너 + AppTabBar
  src/app/(tabs)/page.tsx             # 신규: 홈 (기존 src/app/page.tsx 대체)
  src/app/(tabs)/page.stories.tsx     # 신규
  src/app/(tabs)/fridge/page.tsx      # 신규 + page.stories.tsx
  src/app/(tabs)/my/page.tsx          # 신규 + page.stories.tsx
  src/app/login/page.tsx              # 신규 + page.stories.tsx
  src/app/recipes/[id]/page.tsx       # 신규 (async — 스토리 없음, build로 검증)
  src/data/recipes.ts                 # 신규: Recipe 타입 + 5종 픽스처
  src/data/fridge.ts                  # 신규: 냉장고 픽스처
  src/blocks/app-tab-bar/AppTabBar.tsx        # 신규 + .stories.tsx
  src/blocks/hero-recipe-card/HeroRecipeCard.tsx  # 신규 + .stories.tsx
  src/blocks/recipe-card/RecipeCard.tsx       # 신규 + .stories.tsx
  src/blocks/ingredient-row/IngredientRow.tsx # 신규 + .stories.tsx
  src/blocks/setting-row/SettingRow.tsx       # 신규 + .stories.tsx
  src/ui/card/Card.tsx                # 수정: mediaClassName/bodyClassName 추가
```

블록 스토리 타이틀은 `Blocks/<이름>`. 삭제: `src/app/page.tsx`, `src/app/page.stories.tsx`, `src/stories/`(스캐폴드 데모).

---

### Task 1: 전역 셸 정리 + 데이터 픽스처

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/globals.css`
- Delete: `src/app/page.tsx`, `src/app/page.stories.tsx`, `src/stories/`
- Create: `src/data/recipes.ts`, `src/data/fridge.ts`

**Interfaces:**
- Produces: `Recipe`, `RecipeDetail`, `RECIPES: Recipe[]`, `findRecipe(id)`, `FridgeItem`, `FRIDGE_ITEMS`, `URGENT_ITEMS`, `FRIDGE_STATS` — 아래 코드 시그니처 그대로.

- [ ] **Step 1: 스캐폴드 삭제**

```powershell
Remove-Item src/app/page.tsx, src/app/page.stories.tsx; Remove-Item -Recurse src/stories
```

- [ ] **Step 2: layout.tsx 교체**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘의 집밥",
  description: "묻기 전에 먼저 고르는 저녁 추천",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-background-default text-text-default">
        {children}
      </body>
    </html>
  );
}
```

(Pretendard는 `tokens.css`의 `@font-face` + `--font-sans`가 이미 처리 — `next/font` 불필요. `LayoutProps` 전역 타입이 없다고 타입 에러가 나면 `{ children: React.ReactNode }`로 대체.)

- [ ] **Step 3: globals.css 정리** — 전체 내용을 다음으로 교체:

```css
@import "tailwindcss";
@import "../styles/tokens.css";
```

(body 스타일은 layout의 클래스가 담당. `--background`/`--foreground`/`@theme inline`/다크모드 블록 삭제.)

- [ ] **Step 4: `src/data/recipes.ts` 작성**

```ts
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
```

- [ ] **Step 5: `src/data/fridge.ts` 작성**

```ts
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
  { name: "콩나물 반 봉지", note: "2일 남음 · 구매일 기준 추정", recipeName: "콩나물 계란국", recipeId: "kongnamul-gyeranguk" },
  { name: "애호박 반 개", note: "3일 남음 · 구매일 기준 추정", recipeName: "된장찌개", recipeId: null },
];

export const FRIDGE_STATS = [
  { value: "82%", label: "이번 주 소진율" },
  { value: "0개", label: "버린 재료" },
  { value: "7", label: "등록 재료" },
] as const;
```

- [ ] **Step 6: 검증** — Run: `npx tsc --noEmit` → 에러 없음. `npx vitest --project storybook run` → 그린(스캐폴드 스토리 삭제로 테스트 수 감소는 정상).

- [ ] **Step 7: Commit** — `git add -A food-recommend-app/src food-recommend-app/public/images; git commit -m "feat: 전역 셸 정리 및 목 픽스처 추가"`

---

### Task 2: Card 확장 (mediaClassName / bodyClassName)

**Files:**
- Modify: `src/ui/card/Card.tsx`
- Test: `src/ui/card/Card.stories.tsx` (스토리 추가)

**Interfaces:**
- Produces: `CardProps.mediaClassName?: string`, `CardProps.bodyClassName?: string` — 미디어 래퍼(기본 `h-40 w-full ...`)와 본문(기본 `flex w-full flex-col gap-2.5 p-4`)에 `cn()`으로 병합. `cn`은 tailwind-merge라 뒤 클래스가 이김.

- [ ] **Step 1: 실패하는 스토리 추가** — `Card.stories.tsx`에 추가 (기존 스토리 형식·타이틀 유지):

```tsx
export const CustomMediaHeight: Story = {
  args: {
    media: <img src="/images/dubu-kimchi.jpg" alt="" />,
    mediaClassName: "h-auto aspect-[9/5]",
    bodyClassName: "p-3",
    children: <span className="typo-heading-sm text-text-default">두부 김치</span>,
  },
  play: async ({ canvasElement }) => {
    const media = canvasElement.querySelector("[data-slot=media]");
    await expect(media).not.toBeNull();
    await expect(media!.className).toContain("aspect-[9/5]");
  },
};
```

(기존 스토리 파일의 import 방식 — `expect`는 `storybook/test` — 을 그대로 따를 것. args 타입이 기존 meta와 안 맞으면 render 함수 형태로 작성.)

- [ ] **Step 2: 실패 확인** — Run: `npx vitest --project storybook run` → CustomMediaHeight FAIL (prop 없음/타입 에러).

- [ ] **Step 3: Card.tsx 수정** — props에 `mediaClassName`, `bodyClassName` 추가:

```tsx
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** 상단 이미지 영역(높이 160). 제외 가능. */
  media?: ReactNode;
  /** 미디어 래퍼 클래스 오버라이드(높이·비율 등) */
  mediaClassName?: string;
  /** 본문 래퍼 클래스 오버라이드(패딩·flex 등) */
  bodyClassName?: string;
}
```

미디어 래퍼를 `<div data-slot="media" className={cn("h-40 w-full shrink-0 overflow-hidden [&_img]:size-full [&_img]:object-cover", mediaClassName)}>`로, 본문을 `<div className={cn("flex w-full flex-col gap-2.5 p-4", bodyClassName)}>`로 변경.

- [ ] **Step 4: 통과 확인** — Run: `npx vitest --project storybook run` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat(ui): Card mediaClassName·bodyClassName 오버라이드 추가"`

---

### Task 3: AppTabBar 블록

**Files:**
- Create: `src/blocks/app-tab-bar/AppTabBar.tsx`, `src/blocks/app-tab-bar/AppTabBar.stories.tsx`

**Interfaces:**
- Consumes: `TabBar`(`@/ui/tab-bar/TabBar`), `usePathname`/`useRouter`(`next/navigation`)
- Produces: `<AppTabBar />` — props 없음. 홈(`/`)·냉장고(`/fridge`)·기록(비활성)·마이(`/my`) 4탭, 현재 경로로 활성 탭 결정, 탭 클릭 시 push. fixed 하단 배치는 사용처(레이아웃) 책임.

- [ ] **Step 1: 실패하는 스토리 작성** — `AppTabBar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { AppTabBar } from "./AppTabBar";

const meta = {
  title: "Blocks/AppTabBar",
  component: AppTabBar,
  parameters: { layout: "centered", nextjs: { appDirectory: true, navigation: { pathname: "/fridge" } } },
} satisfies Meta<typeof AppTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FridgeActive: Story = {
  play: async ({ canvas }) => {
    const active = canvas.getByRole("button", { name: /냉장고/ });
    await expect(active).toHaveAttribute("aria-current", "page");
  },
};
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest --project storybook run` → FAIL (모듈 없음).
- [ ] **Step 3: 구현** — `AppTabBar.tsx`:

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { TabBar } from "@/ui/tab-bar/TabBar";

const TABS = [
  { label: "홈", icon: "home", href: "/" },
  { label: "냉장고", icon: "refrigerator", href: "/fridge" },
  { label: "기록", icon: "calendar", href: null },
  { label: "마이", icon: "user", href: "/my" },
] as const;

/** 라우팅 연결된 하단 탭바. 기록 탭은 미구현 화면이라 비활성. */
export function AppTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeIndex = TABS.findIndex(({ href }) => href === pathname);

  return (
    <TabBar
      items={TABS.map(({ label, icon }) => ({ label, icon }))}
      activeIndex={activeIndex === -1 ? 0 : activeIndex}
      onSelect={(index) => {
        const href = TABS[index].href;
        if (href) router.push(href);
      }}
    />
  );
}
```

- [ ] **Step 4: 통과 확인** — Run: `npx vitest --project storybook run` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat(blocks): 라우팅 연결 AppTabBar 추가"`

---

### Task 4: RecipeCard + HeroRecipeCard 블록

**Files:**
- Create: `src/blocks/recipe-card/RecipeCard.tsx` + `.stories.tsx`
- Create: `src/blocks/hero-recipe-card/HeroRecipeCard.tsx` + `.stories.tsx`

**Interfaces:**
- Consumes: `Card`/`CardPill`(mediaClassName — Task 2), `Button`, `Icon`, `Recipe`(`@/data/recipes`), `next/image`, `next/link`
- Produces: `<RecipeCard recipe={Recipe} />` — 전체가 `/recipes/[id]` 링크. `<HeroRecipeCard recipe={Recipe} />` — md 이상 이미지 좌/본문 우.

- [ ] **Step 1: 실패하는 스토리 2개 작성**

`RecipeCard.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { RECIPES } from "@/data/recipes";
import { RecipeCard } from "./RecipeCard";

const meta = {
  title: "Blocks/RecipeCard",
  component: RecipeCard,
  parameters: { layout: "centered", nextjs: { appDirectory: true } },
} satisfies Meta<typeof RecipeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { recipe: RECIPES[1] },
  render: (args) => (
    <div className="w-40">
      <RecipeCard {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /두부 김치/ });
    await expect(link).toHaveAttribute("href", "/recipes/dubu-kimchi");
  },
};
```

`HeroRecipeCard.stories.tsx` (같은 형식, title "Blocks/HeroRecipeCard", args `{ recipe: RECIPES[0] }`, render 래퍼 `w-80`):

```tsx
export const Default: Story = {
  args: { recipe: RECIPES[0] },
  render: (args) => (
    <div className="w-80">
      <HeroRecipeCard {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("애호박 새우젓 덮밥")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: /이걸로 만들기/ })).toHaveAttribute(
      "href",
      "/recipes/hobak-deopbap",
    );
  },
};
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest --project storybook run` → 두 스토리 FAIL.
- [ ] **Step 3: RecipeCard 구현**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/data/recipes";
import { Card, CardPill } from "@/ui/card/Card";

/** 홈 추천 그리드 카드 — 사진·이름·추천 이유·조리 시간. */
export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block">
      <Card
        media={<Image src={recipe.image} alt={recipe.name} width={316} height={176} />}
        mediaClassName="h-auto aspect-[9/5]"
        bodyClassName="gap-1.5 p-3"
      >
        <span className="typo-heading-sm text-text-default">{recipe.name}</span>
        <span className="typo-body-md text-text-subtle">{recipe.description}</span>
        <CardPill className="mt-1 self-start">{recipe.time}</CardPill>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 4: HeroRecipeCard 구현**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/data/recipes";
import { Icon } from "@/foundation/icon/Icon";
import { Button } from "@/ui/button/Button";
import { Card, CardPill } from "@/ui/card/Card";

/** 홈 히어로 카드 — 오늘의 한 접시. md 이상에서 이미지 좌/본문 우 분할. */
export function HeroRecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card
      className="md:flex-row"
      media={
        <div className="relative size-full">
          <Image src={recipe.image} alt={recipe.name} fill className="object-cover" priority />
          <span className="absolute bottom-3 left-3 rounded-full bg-background-scrim px-3 py-1.5 typo-label-lg text-text-inverse">
            오늘의 한 접시
          </span>
        </div>
      }
      mediaClassName="relative h-[190px] md:h-auto md:w-[45%] md:self-stretch"
      bodyClassName="gap-3 md:flex-1 md:justify-center md:p-6"
    >
      <h2 className="typo-heading-lg text-text-default">{recipe.name}</h2>
      <div className="flex flex-wrap gap-1.5">
        <CardPill>{recipe.time}</CardPill>
        <CardPill>{recipe.burners}</CardPill>
        <CardPill>{recipe.dishes}</CardPill>
      </div>
      {recipe.tip && (
        <p className="flex items-start gap-2 rounded-xl bg-background-success-subtle p-3 typo-body-md text-text-success">
          <Icon name="leaf" size={16} className="mt-0.5 shrink-0" />
          {recipe.tip}
        </p>
      )}
      <div className="flex gap-2">
        <Link href={`/recipes/${recipe.id}`} className="flex-1">
          <Button size="lg" fullWidth tabIndex={-1}>
            이걸로 만들기
          </Button>
        </Link>
        <Button variant="secondary" size="lg" leadingIcon="refresh" aria-label="다른 메뉴 추천받기" />
      </div>
    </Card>
  );
}
```

- [ ] **Step 5: 통과 확인** — Run: `npx vitest --project storybook run` → PASS. (Link 안 Button 중첩 인터랙티브 경고가 a11y 애드온에서 나오면 `Link`에 버튼 스타일을 직접 적용하는 방식으로 조정: `<Link className={...Button과 동일 클래스...}>`. 단, 우선 위 형태로 시도.)
- [ ] **Step 6: Commit** — `git commit -m "feat(blocks): RecipeCard·HeroRecipeCard 추가"`

---

### Task 5: IngredientRow + SettingRow 블록

**Files:**
- Create: `src/blocks/ingredient-row/IngredientRow.tsx` + `.stories.tsx`
- Create: `src/blocks/setting-row/SettingRow.tsx` + `.stories.tsx`

**Interfaces:**
- Consumes: `FridgeItem`(`@/data/fridge`), `Icon`, `IconName`
- Produces: `<IngredientRow item={FridgeItem} />`, `<SettingRow icon={IconName} label={string} value?={string} chevron?={boolean} control?={ReactNode} />`

- [ ] **Step 1: 실패하는 스토리 작성**

`IngredientRow.stories.tsx` (title "Blocks/IngredientRow"):

```tsx
export const Fresh: Story = {
  args: { item: { name: "계란", status: "2주 남음", statusTone: "success", freshness: 65, purchasedOn: "8월 2일 구매" } },
  render: (args) => (
    <div className="w-80">
      <IngredientRow {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("2주 남음")).toBeInTheDocument();
    const bar = canvasElement.querySelector<HTMLElement>("[data-slot=freshness]");
    await expect(bar!.style.width).toBe("65%");
  },
};
export const Warning: Story = {
  args: { item: { name: "콩나물", status: "2일 남음", statusTone: "warning", freshness: 18, purchasedOn: "8월 1일 구매" } },
  render: Fresh.render,
};
```

`SettingRow.stories.tsx` (title "Blocks/SettingRow"):

```tsx
export const WithValue: Story = {
  args: { icon: "heart", label: "취향 다시 설정", value: "3문항", chevron: true },
  render: (args) => (
    <div className="w-80">
      <SettingRow {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("취향 다시 설정")).toBeInTheDocument();
    await expect(canvas.getByText("3문항")).toBeInTheDocument();
  },
};
```

- [ ] **Step 2: 실패 확인** — Run: `npx vitest --project storybook run` → FAIL.
- [ ] **Step 3: IngredientRow 구현**

```tsx
import type { FridgeItem } from "@/data/fridge";

/** 냉장고 재료 행 — 이름·잔여 상태·신선도 바·구매일. */
export function IngredientRow({ item }: { item: FridgeItem }) {
  const statusColor = item.statusTone === "success" ? "text-text-success" : "text-text-warning";
  const barColor = item.statusTone === "success" ? "bg-background-success" : "bg-background-warning";

  return (
    <div className="flex flex-col gap-1.5 py-3.5">
      <div className="flex items-center justify-between">
        <span className="typo-label-lg text-text-default">{item.name}</span>
        <span className={`typo-label-lg ${statusColor}`}>{item.status}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-muted">
        <div data-slot="freshness" className={`h-full rounded-full ${barColor}`} style={{ width: `${item.freshness}%` }} />
      </div>
      <span className="self-end typo-label-md text-text-muted">{item.purchasedOn}</span>
    </div>
  );
}
```

(주의: `text-text-success` 등은 정적 리터럴 삼항으로만 조합 — 템플릿 문자열 내 동적 생성 금지 규칙 준수 형태임.)

- [ ] **Step 4: SettingRow 구현**

```tsx
import type { ReactNode } from "react";
import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";

export interface SettingRowProps {
  icon: IconName;
  label: string;
  value?: string;
  chevron?: boolean;
  /** 우측 커스텀 컨트롤(토글 등) — value·chevron 대신 사용 */
  control?: ReactNode;
}

/** 마이페이지 설정 행 — 아이콘·라벨·우측 값/셰브론 또는 컨트롤. */
export function SettingRow({ icon, label, value, chevron = false, control }: SettingRowProps) {
  return (
    <div className="flex min-h-12 items-center gap-3 py-2">
      <Icon name={icon} size={20} className="shrink-0 text-text-subtle" />
      <span className="flex-1 typo-body-lg text-text-default">{label}</span>
      {control ?? (
        <span className="flex items-center gap-1.5">
          {value && <span className="typo-body-md text-text-subtle">{value}</span>}
          {chevron && <Icon name="chevron-right" size={16} className="text-text-placeholder" />}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 5: 통과 확인** — Run: `npx vitest --project storybook run` → PASS.
- [ ] **Step 6: Commit** — `git commit -m "feat(blocks): IngredientRow·SettingRow 추가"`

---

### Task 6: (tabs) 레이아웃 + 홈 페이지

**Files:**
- Create: `src/app/(tabs)/layout.tsx`, `src/app/(tabs)/page.tsx`, `src/app/(tabs)/page.stories.tsx`

**Interfaces:**
- Consumes: `AppTabBar`, `HeroRecipeCard`, `RecipeCard`, `RECIPES`, `Button`, `IconButton`, `Icon`
- Produces: `/` 라우트. 레퍼런스 `references/02-home.png`.

- [ ] **Step 1: (tabs)/layout.tsx**

```tsx
import { AppTabBar } from "@/blocks/app-tab-bar/AppTabBar";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-28 sm:px-6 lg:px-8">{children}</div>
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md">
        <AppTabBar />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 홈 page.tsx** — 카피는 레퍼런스 원문 그대로:

```tsx
import { HeroRecipeCard } from "@/blocks/hero-recipe-card/HeroRecipeCard";
import { RecipeCard } from "@/blocks/recipe-card/RecipeCard";
import { RECIPES } from "@/data/recipes";
import { Icon } from "@/foundation/icon/Icon";
import { Button } from "@/ui/button/Button";
import { IconButton } from "@/ui/icon-button/IconButton";

export default function HomePage() {
  const [hero, ...others] = RECIPES;

  return (
    <main className="flex flex-col gap-5 pt-8">
      <header className="flex flex-col gap-1">
        <span className="typo-label-lg text-text-muted">8월 4일 화요일 · 저녁</span>
        <div className="flex items-center justify-between gap-2">
          <h1 className="typo-display-sm text-text-default">소진님, 오늘 이 다섯 중에요</h1>
          <div className="flex shrink-0 gap-1">
            <IconButton icon="search" size="md" aria-label="검색" />
            <IconButton icon="settings" size="md" aria-label="설정" />
          </div>
        </div>
      </header>

      <div className="flex items-center gap-3 rounded-card bg-background-warning-subtle px-4 py-3">
        <Icon name="battery-low" size={20} className="shrink-0 text-text-warning" />
        <div className="flex flex-1 flex-col">
          <span className="typo-label-lg text-text-default">오늘 좀 지쳤어요</span>
          <span className="typo-label-md text-text-subtle">15분 · 1구 · 설거지 최소 메뉴</span>
        </div>
        <Icon name="chevron-right" size={16} className="shrink-0 text-text-placeholder" />
      </div>

      <HeroRecipeCard recipe={hero} />

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="typo-heading-sm text-text-default">그 외 추천 4개</h2>
          <span className="typo-label-md text-text-muted">주재료·조리법이 겹치지 않아요</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {others.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      <Button variant="secondary" size="lg" fullWidth leadingIcon="refresh">
        5개 모두 새로 추천받기
      </Button>
    </main>
  );
}
```

- [ ] **Step 3: 홈 page.stories.tsx**

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import HomePage from "./page";

const meta = {
  component: HomePage,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("소진님, 오늘 이 다섯 중에요")).toBeInTheDocument();
    await expect(canvas.getAllByRole("link")).toHaveLength(6); // 히어로 CTA 1 + 카드 4 + ... 실제 수에 맞게 조정
  },
};
```

(링크 수는 구현 후 실측으로 조정. 최소한 타이틀·카드 4개 렌더 확인은 유지.)

- [ ] **Step 4: 검증** — Run: `npx vitest --project storybook run` → PASS. Run: `npm run build` → 성공.
- [ ] **Step 5: Commit** — `git commit -m "feat: 홈 페이지 및 탭 레이아웃 구현"`

---

### Task 7: 레시피 상세 페이지

**Files:**
- Create: `src/app/recipes/[id]/page.tsx`

**Interfaces:**
- Consumes: `findRecipe`, `RECIPES`, `Badge`, `Button`, `CardPill`, `Icon`, `IconButton`, `next/image`, `next/link`, `notFound`
- Produces: `/recipes/[id]` (5개 id 정적 생성). 레퍼런스 `references/05-recipe-detail.png`.

- [ ] **Step 1: page.tsx 작성** — async 페이지, `PageProps` 전역 타입(없으면 `{ params: Promise<{ id: string }> }`):

```tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findRecipe, RECIPES } from "@/data/recipes";
import { Icon } from "@/foundation/icon/Icon";
import { Badge } from "@/ui/badge/Badge";
import { Button } from "@/ui/button/Button";
import { CardPill } from "@/ui/card/Card";
import { IconButton } from "@/ui/icon-button/IconButton";

export function generateStaticParams() {
  return RECIPES.map(({ id }) => ({ id }));
}

export default async function RecipeDetailPage({ params }: PageProps<"/recipes/[id]">) {
  const { id } = await params;
  const recipe = findRecipe(id);
  if (!recipe) notFound();
  const { detail } = recipe;

  return (
    <main className="mx-auto flex w-full max-w-[768px] flex-col pb-24">
      {/* 히어로 */}
      <div className="relative h-[230px] w-full md:mt-6 md:overflow-hidden md:rounded-card">
        <Image src={recipe.heroImage ?? recipe.image} alt={recipe.name} fill className="object-cover" priority />
        <div className="absolute inset-x-4 top-4 flex justify-between">
          <Link href="/" aria-label="뒤로 가기">
            <IconButton icon="arrow-left" variant="circle-neutral" tabIndex={-1} aria-label="뒤로 가기" />
          </Link>
          <IconButton icon="bookmark" variant="circle-neutral" aria-label="북마크" />
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-5 md:px-0">
        <header className="flex flex-col gap-3">
          <h1 className="typo-display-sm text-text-default">{recipe.name}</h1>
          <div className="flex flex-wrap gap-1.5">
            <CardPill>{recipe.time}</CardPill>
            <CardPill>{recipe.burners}</CardPill>
            <CardPill>{recipe.dishes}</CardPill>
            <CardPill>{recipe.serving}</CardPill>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {detail.badges.map(({ label, variant }) => (
              <Badge key={label} variant={variant} size="lg">
                {label}
              </Badge>
            ))}
          </div>
        </header>

        {/* 장보기 비용 카드 */}
        <section className="flex flex-col gap-4 rounded-card border border-border-default bg-background-surface p-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <span className="typo-label-md text-text-muted">이번 장보기</span>
              <span className="typo-display-sm text-text-default">{detail.cost.total}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="typo-label-md text-text-muted">이걸로</span>
              <span className="typo-display-sm text-text-brand">{detail.cost.meals}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 typo-label-md text-text-subtle">이 메뉴 한 끼</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-background-muted">
                <div className="h-full w-[11%] rounded-full bg-background-brand" />
              </div>
              <span className="shrink-0 typo-label-lg text-text-default">{detail.cost.mealCost}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 typo-label-md text-text-subtle">배달 한 끼 평균</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-background-muted">
                <div className="h-full w-full rounded-full bg-background-strong" />
              </div>
              <span className="shrink-0 typo-label-lg text-text-default">{detail.cost.deliveryCost}</span>
            </div>
          </div>
          <p className="typo-label-md text-text-muted">
            동네 마트 평균 시세(KAMIS) 기준 추정가예요. 실제 영수증과 다를 수 있어요.
          </p>
        </section>

        {/* 재료 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="typo-heading-sm text-text-default">재료 · 1인분</h2>
            <span className="typo-label-md text-text-muted">{detail.ingredients.length}가지</span>
          </div>
          <p className="flex items-start gap-2 rounded-xl bg-background-error-subtle p-3 typo-label-md text-text-error">
            <Icon name="scale" size={16} className="mt-0.5 shrink-0" />
            {detail.recalcNote}
          </p>
          <div className="flex flex-col rounded-card border border-border-default bg-background-surface px-4">
            {detail.ingredients.map((ingredient) => (
              <div key={ingredient.name} className="flex flex-col border-b border-border-subtle py-3.5 last:border-b-0">
                <div className="flex items-center gap-2.5">
                  <Icon
                    name={ingredient.toBuy ? "circle-plus" : "circle-check"}
                    size={20}
                    className={ingredient.toBuy ? "shrink-0 text-text-brand" : "shrink-0 text-text-success"}
                  />
                  <span className="flex-1 typo-label-lg text-text-default">{ingredient.name}</span>
                  <span className="typo-body-md text-text-subtle">{ingredient.qty}</span>
                  <Badge variant={ingredient.toBuy ? "warning" : "success"}>{ingredient.toBuy ? "사야 함" : "있음"}</Badge>
                </div>
                {ingredient.toBuy && (
                  <Button variant="secondary" size="md" fullWidth leadingIcon="link" trailingIcon="arrow-right" className="mt-3">
                    쿠팡에서 주문
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="typo-label-md text-text-muted">
            부족한 재료는 쿠팡에서 바로 주문할 수 있어요 · 쿠팡 파트너스 링크(광고 포함)
          </p>
        </section>

        {/* 영상 */}
        <section className="flex flex-col gap-3">
          <h2 className="typo-heading-sm text-text-default">보면서 따라 하기</h2>
          <div className="flex flex-col gap-3 rounded-card border border-border-default bg-background-surface p-4">
            <div className="flex gap-3">
              <div className="relative h-[62px] w-24 shrink-0 overflow-hidden rounded-lg">
                <Image src="/images/youtube-thumb.jpg" alt="" fill className="object-cover" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="typo-label-md text-text-brand">{detail.video.channel}</span>
                <span className="typo-label-lg text-text-default">{detail.video.title}</span>
                <span className="typo-label-md text-text-muted">{detail.video.meta}</span>
              </div>
            </div>
            <Button size="lg" fullWidth leadingIcon="play">
              유튜브에서 영상 보기
            </Button>
            <span className="text-center typo-label-md text-text-muted">{detail.video.url}</span>
          </div>
        </section>

        {/* 순서 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="typo-heading-sm text-text-default">순서</h2>
            <span className="typo-label-md text-text-muted">{recipe.time}</span>
          </div>
          <ol className="flex flex-col gap-2.5">
            {detail.steps.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-card border border-border-default bg-background-surface p-4">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background-muted typo-label-md text-text-subtle">
                  {index + 1}
                </span>
                <p className="typo-body-md text-text-default">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-background-surface-translucent px-4 py-3 backdrop-blur">
        <div className="mx-auto w-full max-w-[768px]">
          <Button size="lg" fullWidth leadingIcon="check">
            다 만들었어요
          </Button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: 검증** — Run: `npm run build` → `/recipes/[id]` 5개 정적 생성 확인. `npx tsc --noEmit` 그린. (`PageProps` 전역 타입 미존재 시 명시 타입으로 폴백.)
- [ ] **Step 3: Commit** — `git commit -m "feat: 레시피 상세 페이지 구현"`

---

### Task 8: 냉장고 페이지

**Files:**
- Create: `src/app/(tabs)/fridge/page.tsx`, `src/app/(tabs)/fridge/page.stories.tsx`

**Interfaces:**
- Consumes: `IngredientRow`, `FRIDGE_ITEMS`/`URGENT_ITEMS`/`FRIDGE_STATS`, `Button`, `Icon`, `next/link`
- Produces: `/fridge`. 레퍼런스 `references/07-fridge.png`.

- [ ] **Step 1: page.tsx 작성**

```tsx
import Link from "next/link";
import { IngredientRow } from "@/blocks/ingredient-row/IngredientRow";
import { FRIDGE_ITEMS, FRIDGE_STATS, URGENT_ITEMS } from "@/data/fridge";
import { Icon } from "@/foundation/icon/Icon";
import { Button } from "@/ui/button/Button";

export default function FridgePage() {
  return (
    <main className="flex flex-col gap-5 pt-8">
      <header className="flex flex-col gap-1">
        <h1 className="typo-display-sm text-text-default">내 냉장고</h1>
        <p className="typo-body-md text-text-subtle">등록은 선택이에요. 비어 있어도 추천은 나옵니다.</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {FRIDGE_STATS.map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-0.5 rounded-card border border-border-default bg-background-surface p-4">
            <span className="typo-heading-md text-text-default">{value}</span>
            <span className="typo-label-md text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3 rounded-card bg-background-warning-subtle p-4">
        <span className="flex items-center gap-1.5 typo-label-lg text-text-warning">
          <Icon name="clock-alert" size={16} />곧 상해요
        </span>
        {URGENT_ITEMS.map(({ name, note, recipeName, recipeId }) => (
          <div key={name} className="flex items-center gap-3 rounded-xl bg-background-surface p-3.5">
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="typo-label-lg text-text-default">{name}</span>
              <span className="typo-label-md text-text-muted">{note}</span>
            </div>
            {recipeId ? (
              <Link href={`/recipes/${recipeId}`}>
                <Button size="sm" tabIndex={-1}>{recipeName}</Button>
              </Link>
            ) : (
              <Button size="sm">{recipeName}</Button>
            )}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="typo-heading-sm text-text-default">전체 재료</h2>
          <span className="typo-label-md text-text-subtle">신선한 순</span>
        </div>
        <div className="rounded-card border border-border-default bg-background-surface px-4 md:columns-2 md:gap-8 lg:columns-3">
          {FRIDGE_ITEMS.map((item) => (
            <div key={item.name} className="break-inside-avoid border-b border-border-subtle last:border-b-0">
              <IngredientRow item={item} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" fullWidth leadingIcon="receipt-text">영수증으로 담기</Button>
        <Button variant="secondary" size="lg" fullWidth leadingIcon="plus">직접 추가</Button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: page.stories.tsx** — 홈과 같은 형식(component: FridgePage, `nextjs: { appDirectory: true }`), play에서 `canvas.getByText("내 냉장고")`와 `canvas.getByText("콩나물")` 확인.
- [ ] **Step 3: 검증** — Run: `npx vitest --project storybook run` → PASS.
- [ ] **Step 4: Commit** — `git commit -m "feat: 냉장고 페이지 구현"`

---

### Task 9: 마이페이지

**Files:**
- Create: `src/app/(tabs)/my/page.tsx`, `src/app/(tabs)/my/page.stories.tsx`

**Interfaces:**
- Consumes: `SettingRow`, `Switch`, `Chip`, `Icon`
- Produces: `/my`. 레퍼런스 `references/10-my.png`.

- [ ] **Step 1: page.tsx 작성** — 섹션 카드는 lg 2열(`lg:grid lg:grid-cols-2 lg:gap-4`), 카피 원문 그대로:

```tsx
import { SettingRow } from "@/blocks/setting-row/SettingRow";
import { Icon } from "@/foundation/icon/Icon";
import { Chip } from "@/ui/chip/Chip";
import { Switch } from "@/ui/switch/Switch";

const CARD = "rounded-card border border-border-default bg-background-surface";

export default function MyPage() {
  return (
    <main className="flex flex-col gap-5 pt-8">
      <h1 className="typo-display-sm text-text-default">마이페이지</h1>

      <div className={`${CARD} flex items-center gap-3.5 p-4`}>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background-brand-subtle text-text-brand">
          <Icon name="chef-hat" size={24} />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="typo-heading-sm text-text-default">소진님</span>
          <span className="typo-label-md text-text-muted">집밥 34일째 · 총 62끼 · 절약 384,000원</span>
        </div>
      </div>

      <div className={`${CARD} flex flex-col gap-3.5 p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="typo-label-lg text-text-default">저녁 추천 알림</span>
            <span className="typo-body-md text-text-subtle">묻기 전에 먼저 보내드리는 하루 한 번의 알림</span>
          </div>
          <Switch defaultChecked label="제철 재료 알림" className="shrink-0 flex-row-reverse" />
        </div>
        <div className="flex gap-2">
          <Chip selected>17:30</Chip>
          <Chip>18:30</Chip>
          <Chip>퇴근할 때</Chip>
        </div>
        <p className="typo-label-md text-text-muted">장 보기 전에 받아 보고 싶다면 퇴근 시간대로 맞춰 두세요.</p>
      </div>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
        <section className="flex flex-col gap-2">
          <h2 className="typo-label-md text-text-muted">추천 맞춤</h2>
          <div className={`${CARD} flex flex-col px-4 py-1.5`}>
            <SettingRow icon="heart" label="취향 다시 설정" value="3문항" chevron />
            <SettingRow icon="ban" label="못 먹는 재료" value="2개" chevron />
            <SettingRow icon="flame" label="주방 환경" value="1구 · 에어프라이어" chevron />
            <SettingRow icon="wallet" label="월 식비 목표" value="300,000원" chevron />
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="typo-label-md text-text-muted">표시 방식</h2>
          <div className={`${CARD} flex flex-col px-4 py-1.5`}>
            <SettingRow icon="scale" label="계량 단위" value="밥숟갈 · 종이컵" chevron />
            <SettingRow icon="comment" label="재고 확인 질문" control={<Switch defaultChecked label="제철 재료 알림" />} />
            <SettingRow icon="languages" label="가격 표시" value="장보기 총액 우선" chevron />
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="typo-label-md text-text-muted">기타</h2>
          <div className={`${CARD} flex flex-col px-4 py-1.5`}>
            <SettingRow icon="shield-check" label="데이터 · 개인정보" chevron />
            <SettingRow icon="comment" label="의견 보내기" chevron />
            <SettingRow icon="info" label="버전" value="1.0.0" />
          </div>
        </section>
      </div>
    </main>
  );
}
```

(참고: `CARD` 상수는 정적 문자열 합성이므로 Tailwind 스캐너가 감지함 — 동적 조합 아님.)

- [ ] **Step 2: page.stories.tsx** — play: `getByText("마이페이지")`, `getByText("소진님")` 확인.
- [ ] **Step 3: 검증** — Run: `npx vitest --project storybook run` → PASS.
- [ ] **Step 4: Commit** — `git commit -m "feat: 마이페이지 구현"`

---

### Task 10: 로그인 페이지

**Files:**
- Create: `src/app/login/page.tsx`, `src/app/login/page.stories.tsx`

**Interfaces:**
- Consumes: `Icon`, `Button`, `next/link`
- Produces: `/login`. 레퍼런스 `references/00-login.png`. 구글 G 로고는 페이지 내 인라인 SVG(브랜드 4색은 tokens의 `--color-logo-google-*` hex와 동일값 — SVG fill 특성상 인라인 hex 허용).

- [ ] **Step 1: page.tsx 작성**

```tsx
import Link from "next/link";
import { Icon } from "@/foundation/icon/Icon";
import { Button } from "@/ui/button/Button";

const FEATURES = [
  { icon: "timer", title: "1분 안에 오늘 저녁 확정", desc: "열면 추천 6개가 이미 와 있어요" },
  { icon: "scale", title: "1인분 현실 계량", desc: "밥숟갈·종이컵으로 알려드려요" },
  { icon: "wallet", title: "배달 대비 절약 기록", desc: "이번 달 얼마 아꼈는지 보여요" },
] as const;

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285f4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.2z" />
      <path fill="#34a853" d="M24 46c6 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.2 15.5 46 24 46z" />
      <path fill="#fbbc05" d="M11.8 28.3c-.5-1.3-.7-2.8-.7-4.3s.3-3 .7-4.3V14H4.5C3 17 2 20.4 2 24s1 7 2.5 10l7.3-5.7z" />
      <path fill="#ea4335" d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 30 2 24 2 15.5 2 8.1 6.8 4.5 14l7.3 5.7c1.7-5.2 6.5-9 12.2-9z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-background-brand text-text-on-brand">
          <Icon name="chef-hat" size={32} />
        </span>
        <span className="typo-label-lg text-text-brand">오늘의 집밥</span>
        <h1 className="typo-display-sm text-text-default">묻기 전에 먼저 고를게요</h1>
        <p className="typo-body-md text-text-subtle">
          냉장고 사정과 오늘 기력에 맞는 저녁 6개를 근거와 함께 보여드려요.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3.5 rounded-card border border-border-default bg-background-surface p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background-brand-subtle text-text-brand">
              <Icon name={icon} size={20} />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="typo-label-lg text-text-default">{title}</span>
              <span className="typo-body-md text-text-subtle">{desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Link href="/">
          <Button variant="secondary" size="lg" fullWidth tabIndex={-1}>
            <GoogleLogo />
            Google로 계속하기
          </Button>
        </Link>
        <p className="text-center typo-label-md text-text-muted">
          계속하면 이용약관과 개인정보 처리방침에 동의하는 것으로 봅니다.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: page.stories.tsx** — play: `getByText("묻기 전에 먼저 고를게요")` + `getByRole("link", { name: /Google로 계속하기/ })`의 href가 `/`인지 확인.
- [ ] **Step 3: 검증** — Run: `npx vitest --project storybook run` → PASS.
- [ ] **Step 4: Commit** — `git commit -m "feat: 로그인 페이지 구현"`

---

### Task 11: 최종 검증 (빌드 + 시각 QA)

**Files:** 수정 없음 (발견된 결함은 이 태스크에서 수정 커밋)

- [ ] **Step 1: 전체 테스트·빌드** — Run: `npx vitest --project storybook run` → 전체 그린. Run: `npm run build` → 성공, 라우트 목록에 `/`, `/login`, `/fridge`, `/my`, `/recipes/[id]`(SSG 5개) 확인.
- [ ] **Step 2: 개발 서버 + 시각 대조** — `npm run dev` 후 브라우저(wmux browser)로 5개 라우트를 각각 열어:
  - 360px 폭에서 `docs/superpowers/plans/references/*.png`와 대조 (구조·카피·색·간격)
  - 768px/1280px/1440px 폭에서: 홈 그리드 3열/4열, 냉장고 2열/3열, 마이 2열, 1280 초과 시 좌우 여백 확인
  - 탭바 내비게이션(홈↔냉장고↔마이), 홈 카드→상세, 상세 뒤로가기, 로그인→홈 링크 동작 확인
- [ ] **Step 3: 불일치 수정** — 발견된 차이는 수정 후 `npx vitest --project storybook run` 재확인, 커밋.
- [ ] **Step 4: 최종 Commit** — 남은 변경 커밋: `git commit -m "fix: 시각 QA 결함 수정"` (없으면 생략)

---

## Self-Review 결과

- 스펙 커버리지: 5개 라우트(T6~T10), 반응형 규칙(T6 그리드·T7 max-w-768·T8 열 확장·T9 2열·T10 400px), 탭바 유지(T3·T6), StatusBar 제외(전 태스크), 목 데이터·이미지(T1·완료된 에셋), 폰트·lang(T1), SSOT 블록+스토리(T2~T5), 검증(T11) — 전부 매핑됨.
- 타입 일관성: `Recipe.detail` 필수(모든 픽스처 포함), `FridgeItem.statusTone`·`RecipeBadge.variant` 리터럴 유니언이 Badge variant와 호환, `findRecipe` 시그니처 일치 확인.
- 조정 허용 지점(placeholder 아님): 홈 스토리 링크 개수 실측 조정, `LayoutProps`/`PageProps` 전역 타입 폴백, Link 안 Button a11y 경고 시 대체 패턴 — 각각 대응 방법을 본문에 명시함.
