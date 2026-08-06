import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { MyPageView } from "./MyPageView";

const meta = {
  title: "Pages/My",
  component: MyPageView,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  tags: ["ai-generated"],
  args: { userId: "00000000-0000-0000-0000-000000000000", profileName: "소진" },
} satisfies Meta<typeof MyPageView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("마이페이지")).toBeInTheDocument();
    await expect(canvas.getByText("소진님")).toBeInTheDocument();
    await expect(canvas.getByText("취향 다시 설정")).toBeInTheDocument();
    const switches = canvas.getAllByRole("switch");
    await expect(switches).toHaveLength(2);

    // 이름 수정 모달 열기·닫기 (저장은 Blocks/ProfileCard 스토리에서 검증)
    await userEvent.click(canvas.getByRole("button", { name: "이름 수정" }));
    await expect(await canvas.findByRole("dialog", { name: "이름 수정" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "취소" }));
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
