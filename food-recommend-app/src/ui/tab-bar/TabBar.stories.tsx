import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { TabBar } from "./TabBar";

const meta = {
  title: "UI/TabBar",
  component: TabBar,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  { label: "홈", icon: "home" },
  { label: "냉장고", icon: "refrigerator" },
  { label: "기록", icon: "calendar" },
  { label: "마이", icon: "user" },
] as const;

/** C/TabBar — 플로팅 필 내비게이션. 선택 탭은 브랜드 서브틀 배경 + 브랜드 컬러 */
export const Default: Story = {
  args: { items: [...ITEMS], activeIndex: 0, onSelect: fn() },
  render: (args) => (
    <div className="w-[360px] bg-background-default pt-6">
      <TabBar {...args} />
    </div>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const nav = canvas.getByRole("navigation");
    const navStyle = getComputedStyle(nav);
    await expect(navStyle.height).toBe("56px");
    await expect(navStyle.borderRadius).toBe("28px");

    const active = canvas.getByRole("button", { name: "홈" });
    await expect(getComputedStyle(active).backgroundColor).toBe("rgb(253, 230, 220)");
    await expect(getComputedStyle(active).color).toBe("rgb(193, 63, 25)");
    await expect(active.querySelector("svg")?.getAttribute("width")).toBe("20");

    const inactive = canvas.getByRole("button", { name: "기록" });
    await expect(getComputedStyle(inactive).color).toBe("rgb(163, 155, 139)");

    await userEvent.click(inactive);
    await expect(args.onSelect).toHaveBeenCalledWith(2);
  },
};
