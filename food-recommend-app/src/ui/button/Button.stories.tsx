import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 타입(행) × 상태(열) — B/Button/{primary,secondary,destructive}/{default,disabled,loading} */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <div className="flex items-center gap-3">
        <Button data-testid="primary-default" leadingIcon="sparkles">추천 받기</Button>
        <Button data-testid="primary-disabled" leadingIcon="sparkles" disabled>추천 받기</Button>
        <Button data-testid="primary-loading" leadingIcon="sparkles" loading>추천 받기</Button>
      </div>
      <div className="flex items-center gap-3">
        <Button data-testid="secondary-default" variant="secondary" leadingIcon="sliders-horizontal">다시 고르기</Button>
        <Button variant="secondary" leadingIcon="sliders-horizontal" disabled>다시 고르기</Button>
        <Button variant="secondary" leadingIcon="sliders-horizontal" loading>다시 고르기</Button>
      </div>
      <div className="flex items-center gap-3">
        <Button data-testid="destructive-default" variant="destructive" leadingIcon="delete">재료 삭제</Button>
        <Button variant="destructive" leadingIcon="delete" disabled>재료 삭제</Button>
        <Button variant="destructive" leadingIcon="delete" loading>재료 삭제</Button>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    // 시맨틱 토큰 매핑 확인 — brand-500 / neutral-200(disabled) / red-500
    const primary = canvas.getByTestId("primary-default");
    await expect(getComputedStyle(primary).backgroundColor).toBe("rgb(226, 85, 43)");
    await expect(getComputedStyle(primary).color).toBe("rgb(255, 255, 255)");

    const primaryDisabled = canvas.getByTestId("primary-disabled");
    await expect(getComputedStyle(primaryDisabled).backgroundColor).toBe("rgb(239, 232, 219)");
    await expect(getComputedStyle(primaryDisabled).color).toBe("rgb(138, 130, 114)");
    await expect(primaryDisabled).toBeDisabled();

    // loading: default 색 유지 + 스피너로 좌측 아이콘 대체 + 비활성
    const primaryLoading = canvas.getByTestId("primary-loading");
    await expect(getComputedStyle(primaryLoading).backgroundColor).toBe("rgb(226, 85, 43)");
    await expect(primaryLoading.querySelector('[data-slot="spinner"]')).toBeTruthy();
    await expect(primaryLoading).toBeDisabled();

    const secondary = canvas.getByTestId("secondary-default");
    await expect(getComputedStyle(secondary).backgroundColor).toBe("rgb(255, 255, 255)");
    await expect(getComputedStyle(secondary).borderColor).toBe("rgb(227, 218, 202)");

    const destructive = canvas.getByTestId("destructive-default");
    await expect(getComputedStyle(destructive).backgroundColor).toBe("rgb(201, 50, 48)");
  },
};

/** sm(32) · md(40) · lg(48) — 아이콘 16/20/20, 라운드 10/12/14 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3 bg-background-default p-6">
      <Button data-testid="sm" size="sm" leadingIcon="sparkles">추천 받기</Button>
      <Button data-testid="md" size="md" leadingIcon="sparkles">추천 받기</Button>
      <Button data-testid="lg" size="lg" leadingIcon="sparkles">추천 받기</Button>
    </div>
  ),
  play: async ({ canvas }) => {
    const cases = [
      { id: "sm", height: "32px", radius: "10px", icon: "16" },
      { id: "md", height: "40px", radius: "12px", icon: "20" },
      { id: "lg", height: "48px", radius: "14px", icon: "20" },
    ] as const;
    for (const { id, height, radius, icon } of cases) {
      const button = canvas.getByTestId(id);
      const style = getComputedStyle(button);
      await expect(style.height).toBe(height);
      await expect(style.borderRadius).toBe(radius);
      await expect(button.querySelector("svg")?.getAttribute("width")).toBe(icon);
    }
  },
};

/** 레이블 좌/우측 아이콘 추가·제외 */
export const IconOptions: Story = {
  render: () => (
    <div className="flex items-center gap-3 bg-background-default p-6">
      <Button>레이블만</Button>
      <Button leadingIcon="sparkles">좌측 아이콘</Button>
      <Button trailingIcon="arrow-right">우측 아이콘</Button>
      <Button leadingIcon="sparkles" trailingIcon="arrow-right">양쪽 아이콘</Button>
    </div>
  ),
};

export const Click: Story = {
  args: { children: "추천 받기", onClick: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "추천 받기" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
