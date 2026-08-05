import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Button } from "@/ui/button/Button";
import { Modal } from "./Modal";

const meta = {
  title: "UI/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** D/Modal — 헤더(제목+닫기 16px) · 바디(body-md) · 푸터(secondary+primary) · 스크림 */
export const Default: Story = {
  args: {
    title: "이 레시피를 저장할까요?",
    children: "저장하면 마이페이지의 저장한 레시피에서 언제든 다시 볼 수 있어요.",
    footer: (
      <>
        <Button variant="secondary">다음에</Button>
        <Button>저장하기</Button>
      </>
    ),
    onClose: fn(),
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const dialog = canvas.getByRole("dialog", { name: "이 레시피를 저장할까요?" });
    const style = getComputedStyle(dialog);
    await expect(style.width).toBe("340px");
    await expect(style.borderRadius).toBe("20px");
    await expect(style.backgroundColor).toBe("rgb(255, 255, 255)");

    const scrim = canvasElement.querySelector<HTMLElement>('[data-slot="scrim"]')!;
    await expect(getComputedStyle(scrim).backgroundColor).toContain("rgba(28, 26, 22");

    await expect(canvas.getByRole("button", { name: "다음에" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "저장하기" })).toBeVisible();

    // 패널 클릭은 닫히지 않고, 스크림 탭·닫기 버튼은 닫힌다
    await userEvent.click(dialog);
    await expect(args.onClose).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "닫기" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
