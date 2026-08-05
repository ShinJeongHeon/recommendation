import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { Textarea } from "./Textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

const fieldOf = (el: HTMLElement) => el.closest('[data-slot="field"]') as HTMLElement;

/** F/Textarea — default·focused·disabled·error, 고정 3줄(92px) + 카운터 */
export const States: Story = {
  args: { label: "요청사항" },
  render: () => (
    <div className="flex w-96 flex-col gap-6 bg-background-default p-6">
      <Textarea
        data-testid="default"
        label="요청사항"
        placeholder="예: 국물 요리 위주로, 아이도 먹을 수 있게 순한 맛으로 부탁해요"
        helperText="메뉴 추천에 참고할 내용을 적어주세요"
        maxLength={200}
      />
      <Textarea
        data-testid="disabled"
        label="요청사항"
        placeholder="예: 국물 요리 위주로"
        helperText="메뉴 추천에 참고할 내용을 적어주세요"
        maxLength={200}
        disabled
      />
      <Textarea
        data-testid="error"
        label="요청사항"
        defaultValue="국물이 자작한 편이 좋아요."
        errorText="200자를 넘었어요"
        maxLength={200}
      />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const textarea = canvas.getByTestId("default");
    const field = fieldOf(textarea);
    await expect(getComputedStyle(field).height).toBe("92px");
    await expect(getComputedStyle(field).borderColor).toBe("rgb(227, 218, 202)");

    // 입력하면 카운터가 갱신되고, 포커스 시 보더가 브랜드 컬러 (transition 완료까지 대기)
    await userEvent.type(textarea, "덮밥");
    await waitFor(async () => {
      await expect(getComputedStyle(field).borderColor).toBe("rgb(226, 85, 43)");
    });
    await expect(canvas.getByText("2/200")).toBeVisible();

    const errorField = fieldOf(canvas.getByTestId("error"));
    await expect(getComputedStyle(errorField).borderColor).toBe("rgb(201, 50, 48)");
    const errorCounter = canvas.getByText("15/200");
    await expect(getComputedStyle(errorCounter).color).toBe("rgb(166, 36, 34)");
  },
};
