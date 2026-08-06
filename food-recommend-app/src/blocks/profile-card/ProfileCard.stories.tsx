import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ProfileCard } from "./ProfileCard";

const meta = {
  title: "Blocks/ProfileCard",
  component: ProfileCard,
  parameters: { layout: "centered" },
  tags: ["ai-generated"],
  args: {
    name: "소진",
    subtitle: "집밥 34일째 · 총 62끼 · 절약 384,000원",
  },
  render: (args) => (
    <div className="w-96">
      <ProfileCard {...args} />
    </div>
  ),
} satisfies Meta<typeof ProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 표시 — onSave가 없으면 수정 버튼도 없다. */
export const ReadOnly: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("소진님")).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "이름 수정" })).not.toBeInTheDocument();
  },
};

/** 이름 수정 성공 흐름 — 모달 열기 → 입력 → 저장 → onSave 호출·모달 닫힘. */
export const EditAndSave: Story = {
  args: { onSave: fn(async () => {}) },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "이름 수정" }));
    const dialog = within(await canvas.findByRole("dialog"));
    const input = dialog.getByLabelText("이름");
    await expect(input).toHaveValue("소진");
    await userEvent.clear(input);
    await userEvent.type(input, "  새이름  ");
    await userEvent.click(dialog.getByRole("button", { name: "저장" }));
    await expect(args.onSave).toHaveBeenCalledWith("새이름");
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

/** 저장 실패 — 에러 문구가 표시되고 모달은 열린 채 유지된다. */
export const SaveError: Story = {
  args: {
    onSave: fn(async () => {
      throw new Error("network");
    }),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "이름 수정" }));
    const dialog = within(await canvas.findByRole("dialog"));
    await userEvent.click(dialog.getByRole("button", { name: "저장" }));
    await expect(
      await dialog.findByText("저장에 실패했어요. 잠시 후 다시 시도해 주세요.")
    ).toBeInTheDocument();
    await expect(canvas.getByRole("dialog")).toBeInTheDocument();
  },
};
