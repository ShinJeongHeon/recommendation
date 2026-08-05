import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Button } from "@/ui/button/Button";
import { Empty } from "./Empty";

const meta = {
  title: "UI/Empty",
  component: Empty,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

const actions = {
  primaryAction: <Button>레시피 추천 받기</Button>,
  secondaryAction: <Button variant="secondary">둘러보기</Button>,
};

/** D/Empty — 비주얼(72 원형) + 제목 + 설명 + 액션 */
export const Default: Story = {
  args: {
    icon: "utensils",
    title: "아직 저장한 레시피가 없어요",
    description: "마음에 드는 메뉴를 저장하면 여기에 모아 볼 수 있어요.",
    ...actions,
  },
  render: (args) => (
    <div className="w-[360px] bg-background-surface">
      <Empty {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const visual = canvasElement.querySelector<HTMLElement>('[data-slot="visual"]')!;
    const visualStyle = getComputedStyle(visual);
    await expect(visualStyle.width).toBe("72px");
    await expect(visualStyle.backgroundColor).toBe("rgb(239, 232, 219)");

    const title = canvas.getByRole("heading", { name: "아직 저장한 레시피가 없어요" });
    await expect(getComputedStyle(title).fontSize).toBe("16px");
    await expect(getComputedStyle(title).fontWeight).toBe("600");

    await expect(canvas.getByRole("button", { name: "레시피 추천 받기" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "둘러보기" })).toBeVisible();
  },
};

/** inverse·success·warning 컨테이너 변형 */
export const Variants: Story = {
  args: { title: "빈 상태" },
  render: () => (
    <div className="flex w-[360px] flex-col gap-6 bg-background-default p-6">
      <Empty
        variant="inverse"
        icon="utensils"
        title="아직 저장한 레시피가 없어요"
        description="마음에 드는 메뉴를 저장하면 여기에 모아 볼 수 있어요."
        {...actions}
      />
      <Empty variant="success" icon="circle-check" title="오늘 식사 기록 완료!" />
      <Empty variant="warning" icon="clock-alert" title="유통기한 임박 재료가 있어요" />
    </div>
  ),
  play: async ({ canvas }) => {
    const inverseTitle = canvas.getByRole("heading", { name: "아직 저장한 레시피가 없어요" });
    const container = inverseTitle.parentElement!;
    await expect(getComputedStyle(container).backgroundColor).toBe("rgb(28, 26, 22)");
    await expect(getComputedStyle(inverseTitle).color).toBe("rgb(255, 255, 255)");

    const successContainer = canvas.getByRole("heading", { name: "오늘 식사 기록 완료!" }).parentElement!;
    await expect(getComputedStyle(successContainer).backgroundColor).toBe("rgb(228, 237, 223)");
  },
};
