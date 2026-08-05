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
