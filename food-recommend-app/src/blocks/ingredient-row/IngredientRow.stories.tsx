import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { IngredientRow } from "./IngredientRow";

const meta = {
  title: "Blocks/IngredientRow",
  component: IngredientRow,
  parameters: { layout: "centered" },
  tags: ["ai-generated"],
} satisfies Meta<typeof IngredientRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 신선한 재료 — 그린 상태 텍스트·바. */
export const Fresh: Story = {
  args: {
    item: { name: "계란", status: "2주 남음", statusTone: "success", freshness: 65, purchasedOn: "8월 2일 구매" },
  },
  render: (args) => (
    <div className="w-80">
      <IngredientRow {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("2주 남음")).toBeInTheDocument();
    const bar = canvasElement.querySelector<HTMLElement>("[data-slot=freshness]");
    await expect(bar).not.toBeNull();
    await expect(bar!.style.width).toBe("65%");
  },
};

/** 임박 재료 — 앰버 상태 텍스트·바. */
export const Warning: Story = {
  args: {
    item: { name: "콩나물", status: "2일 남음", statusTone: "warning", freshness: 18, purchasedOn: "8월 1일 구매" },
  },
  render: Fresh.render,
};
