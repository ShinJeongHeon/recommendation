import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Home from './page';

const meta = {
  component: Home,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['ai-generated'],
} satisfies Meta<typeof Home>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const deployLink = canvas.getByRole('link', { name: /deploy now/i });
    // bg-foreground는 globals.css의 @theme 토큰(#171717) — Tailwind와 전역 CSS가 로드되지 않으면 실패한다.
    await expect(getComputedStyle(deployLink).backgroundColor).toBe('rgb(23, 23, 23)');
  },
};
