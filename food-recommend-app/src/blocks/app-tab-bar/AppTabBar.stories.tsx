import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { AppTabBar } from "./AppTabBar";

const meta = {
  title: "Blocks/AppTabBar",
  component: AppTabBar,
  parameters: {
    layout: "centered",
    nextjs: { appDirectory: true, navigation: { pathname: "/fridge" } },
  },
  tags: ["ai-generated"],
} satisfies Meta<typeof AppTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 현재 경로(/fridge)와 일치하는 탭이 활성화된다. */
export const FridgeActive: Story = {
  render: () => (
    <div className="w-[360px]">
      <AppTabBar />
    </div>
  ),
  play: async ({ canvas }) => {
    const active = canvas.getByRole("button", { name: /냉장고/ });
    await expect(active).toHaveAttribute("aria-current", "page");
    const home = canvas.getByRole("button", { name: /홈/ });
    await expect(home).not.toHaveAttribute("aria-current");
  },
};
