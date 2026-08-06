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
          <div
            key={label}
            className="flex flex-col gap-0.5 rounded-card border border-border-default bg-background-surface p-4"
          >
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
                <Button size="sm" tabIndex={-1}>
                  {recipeName}
                </Button>
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
        <Button size="lg" fullWidth leadingIcon="receipt-text">
          영수증으로 담기
        </Button>
        <Button variant="secondary" size="lg" fullWidth leadingIcon="plus">
          직접 추가
        </Button>
      </div>
    </main>
  );
}
