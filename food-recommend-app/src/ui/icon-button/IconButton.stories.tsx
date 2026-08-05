import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { IconButton } from "./IconButton";

const meta = {
  title: "UI/IconButton",
  component: IconButton,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** B/IconButton — ghost · circle-brand · circle-neutral (48, 아이콘 24) */
export const Variants: Story = {
  args: { icon: "heart", "aria-label": "하트" },
  render: () => (
    <div className="flex items-center gap-3 bg-background-default p-6">
      <IconButton icon="heart" aria-label="고스트" />
      <IconButton icon="heart" variant="circle-brand" aria-label="브랜드 원형" />
      <IconButton icon="heart" variant="circle-neutral" aria-label="뉴트럴 원형" />
    </div>
  ),
  play: async ({ canvas }) => {
    const ghost = canvas.getByRole("button", { name: "고스트" });
    const ghostStyle = getComputedStyle(ghost);
    await expect(ghostStyle.width).toBe("48px");
    await expect(ghostStyle.height).toBe("48px");
    await expect(ghostStyle.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect(ghostStyle.color).toBe("rgb(28, 26, 22)");

    const brand = canvas.getByRole("button", { name: "브랜드 원형" });
    await expect(getComputedStyle(brand).backgroundColor).toBe("rgb(226, 85, 43)");
    await expect(getComputedStyle(brand).color).toBe("rgb(255, 255, 255)");

    const neutral = canvas.getByRole("button", { name: "뉴트럴 원형" });
    await expect(getComputedStyle(neutral).backgroundColor).toBe("rgb(28, 26, 22)");
    await expect(neutral.querySelector("svg")?.getAttribute("width")).toBe("24");
  },
};

/** sm(32) · md(40) · lg(48) — 화면에서 쓰인 축소 오버라이드와 동일 */
export const Sizes: Story = {
  args: { icon: "heart", "aria-label": "하트" },
  render: () => (
    <div className="flex items-center gap-3 bg-background-default p-6">
      <IconButton icon="close" size="sm" aria-label="닫기 sm" />
      <IconButton icon="more-vertical" size="md" aria-label="더보기 md" />
      <IconButton icon="heart" size="lg" aria-label="하트 lg" />
    </div>
  ),
  play: async ({ canvas }) => {
    const sm = canvas.getByRole("button", { name: "닫기 sm" });
    await expect(getComputedStyle(sm).width).toBe("32px");
    await expect(sm.querySelector("svg")?.getAttribute("width")).toBe("20");
    const lg = canvas.getByRole("button", { name: "하트 lg" });
    await expect(getComputedStyle(lg).width).toBe("48px");
    await expect(lg.querySelector("svg")?.getAttribute("width")).toBe("24");
  },
};

export const Click: Story = {
  args: { icon: "heart", "aria-label": "좋아요", onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "좋아요" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
