import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Badge } from "./Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** D/Badge — neutral·success·error·info·warning */
export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-2 bg-background-surface p-6">
      <Badge variant="neutral">재고 있음</Badge>
      <Badge variant="success">신선</Badge>
      <Badge variant="error">기한 초과</Badge>
      <Badge variant="info">추천</Badge>
      <Badge variant="warning">임박</Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    const neutral = canvas.getByText("재고 있음");
    await expect(getComputedStyle(neutral).backgroundColor).toBe("rgb(239, 232, 219)");
    await expect(getComputedStyle(neutral).color).toBe("rgb(28, 26, 22)");
    await expect(getComputedStyle(neutral).height).toBe("20px");

    await expect(getComputedStyle(canvas.getByText("신선")).backgroundColor).toBe("rgb(94, 122, 85)");
    await expect(getComputedStyle(canvas.getByText("기한 초과")).backgroundColor).toBe("rgb(201, 50, 48)");
    await expect(getComputedStyle(canvas.getByText("추천")).backgroundColor).toBe("rgb(45, 111, 184)");

    const warning = canvas.getByText("임박");
    await expect(getComputedStyle(warning).backgroundColor).toBe("rgb(244, 197, 67)");
    await expect(getComputedStyle(warning).color).toBe("rgb(36, 25, 4)");
  },
};

/** md(20) · lg(24) */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2 bg-background-surface p-6">
      <Badge size="md">md 20</Badge>
      <Badge size="lg">lg 24</Badge>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText("md 20")).height).toBe("20px");
    const lg = canvas.getByText("lg 24");
    await expect(getComputedStyle(lg).height).toBe("24px");
    await expect(getComputedStyle(lg).paddingLeft).toBe("8px");
  },
};
