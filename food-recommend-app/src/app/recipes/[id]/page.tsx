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
              <div
                key={ingredient.name}
                className="flex flex-col border-b border-border-subtle py-3.5 last:border-b-0"
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    name={ingredient.toBuy ? "circle-plus" : "circle-check"}
                    size={20}
                    className={ingredient.toBuy ? "shrink-0 text-text-brand" : "shrink-0 text-text-success"}
                  />
                  <span className="flex-1 typo-label-lg text-text-default">{ingredient.name}</span>
                  <span className="typo-body-md text-text-subtle">{ingredient.qty}</span>
                  <Badge variant={ingredient.toBuy ? "warning" : "success"}>
                    {ingredient.toBuy ? "사야 함" : "있음"}
                  </Badge>
                </div>
                {ingredient.toBuy && (
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    leadingIcon="link"
                    trailingIcon="arrow-right"
                    className="mt-3"
                  >
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
