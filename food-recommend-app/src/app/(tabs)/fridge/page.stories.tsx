import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import FridgePage from "./page";

const meta = {
  title: "Pages/Fridge",
  component: FridgePage,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  tags: ["ai-generated"],
} satisfies Meta<typeof FridgePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("내 냉장고")).toBeInTheDocument();
    await expect(canvas.getByText("곧 상해요")).toBeInTheDocument();
    await expect(canvas.getByText("콩나물")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: /콩나물 계란국/ })).toHaveAttribute(
      "href",
      "/recipes/kongnamul-gyeranguk",
    );
  },
};
