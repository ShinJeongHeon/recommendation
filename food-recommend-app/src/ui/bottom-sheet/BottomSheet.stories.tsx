import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { MenuItem } from "@/ui/menu/Menu";
import { BottomSheet } from "./BottomSheet";

const meta = {
  title: "UI/BottomSheet",
  component: BottomSheet,
  parameters: { layout: "fullscreen" },
  tags: ["ai-generated"],
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** D/BottomSheet — 드래그 핸들 + 콘텐츠(메뉴아이템 lg) + 스크림 */
export const Default: Story = {
  args: {
    "aria-label": "레시피 옵션",
    onClose: fn(),
    children: (
      <>
        <MenuItem size="lg" icon="edit">레시피 수정</MenuItem>
        <MenuItem size="lg" icon="bookmark">레시피 저장</MenuItem>
        <MenuItem size="lg" icon="delete" variant="destructive">레시피 삭제</MenuItem>
      </>
    ),
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const sheet = canvas.getByRole("dialog", { name: "레시피 옵션" });
    const style = getComputedStyle(sheet);
    await expect(style.borderTopLeftRadius).toBe("20px");
    await expect(style.borderBottomLeftRadius).toBe("0px");

    const handle = canvasElement.querySelector<HTMLElement>('[data-slot="handle"]')!;
    await expect(getComputedStyle(handle).width).toBe("40px");
    await expect(getComputedStyle(handle).height).toBe("4px");
    await expect(getComputedStyle(handle).backgroundColor).toBe("rgb(163, 155, 139)");

    // 메뉴아이템 lg: 높이 48
    const item = canvas.getByRole("menuitem", { name: "레시피 수정" });
    await expect(getComputedStyle(item).height).toBe("48px");

    // 시트 클릭은 유지, 스크림 탭이면 선택 없이 닫힘
    await userEvent.click(sheet);
    await expect(args.onClose).not.toHaveBeenCalled();
    const scrim = canvasElement.querySelector<HTMLElement>('[data-slot="scrim"]')!;
    await userEvent.click(scrim);
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
