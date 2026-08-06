import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import LoginPage from "./page";

const meta = {
  title: "Pages/Login",
  component: LoginPage,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  tags: ["ai-generated"],
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("묻기 전에 먼저 고를게요")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /Google로 계속하기/ })).toBeEnabled();
  },
};
