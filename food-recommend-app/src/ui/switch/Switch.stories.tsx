import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { Switch } from "./Switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

const trackOf = (input: HTMLElement) =>
  input.parentElement!.querySelector('[data-slot="track"]') as HTMLElement;

/** 선택(off·on) × 상태(default·disabled) */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <div className="flex items-center gap-6">
        <Switch data-testid="off" label="제철 재료 알림" />
        <Switch label="제철 재료 알림" disabled />
      </div>
      <div className="flex items-center gap-6">
        <Switch data-testid="on" label="제철 재료 알림" defaultChecked />
        <Switch data-testid="on-disabled" label="제철 재료 알림" defaultChecked disabled />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const off = trackOf(canvas.getByTestId("off"));
    await expect(getComputedStyle(off).backgroundColor).toBe("rgb(163, 155, 139)");
    await expect(getComputedStyle(off).width).toBe("40px");
    await expect(getComputedStyle(off).height).toBe("20px");

    const on = trackOf(canvas.getByTestId("on"));
    await expect(getComputedStyle(on).backgroundColor).toBe("rgb(226, 85, 43)");

    const onDisabled = trackOf(canvas.getByTestId("on-disabled"));
    await expect(getComputedStyle(onDisabled).backgroundColor).toBe("rgb(239, 232, 219)");
  },
};

/** sm(16×32) · md(20×40) */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6 bg-background-default p-6">
      <Switch data-testid="sm" size="sm" label="sm" defaultChecked />
      <Switch data-testid="md" size="md" label="md" defaultChecked />
    </div>
  ),
  play: async ({ canvas }) => {
    const sm = trackOf(canvas.getByTestId("sm"));
    await expect(getComputedStyle(sm).width).toBe("32px");
    await expect(getComputedStyle(sm).height).toBe("16px");
    const md = trackOf(canvas.getByTestId("md"));
    await expect(getComputedStyle(md).width).toBe("40px");
  },
};

export const Toggle: Story = {
  args: { label: "제철 재료 알림" },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("switch", { name: "제철 재료 알림" });
    const track = trackOf(input);
    const knob = track.querySelector('[data-slot="knob"]') as HTMLElement;

    await expect(input).not.toBeChecked();
    await expect(getComputedStyle(knob).translate).toBe("none");

    await userEvent.click(input);
    await expect(input).toBeChecked();
    await waitFor(async () => {
      await expect(getComputedStyle(track).backgroundColor).toBe("rgb(226, 85, 43)");
      // translate-x-5 = 20px 이동
      await expect(getComputedStyle(knob).translate).toBe("20px");
    });
  },
};
