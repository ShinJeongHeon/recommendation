import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { TabNav } from "./TabNav";

const meta = {
  title: "UI/TabNav",
  component: TabNav,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof TabNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const indicatorOf = (tab: HTMLElement) =>
  tab.querySelector('[data-slot="indicator"]') as HTMLElement;

/** C/TabNav — 높이 48, 선택 탭 브랜드 레이블 + 하단 2px 인디케이터 */
export const Default: Story = {
  args: { tabs: ["추천", "최근", "저장", "전체"], activeIndex: 0 },
  render: (args) => (
    <div className="w-[360px] bg-background-default">
      <TabNav {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const tablist = canvas.getByRole("tablist");
    await expect(getComputedStyle(tablist).height).toBe("48px");

    const active = canvas.getByRole("tab", { name: "추천" });
    await expect(active).toHaveAttribute("aria-selected", "true");
    const indicator = indicatorOf(active);
    await expect(getComputedStyle(indicator).height).toBe("2px");
    await expect(getComputedStyle(indicator).backgroundColor).toBe("rgb(226, 85, 43)");

    const inactive = canvas.getByRole("tab", { name: "최근" });
    await expect(getComputedStyle(indicatorOf(inactive)).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  },
};

function TabNavDemo() {
  const [index, setIndex] = useState(0);
  return (
    <div className="w-[360px] bg-background-default">
      <TabNav tabs={["추천", "최근", "저장"]} activeIndex={index} onSelect={setIndex} />
    </div>
  );
}

export const Interaction: Story = {
  args: { tabs: ["추천", "최근", "저장"] },
  render: () => <TabNavDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "최근" }));
    await expect(canvas.getByRole("tab", { name: "최근" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tab", { name: "추천" })).toHaveAttribute("aria-selected", "false");
  },
};
