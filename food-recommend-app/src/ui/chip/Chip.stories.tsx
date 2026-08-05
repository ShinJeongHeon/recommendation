import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Chip } from "./Chip";

const meta = {
  title: "UI/Chip",
  component: Chip,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 선택(unselected·selected) × 상태(default·disabled) */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3 bg-background-default p-6">
      <div className="flex items-center gap-2">
        <Chip data-testid="unselected">채소 위주</Chip>
        <Chip disabled>채소 위주</Chip>
      </div>
      <div className="flex items-center gap-2">
        <Chip data-testid="selected" selected>채소 위주</Chip>
        <Chip data-testid="selected-disabled" selected disabled>채소 위주</Chip>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const unselected = canvas.getByTestId("unselected");
    const unselectedStyle = getComputedStyle(unselected);
    await expect(unselectedStyle.backgroundColor).toBe("rgb(255, 255, 255)");
    await expect(unselectedStyle.borderColor).toBe("rgb(227, 218, 202)");
    await expect(unselectedStyle.color).toBe("rgb(107, 101, 88)");

    const selected = canvas.getByTestId("selected");
    await expect(getComputedStyle(selected).backgroundColor).toBe("rgb(226, 85, 43)");
    await expect(getComputedStyle(selected).color).toBe("rgb(255, 255, 255)");
    await expect(selected).toHaveAttribute("aria-pressed", "true");

    const selectedDisabled = canvas.getByTestId("selected-disabled");
    await expect(getComputedStyle(selectedDisabled).backgroundColor).toBe("rgb(163, 155, 139)");
  },
};

/** sm(24) · md(32) — 좌측 아이콘 시 좌측 패딩 절반 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2 bg-background-default p-6">
      <Chip data-testid="sm" size="sm">채소 위주</Chip>
      <Chip data-testid="sm-icon" size="sm" icon="leaf">채소 위주</Chip>
      <Chip data-testid="md" size="md">채소 위주</Chip>
      <Chip data-testid="md-icon" size="md" icon="leaf">채소 위주</Chip>
    </div>
  ),
  play: async ({ canvas }) => {
    const sm = canvas.getByTestId("sm");
    await expect(getComputedStyle(sm).height).toBe("24px");
    await expect(getComputedStyle(sm).paddingLeft).toBe("12px");
    await expect(getComputedStyle(canvas.getByTestId("sm-icon")).paddingLeft).toBe("6px");

    const md = canvas.getByTestId("md");
    await expect(getComputedStyle(md).height).toBe("32px");
    await expect(getComputedStyle(md).paddingLeft).toBe("16px");
    await expect(getComputedStyle(canvas.getByTestId("md-icon")).paddingLeft).toBe("8px");
  },
};
