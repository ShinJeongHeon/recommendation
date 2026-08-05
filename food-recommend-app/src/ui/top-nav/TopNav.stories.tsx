import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { IconButton } from "@/ui/icon-button/IconButton";
import { TopNav } from "./TopNav";

const meta = {
  title: "UI/TopNav",
  component: TopNav,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof TopNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** C/TopNav — 좌/우 아이콘 버튼 슬롯 + 제목(heading-sm) */
export const Default: Story = {
  args: {
    title: "화면 제목",
    leading: <IconButton icon="arrow-left" aria-label="뒤로" />,
    trailing: <IconButton icon="more-horizontal" aria-label="더보기" />,
  },
  render: (args) => (
    <div className="w-[360px] bg-background-default">
      <TopNav {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const header = canvas.getByRole("banner");
    const style = getComputedStyle(header);
    await expect(style.height).toBe("56px");
    await expect(style.borderBottomColor).toBe("rgb(227, 218, 202)");

    const title = canvas.getByRole("heading", { name: "화면 제목" });
    const titleStyle = getComputedStyle(title);
    await expect(titleStyle.fontSize).toBe("16px");
    await expect(titleStyle.fontWeight).toBe("600");

    await expect(canvas.getByRole("button", { name: "뒤로" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "더보기" })).toBeVisible();
  },
};

/** 아이콘 버튼 제외 구성 */
export const TitleOnly: Story = {
  args: { title: "내 냉장고" },
  render: (args) => (
    <div className="w-[360px] bg-background-default">
      <TopNav {...args} />
    </div>
  ),
};
