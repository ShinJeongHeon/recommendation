import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { TextField } from "./TextField";

const meta = {
  title: "UI/TextField",
  component: TextField,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

const fieldOf = (input: HTMLElement) => input.closest('[data-slot="field"]') as HTMLElement;

/** F/TextField/text — default·focused·disabled·error */
export const States: Story = {
  args: { label: "이메일" },
  render: () => (
    <div className="flex w-96 flex-col gap-6 bg-background-default p-6">
      <TextField
        data-testid="default"
        label="이메일"
        placeholder="이메일을 입력하세요"
        helperText="로그인에 사용할 주소예요"
        leadingIcon="user"
      />
      <TextField
        data-testid="disabled"
        label="이메일"
        placeholder="이메일을 입력하세요"
        helperText="로그인에 사용할 주소예요"
        leadingIcon="user"
        disabled
      />
      <TextField
        data-testid="error"
        label="이메일"
        defaultValue="chef@"
        errorText="올바른 이메일 형식이 아니에요"
        helperText="로그인에 사용할 주소예요"
        leadingIcon="user"
      />
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    const defaultInput = canvas.getByTestId("default");
    const defaultField = fieldOf(defaultInput);
    await expect(getComputedStyle(defaultField).borderColor).toBe("rgb(227, 218, 202)");
    await expect(getComputedStyle(defaultField).backgroundColor).toBe("rgb(255, 255, 255)");

    // focused: 보더가 브랜드 컬러로 전환 (transition 완료까지 대기)
    await userEvent.click(defaultInput);
    await waitFor(async () => {
      await expect(getComputedStyle(defaultField).borderColor).toBe("rgb(226, 85, 43)");
    });

    const disabledInput = canvas.getByTestId("disabled");
    await expect(disabledInput).toBeDisabled();
    await expect(getComputedStyle(fieldOf(disabledInput)).backgroundColor).toBe("rgb(239, 232, 219)");

    // error: 보더 에러 컬러 + 헬퍼텍스트가 에러 문구로 대체
    const errorInput = canvas.getByTestId("error");
    await expect(getComputedStyle(fieldOf(errorInput)).borderColor).toBe("rgb(201, 50, 48)");
    const errorHelper = canvas.getByText("올바른 이메일 형식이 아니에요");
    await expect(getComputedStyle(errorHelper).color).toBe("rgb(166, 36, 34)");
    // error 필드에서는 힌트가 에러 문구로 대체 — 힌트는 default·disabled 2곳에만 남는다
    await expect(canvas.queryAllByText("로그인에 사용할 주소예요")).toHaveLength(2);
  },
};

/** F/TextField/password — 마스킹 입력 */
export const Password: Story = {
  args: {
    label: "비밀번호",
    type: "password",
    placeholder: "비밀번호를 입력하세요",
    helperText: "8자 이상 · 영문·숫자 포함",
    leadingIcon: "shield-check",
  },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText("비밀번호");
    await expect(input).toHaveAttribute("type", "password");
  },
};

/** sm(32) · md(40) · lg(48) */
export const Sizes: Story = {
  args: { label: "사이즈" },
  render: () => (
    <div className="flex w-96 flex-col gap-6 bg-background-default p-6">
      <TextField data-testid="sm" size="sm" label="sm" placeholder="32px" />
      <TextField data-testid="md" size="md" label="md" placeholder="40px" />
      <TextField data-testid="lg" size="lg" label="lg" placeholder="48px" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(fieldOf(canvas.getByTestId("sm"))).height).toBe("32px");
    await expect(getComputedStyle(fieldOf(canvas.getByTestId("md"))).height).toBe("40px");
    await expect(getComputedStyle(fieldOf(canvas.getByTestId("lg"))).height).toBe("48px");
  },
};
