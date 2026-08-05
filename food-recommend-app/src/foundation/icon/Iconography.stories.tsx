import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Icon } from "./Icon";
import { ICON_SIZES, fillIconNames, outlineIconNames, type IconName } from "./icons";

function IconGrid({ names }: { names: IconName[] }) {
  return (
    <ul className="flex flex-col">
      {names.map((name) => (
        <li key={name} className="flex items-center gap-6 border-b border-border-subtle py-3">
          <code className="typo-label-lg w-44 shrink-0 text-text-default">{name}</code>
          <div className="flex items-center gap-6 text-text-default">
            {ICON_SIZES.map((size) => (
              <div key={size} className="flex w-12 flex-col items-center gap-1">
                <Icon name={name} size={size} />
                <span className="typo-label-md text-text-muted">{size}</span>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

const meta = {
  title: "Foundation/Iconography",
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 아웃라인 세트 (lucide) — 아이콘당 1행, 16/20/24/32 4사이즈 */
export const Outline: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background-surface p-6">
      <h2 className="typo-display-sm text-text-default">아이코노그래피 — 아웃라인</h2>
      <IconGrid names={outlineIconNames} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svgs = canvasElement.querySelectorAll("svg");
    await expect(svgs).toHaveLength(outlineIconNames.length * ICON_SIZES.length);
  },
};

/** 필 세트 (phosphor fill) — 탭바 활성 상태 등 강조 용도 */
export const Fill: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background-surface p-6">
      <h2 className="typo-display-sm text-text-default">아이코노그래피 — 필</h2>
      <IconGrid names={fillIconNames} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svgs = canvasElement.querySelectorAll("svg");
    await expect(svgs).toHaveLength(fillIconNames.length * ICON_SIZES.length);
  },
};

/** 색상은 currentColor 상속 — 텍스트 컬러 토큰으로 제어 */
export const Color: Story = {
  render: () => (
    <div className="flex items-center gap-4 bg-background-surface p-6">
      <span className="text-text-default"><Icon name="heart" aria-label="기본" /></span>
      <span className="text-text-brand"><Icon name="heart-fill" aria-label="브랜드" /></span>
      <span className="text-text-error"><Icon name="warning" aria-label="에러" /></span>
      <span className="text-text-muted"><Icon name="info" aria-label="뮤트" /></span>
    </div>
  ),
  play: async ({ canvas }) => {
    // currentColor 상속 확인 — text-text-brand(#C13F19) 하위 svg의 color
    const brandIcon = await canvas.findByRole("img", { name: "브랜드" });
    await expect(getComputedStyle(brandIcon).color).toBe("rgb(193, 63, 25)");
  },
};
