import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const boxOf = (input: HTMLElement) =>
  input.parentElement!.querySelector('[data-slot="box"]') as HTMLElement;

/** 선택(unchecked·checked·indeterminate) × 상태(default·disabled·error) */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <div className="flex items-center gap-6">
        <Checkbox data-testid="unchecked" label="재료 알림 받기" />
        <Checkbox label="재료 알림 받기" disabled />
        <Checkbox data-testid="unchecked-error" label="재료 알림 받기" error />
      </div>
      <div className="flex items-center gap-6">
        <Checkbox data-testid="checked" label="재료 알림 받기" defaultChecked />
        <Checkbox label="재료 알림 받기" defaultChecked disabled />
        <Checkbox data-testid="checked-error" label="재료 알림 받기" defaultChecked error />
      </div>
      <div className="flex items-center gap-6">
        <Checkbox data-testid="indeterminate" label="재료 알림 받기" indeterminate />
        <Checkbox label="재료 알림 받기" indeterminate disabled />
        <Checkbox label="재료 알림 받기" indeterminate error />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const unchecked = canvas.getByTestId("unchecked");
    await expect(getComputedStyle(boxOf(unchecked)).borderColor).toBe("rgb(163, 155, 139)");
    await expect(getComputedStyle(boxOf(unchecked)).backgroundColor).toBe("rgb(255, 255, 255)");

    const checked = canvas.getByTestId("checked");
    await expect(checked).toBeChecked();
    await expect(getComputedStyle(boxOf(checked)).backgroundColor).toBe("rgb(226, 85, 43)");

    const uncheckedError = canvas.getByTestId("unchecked-error");
    await expect(getComputedStyle(boxOf(uncheckedError)).borderColor).toBe("rgb(201, 50, 48)");

    const checkedError = canvas.getByTestId("checked-error");
    await expect(getComputedStyle(boxOf(checkedError)).backgroundColor).toBe("rgb(201, 50, 48)");

    const indeterminate = canvas.getByTestId("indeterminate") as HTMLInputElement;
    await expect(indeterminate.indeterminate).toBe(true);
  },
};

/** sm(16) · md(20) */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6 bg-background-default p-6">
      <Checkbox data-testid="sm" size="sm" label="sm 16px" defaultChecked />
      <Checkbox data-testid="md" size="md" label="md 20px" defaultChecked />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(boxOf(canvas.getByTestId("sm"))).width).toBe("16px");
    await expect(getComputedStyle(boxOf(canvas.getByTestId("md"))).width).toBe("20px");
  },
};

export const Toggle: Story = {
  args: { label: "재료 알림 받기" },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("checkbox", { name: "재료 알림 받기" });
    await expect(input).not.toBeChecked();
    await userEvent.click(input);
    await expect(input).toBeChecked();
    await waitFor(async () => {
      await expect(getComputedStyle(boxOf(input)).backgroundColor).toBe("rgb(226, 85, 43)");
    });
  },
};
