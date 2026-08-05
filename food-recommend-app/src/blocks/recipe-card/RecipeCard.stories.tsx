import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { RECIPES } from "@/data/recipes";
import { RecipeCard } from "./RecipeCard";

const meta = {
  title: "Blocks/RecipeCard",
  component: RecipeCard,
  parameters: { layout: "centered", nextjs: { appDirectory: true } },
  tags: ["ai-generated"],
} satisfies Meta<typeof RecipeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 홈 추천 그리드 카드 — 전체가 상세 페이지 링크. */
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
    await expect(canvas.getByText("12분")).toBeInTheDocument();
  },
};
