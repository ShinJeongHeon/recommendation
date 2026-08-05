import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { BottomNav } from "./BottomNav";

const meta = {
  title: "UI/BottomNav",
  component: BottomNav,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  { label: "홈", icon: "home", activeIcon: "home-fill" },
  { label: "냉장고", icon: "refrigerator" },
  { label: "기록", icon: "calendar", activeIcon: "calendar-fill" },
  { label: "마이", icon: "user", activeIcon: "user-fill" },
  { label: "검색", icon: "search", activeIcon: "search-fill" },
] as const;

/** C/BottomNav — 선택: 필 아이콘 + 브랜드 컬러, 미선택: 아웃라인 + 뉴트럴 */
export const Default: Story = {
  args: { items: [...ITEMS], activeIndex: 0, onSelect: fn() },
  render: (args) => (
    <div className="w-[360px] bg-background-default">
      <BottomNav {...args} />
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const nav = canvas.getByRole("navigation");
    await expect(getComputedStyle(nav).height).toBe("56px");
    await expect(getComputedStyle(nav).borderTopColor).toBe("rgb(227, 218, 202)");

    const active = canvas.getByRole("button", { name: "홈" });
    await expect(active).toHaveAttribute("aria-current", "page");
    await expect(getComputedStyle(active).color).toBe("rgb(193, 63, 25)");

    const inactive = canvas.getByRole("button", { name: "냉장고" });
    await expect(getComputedStyle(inactive).color).toBe("rgb(107, 101, 88)");

    await userEvent.click(inactive);
    await expect(args.onSelect).toHaveBeenCalledWith(1);
  },
};

/** 레이블 제외 구성 (아이콘만) */
export const IconsOnly: Story = {
  args: { items: ITEMS.slice(0, 4).map(({ label, icon }) => ({ label, icon })), showLabels: false },
  render: (args) => (
    <div className="w-[360px] bg-background-default">
      <BottomNav {...args} />
    </div>
  ),
};
