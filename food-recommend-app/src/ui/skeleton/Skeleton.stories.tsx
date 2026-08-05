import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** S/Skeleton — 텍스트형·사각형·원형 */
export const Variants: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4 bg-background-surface p-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
      </div>
      <Skeleton variant="rect" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const skeletons = canvasElement.querySelectorAll<HTMLElement>('[data-slot="skeleton"]');
    await expect(skeletons).toHaveLength(4);

    const circle = skeletons[0];
    const circleStyle = getComputedStyle(circle);
    await expect(circleStyle.width).toBe("64px");
    await expect(circleStyle.backgroundColor).toBe("rgb(239, 232, 219)");
    await expect(circleStyle.animationName).toBe("pulse");

    const rect = skeletons[3];
    await expect(getComputedStyle(rect).height).toBe("160px");
    await expect(getComputedStyle(rect).borderRadius).toBe("12px");
  },
};
