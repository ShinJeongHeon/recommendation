import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/data/recipes";
import { Card, CardPill } from "@/ui/card/Card";

/** 홈 추천 그리드 카드 — 사진·이름·추천 이유·조리 시간. */
export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block">
      <Card
        media={<Image src={recipe.image} alt="" width={316} height={176} />}
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
