import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { RECIPES } from "@/data/recipes";
import { HeroRecipeCard } from "./HeroRecipeCard";

const meta = {
  title: "Blocks/HeroRecipeCard",
  component: HeroRecipeCard,
  parameters: { layout: "centered", nextjs: { appDirectory: true } },
  tags: ["ai-generated"],
} satisfies Meta<typeof HeroRecipeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 홈 히어로 카드 — 오늘의 한 접시. */
export const Default: Story = {
  args: { recipe: RECIPES[0] },
  render: (args) => (
    <div className="w-80">
      <HeroRecipeCard {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("애호박 새우젓 덮밥")).toBeInTheDocument();
    await expect(canvas.getByText("오늘의 한 접시")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: /이걸로 만들기/ })).toHaveAttribute(
      "href",
      "/recipes/hobak-deopbap",
    );
  },
};
