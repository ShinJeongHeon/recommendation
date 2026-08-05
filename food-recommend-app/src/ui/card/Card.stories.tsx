import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Card, CardPill } from "./Card";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/* 네트워크 없이 렌더되는 이미지 영역 대체 */
const media = <div aria-hidden className="size-full bg-gradient-to-br from-brand-200 to-brand-400" />;

/** D/Card — default·inverse·success·warning */
export const Variants: Story = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-6 bg-background-default p-6">
      <Card data-testid="default" media={media}>
        <h3 className="typo-heading-sm text-text-default">애호박 새우젓 덮밥</h3>
        <p className="typo-body-md text-text-subtle">
          냉장고에 남은 애호박으로 15분이면 완성되는 한 그릇 덮밥이에요.
        </p>
        <div className="flex gap-1.5">
          <CardPill icon="timer">15분</CardPill>
          <CardPill icon="flame">1구</CardPill>
          <CardPill icon="utensils">설거지 2개</CardPill>
        </div>
      </Card>
      <Card data-testid="inverse" variant="inverse" media={media}>
        <h3 className="typo-heading-sm text-text-inverse">애호박 새우젓 덮밥</h3>
        <p className="typo-body-md text-text-placeholder">
          냉장고에 남은 애호박으로 15분이면 완성되는 한 그릇 덮밥이에요.
        </p>
        <div className="flex gap-1.5">
          <CardPill icon="timer" inverse>15분</CardPill>
          <CardPill icon="flame" inverse>1구</CardPill>
        </div>
      </Card>
      <Card data-testid="success" variant="success">
        <h3 className="typo-heading-sm text-text-default">오늘 저녁 완료!</h3>
        <p className="typo-body-md text-text-subtle">재료 3개를 냉장고에서 차감했어요.</p>
      </Card>
      <Card data-testid="warning" variant="warning">
        <h3 className="typo-heading-sm text-text-default">유통기한 임박 재료</h3>
        <p className="typo-body-md text-text-subtle">애호박 · 두부가 2일 남았어요.</p>
      </Card>
    </div>
  ),
  play: async ({ canvas }) => {
    const card = canvas.getByTestId("default");
    const style = getComputedStyle(card);
    await expect(style.borderRadius).toBe("18px");
    await expect(style.backgroundColor).toBe("rgb(255, 255, 255)");
    await expect(style.borderColor).toBe("rgb(227, 218, 202)");

    const pill = canvas.getAllByText("15분")[0];
    await expect(getComputedStyle(pill).backgroundColor).toBe("rgb(239, 232, 219)");
    await expect(getComputedStyle(pill).borderRadius).toBe("12px");

    await expect(getComputedStyle(canvas.getByTestId("inverse")).backgroundColor).toBe("rgb(28, 26, 22)");
    await expect(getComputedStyle(canvas.getByTestId("success")).backgroundColor).toBe("rgb(228, 237, 223)");
    await expect(getComputedStyle(canvas.getByTestId("warning")).backgroundColor).toBe("rgb(251, 239, 201)");
  },
};

/** 이미지 영역 제외 구성 */
export const WithoutMedia: Story = {
  render: () => (
    <div className="w-[360px] bg-background-default p-6">
      <Card>
        <h3 className="typo-heading-sm text-text-default">간단 요약 카드</h3>
        <p className="typo-body-md text-text-subtle">이미지 없이 본문만 있는 구성이에요.</p>
      </Card>
    </div>
  ),
};
