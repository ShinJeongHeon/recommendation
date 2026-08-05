import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

/** T/* 컴포넌트와 1:1 — 사이즈/두께/행간은 tokens.css의 typo-* 유틸리티가 결정한다. */
const TYPOGRAPHY_STYLES = [
  { name: "display-lg", className: "typo-display-lg", size: 36, weight: "bold 700", lineHeight: 1.2 },
  { name: "display-md", className: "typo-display-md", size: 32, weight: "bold 700", lineHeight: 1.2 },
  { name: "display-sm", className: "typo-display-sm", size: 28, weight: "bold 700", lineHeight: 1.2 },
  { name: "heading-lg", className: "typo-heading-lg", size: 24, weight: "bold 700", lineHeight: 1.2 },
  { name: "heading-md", className: "typo-heading-md", size: 20, weight: "bold 700", lineHeight: 1.2 },
  { name: "heading-sm", className: "typo-heading-sm", size: 16, weight: "semibold 600", lineHeight: 1.2 },
  { name: "body-lg", className: "typo-body-lg", size: 16, weight: "regular 400", lineHeight: 1.4 },
  { name: "body-md", className: "typo-body-md", size: 14, weight: "regular 400", lineHeight: 1.4 },
  { name: "label-lg", className: "typo-label-lg", size: 14, weight: "semibold 600", lineHeight: 1.4 },
  { name: "label-md", className: "typo-label-md", size: 12, weight: "regular 400", lineHeight: 1.4 },
] as const;

const SAMPLE_TEXT = "오늘은 뭐 해먹지? 집밥 레시피 추천 Aa 123";

const meta = {
  title: "Foundation/Typography",
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 구조별 1행 — Pretendard Variable, 공통 자간 -2% */
export const Styles: Story = {
  render: () => (
    <div className="flex flex-col gap-6 bg-background-surface p-6">
      <h2 className="typo-display-sm text-text-default">타이포그래피</h2>
      <ul className="flex flex-col">
        {TYPOGRAPHY_STYLES.map(({ name, className, size, weight, lineHeight }) => (
          <li key={name} className="flex items-baseline gap-6 border-b border-border-subtle py-4">
            <div className="flex w-44 shrink-0 flex-col gap-1">
              <code className="typo-label-lg text-text-brand">{name}</code>
              <span className="typo-label-md text-text-muted">
                {size}px · {weight} · lh {lineHeight} · ls -2%
              </span>
            </div>
            <p data-typo={name} className={`${className} text-text-default`}>
              {SAMPLE_TEXT}
            </p>
          </li>
        ))}
      </ul>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // typo-* 유틸리티가 토큰 값으로 해석되는지 확인 (display-lg: 36px/700/1.2, 자간 -2% = -0.72px)
    const displayLg = canvasElement.querySelector('[data-typo="display-lg"]');
    const style = getComputedStyle(displayLg!);
    await expect(style.fontFamily).toContain("Pretendard Variable");
    await expect(style.fontSize).toBe("36px");
    await expect(style.fontWeight).toBe("700");
    await expect(style.lineHeight).toBe("43.2px");
    await expect(style.letterSpacing).toBe("-0.72px");

    const bodyMd = canvasElement.querySelector('[data-typo="body-md"]');
    const bodyStyle = getComputedStyle(bodyMd!);
    await expect(bodyStyle.fontSize).toBe("14px");
    await expect(bodyStyle.fontWeight).toBe("400");
    await expect(bodyStyle.lineHeight).toBe("19.6px");
  },
};

/** 웹폰트 파일(/fonts/PretendardVariable.woff2)이 실제로 로드되는지 검증 */
export const FontLoaded: Story = {
  render: () => (
    <p className="typo-body-lg text-text-default">
      Pretendard Variable 로드 확인 — 가나다라 ABC 123
    </p>
  ),
  play: async () => {
    await document.fonts.ready;
    await waitFor(async () => {
      await expect(document.fonts.check('16px "Pretendard Variable"')).toBe(true);
    });
  },
};
