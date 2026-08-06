import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import MyPage from "./page";

const meta = {
  title: "Pages/My",
  component: MyPage,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  tags: ["ai-generated"],
} satisfies Meta<typeof MyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("마이페이지")).toBeInTheDocument();
    await expect(canvas.getByText("소진님")).toBeInTheDocument();
    await expect(canvas.getByText("취향 다시 설정")).toBeInTheDocument();
    const switches = canvas.getAllByRole("switch");
    await expect(switches).toHaveLength(2);
  },
};
