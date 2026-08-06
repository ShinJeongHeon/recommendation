import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Switch } from "@/ui/switch/Switch";
import { SettingRow } from "./SettingRow";

const meta = {
  title: "Blocks/SettingRow",
  component: SettingRow,
  parameters: { layout: "centered" },
  tags: ["ai-generated"],
} satisfies Meta<typeof SettingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 값 + 셰브론 조합. */
export const WithValue: Story = {
  args: { icon: "heart", label: "취향 다시 설정", value: "3문항", chevron: true },
  render: (args) => (
    <div className="w-80">
      <SettingRow {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("취향 다시 설정")).toBeInTheDocument();
    await expect(canvas.getByText("3문항")).toBeInTheDocument();
  },
};

/** 우측 커스텀 컨트롤(토글) 조합. */
export const WithControl: Story = {
  args: {
    icon: "comment",
    label: "재고 확인 질문",
    control: <Switch defaultChecked label="제철 재료 알림" />,
  },
  render: WithValue.render,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("switch")).toBeChecked();
  },
};
