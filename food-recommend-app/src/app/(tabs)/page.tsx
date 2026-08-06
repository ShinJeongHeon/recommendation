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
