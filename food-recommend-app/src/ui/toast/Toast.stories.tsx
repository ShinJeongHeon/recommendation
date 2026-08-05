import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Toast } from "./Toast";

const meta = {
  title: "UI/Toast",
  component: Toast,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** S/Toast — success·error·info·warning (좌측 상태 아이콘 20 + 메시지 body-md + 닫기) */
export const Variants: Story = {
  args: { children: "냉장고에 재료를 저장했어요" },
  render: () => (
    <div className="flex w-[360px] flex-col gap-3 bg-background-default p-6">
      <Toast variant="success" onClose={() => {}}>냉장고에 재료를 저장했어요</Toast>
      <Toast variant="error" onClose={() => {}}>저장에 실패했어요. 다시 시도해 주세요</Toast>
      <Toast variant="info" onClose={() => {}}>새 추천 레시피가 도착했어요</Toast>
      <Toast variant="warning" onClose={() => {}}>유통기한이 2일 남은 재료가 있어요</Toast>
    </div>
  ),
  play: async ({ canvas }) => {
    const success = canvas.getByText("냉장고에 재료를 저장했어요").parentElement!;
    await expect(getComputedStyle(success).backgroundColor).toBe("rgb(94, 122, 85)");
    await expect(getComputedStyle(success).color).toBe("rgb(255, 255, 255)");
    await expect(getComputedStyle(success).borderRadius).toBe("12px");

    const error = canvas.getByRole("alert");
    await expect(getComputedStyle(error).backgroundColor).toBe("rgb(201, 50, 48)");

    const info = canvas.getByText("새 추천 레시피가 도착했어요").parentElement!;
    await expect(getComputedStyle(info).backgroundColor).toBe("rgb(45, 111, 184)");

    // warning은 on-warning(amber-950) 텍스트
    const warning = canvas.getByText("유통기한이 2일 남은 재료가 있어요").parentElement!;
    await expect(getComputedStyle(warning).backgroundColor).toBe("rgb(244, 197, 67)");
    await expect(getComputedStyle(warning).color).toBe("rgb(36, 25, 4)");

    await expect(canvas.getAllByRole("button", { name: "닫기" })).toHaveLength(4);
  },
};

export const Close: Story = {
  args: { variant: "success", children: "냉장고에 재료를 저장했어요", onClose: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "닫기" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
