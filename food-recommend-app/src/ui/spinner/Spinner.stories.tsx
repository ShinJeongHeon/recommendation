import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Spinner } from "./Spinner";

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** S/Spinner — md(24) 브랜드 컬러 270° 링 */
export const Default: Story = {
  args: { "aria-label": "로딩 중" },
  play: async ({ canvas }) => {
    const spinner = canvas.getByRole("status", { name: "로딩 중" });
    const style = getComputedStyle(spinner);
    await expect(style.width).toBe("24px");
    // 색상은 background-brand(brand-500), 회전 애니메이션 적용
    await expect(style.color).toBe("rgb(226, 85, 43)");
    await expect(style.animationName).toBe("spin");
  },
};

/** 버튼 내부 등에서는 부모 텍스트 컬러를 상속(color="current") */
export const InheritColor: Story = {
  render: () => (
    <span className="text-text-error">
      <Spinner size={20} color="current" aria-label="삭제 중" />
    </span>
  ),
  play: async ({ canvas }) => {
    const spinner = canvas.getByRole("status", { name: "삭제 중" });
    await expect(getComputedStyle(spinner).color).toBe("rgb(166, 36, 34)");
  },
};
