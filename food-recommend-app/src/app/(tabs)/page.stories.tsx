import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import HomePage from "./page";

const meta = {
  title: "Pages/Home",
  component: HomePage,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  tags: ["ai-generated"],
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("소진님, 오늘 이 다섯 중에요")).toBeInTheDocument();
    await expect(canvas.getByText("그 외 추천 4개")).toBeInTheDocument();
    // 히어로 CTA 1 + 추천 카드 4 = 상세로 가는 링크 5개
    const links = canvas.getAllByRole("link");
    await expect(links).toHaveLength(5);
  },
};
