import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { StatusBar } from "./StatusBar";

const meta = {
  title: "UI/StatusBar",
  component: StatusBar,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof StatusBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** C/StatusBar — 디바이스 상태바 (목업·프리뷰용) */
export const Default: Story = {
  render: () => (
    <div className="w-[360px] bg-background-default">
      <StatusBar />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("12:45")).toBeVisible();
    await expect(canvasElement.querySelectorAll("svg")).toHaveLength(3);
  },
};
