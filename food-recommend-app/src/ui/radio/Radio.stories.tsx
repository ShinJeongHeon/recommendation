import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Radio } from "./Radio";

const meta = {
  title: "UI/Radio",
  component: Radio,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

const circleOf = (input: HTMLElement) =>
  input.parentElement!.querySelector('[data-slot="circle"]') as HTMLElement;

/** 선택(unselected·selected) × 상태(default·disabled) */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <div className="flex items-center gap-6">
        <Radio data-testid="unselected" name="row1" label="매운맛 보통" />
        <Radio name="row1-disabled" label="매운맛 보통" disabled />
      </div>
      <div className="flex items-center gap-6">
        <Radio data-testid="selected" name="row2" label="매운맛 보통" defaultChecked />
        <Radio name="row2-disabled" label="매운맛 보통" defaultChecked disabled />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const unselected = canvas.getByTestId("unselected");
    await expect(getComputedStyle(circleOf(unselected)).borderColor).toBe("rgb(163, 155, 139)");

    const selected = canvas.getByTestId("selected");
    const circle = circleOf(selected);
    await expect(getComputedStyle(circle).borderColor).toBe("rgb(226, 85, 43)");
    const dot = circle.querySelector('[data-slot="dot"]') as HTMLElement;
    await expect(getComputedStyle(dot).backgroundColor).toBe("rgb(226, 85, 43)");
    await expect(getComputedStyle(dot).width).toBe("10px");
  },
};

function SpicyGroup() {
  const [value, setValue] = useState("mild");
  return (
    <fieldset className="flex flex-col gap-3 bg-background-default p-6">
      <legend className="typo-label-lg text-text-default">매운맛 정도</legend>
      {[
        { id: "mild", label: "순한맛" },
        { id: "medium", label: "매운맛 보통" },
        { id: "hot", label: "아주 매운맛" },
      ].map(({ id, label }) => (
        <Radio
          key={id}
          name="spicy"
          label={label}
          checked={value === id}
          onChange={() => setValue(id)}
        />
      ))}
    </fieldset>
  );
}

/** 그룹 사용(컨트롤드) — 단독 사용 금지 */
export const Group: Story = {
  render: () => <SpicyGroup />,
  play: async ({ canvas, userEvent }) => {
    const mild = canvas.getByRole("radio", { name: "순한맛" });
    const hot = canvas.getByRole("radio", { name: "아주 매운맛" });
    await expect(mild).toBeChecked();
    await userEvent.click(hot);
    await expect(hot).toBeChecked();
    await expect(mild).not.toBeChecked();
    await expect(circleOf(hot).querySelector('[data-slot="dot"]')).toBeTruthy();
  },
};
