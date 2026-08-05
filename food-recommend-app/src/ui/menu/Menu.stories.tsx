import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Menu, MenuItem } from "./Menu";

const meta = {
  title: "UI/Menu",
  component: Menu,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** D/Menu + D/MenuItem — default·disabled·destructive 조합 (디자인 예시 그대로) */
export const Default: Story = {
  args: { children: null },
  render: () => (
    <div className="bg-background-default p-6">
      <Menu className="min-w-52">
        <MenuItem icon="edit">레시피 수정</MenuItem>
        <MenuItem icon="bookmark">레시피 저장</MenuItem>
        <MenuItem icon="share">레시피 공유하기</MenuItem>
        <MenuItem icon="copy" disabled>레시피 복사</MenuItem>
        <MenuItem icon="delete" variant="destructive">레시피 삭제</MenuItem>
      </Menu>
    </div>
  ),
  play: async ({ canvas }) => {
    const menu = canvas.getByRole("menu");
    const menuStyle = getComputedStyle(menu);
    await expect(menuStyle.borderRadius).toBe("14px");
    await expect(menuStyle.backgroundColor).toBe("rgb(255, 255, 255)");
    await expect(menuStyle.borderColor).toBe("rgb(227, 218, 202)");

    await expect(canvas.getAllByRole("menuitem")).toHaveLength(5);

    const item = canvas.getByRole("menuitem", { name: "레시피 수정" });
    await expect(getComputedStyle(item).height).toBe("40px");

    const disabled = canvas.getByRole("menuitem", { name: "레시피 복사" });
    await expect(disabled).toBeDisabled();
    const disabledLabel = canvas.getByText("레시피 복사");
    await expect(getComputedStyle(disabledLabel).color).toBe("rgb(138, 130, 114)");

    const destructiveLabel = canvas.getByText("레시피 삭제");
    await expect(getComputedStyle(destructiveLabel).color).toBe("rgb(166, 36, 34)");
  },
};

/** inverse·success·warning 톤 변형 */
export const Tones: Story = {
  args: { children: null },
  render: () => (
    <div className="flex flex-col gap-2 bg-background-default p-6">
      <MenuItem icon="edit" variant="inverse" className="w-56">레시피 수정</MenuItem>
      <MenuItem icon="edit" variant="success" className="w-56">레시피 수정</MenuItem>
      <MenuItem icon="edit" variant="warning" className="w-56">레시피 수정</MenuItem>
    </div>
  ),
  play: async ({ canvas }) => {
    const [inverse, success, warning] = canvas.getAllByRole("menuitem");
    await expect(getComputedStyle(inverse).backgroundColor).toBe("rgb(28, 26, 22)");
    await expect(getComputedStyle(success).backgroundColor).toBe("rgb(228, 237, 223)");
    await expect(getComputedStyle(warning).backgroundColor).toBe("rgb(251, 239, 201)");
  },
};
