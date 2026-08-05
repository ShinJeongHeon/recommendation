import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Select, SelectItem } from "./Select";

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** F/Select — default·focused(open)·disabled·error */
export const States: Story = {
  args: { label: "주재료" },
  render: () => (
    <div className="flex w-96 flex-col gap-6 bg-background-default p-6">
      <Select label="주재료" placeholder="재료를 선택하세요" helperText="주재료 1개를 골라주세요" id="s-default" />
      <Select label="주재료" value="돼지고기" helperText="주재료 1개를 골라주세요" open id="s-open" />
      <Select label="주재료" placeholder="재료를 선택하세요" helperText="주재료 1개를 골라주세요" disabled id="s-disabled" />
      <Select label="주재료" placeholder="재료를 선택하세요" errorText="재료를 선택해주세요" id="s-error" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = (id: string) => canvasElement.querySelector<HTMLElement>(`#${id}`)!;

    await expect(getComputedStyle(trigger("s-default")).borderColor).toBe("rgb(227, 218, 202)");
    // open(=focused): 브랜드 보더 유지 + aria-expanded
    const open = trigger("s-open");
    await expect(getComputedStyle(open).borderColor).toBe("rgb(226, 85, 43)");
    await expect(open).toHaveAttribute("aria-expanded", "true");

    const disabled = trigger("s-disabled");
    await expect(disabled).toBeDisabled();
    await expect(getComputedStyle(disabled).backgroundColor).toBe("rgb(239, 232, 219)");

    await expect(getComputedStyle(trigger("s-error")).borderColor).toBe("rgb(201, 50, 48)");
  },
};

function IngredientSelect() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState<string | undefined>("돼지고기");
  const options = ["돼지고기", "닭고기", "두부", "애호박"];
  return (
    <div className="flex w-96 flex-col gap-2 bg-background-default p-6">
      <Select
        label="주재료"
        placeholder="재료를 선택하세요"
        value={value}
        open={open}
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div role="listbox" aria-label="주재료 목록" className="flex flex-col gap-0.5 rounded-xl bg-background-surface p-1">
          {options.map((option) => (
            <SelectItem
              key={option}
              selected={value === option}
              disabled={option === "애호박"}
              onClick={() => {
                setValue(option);
                setOpen(false);
              }}
            >
              {option}
            </SelectItem>
          ))}
        </div>
      )}
    </div>
  );
}

/** 셀렉트 + 셀렉트아이템 연결 (데스크톱: 셀렉트 아래 목록) */
export const WithItems: Story = {
  args: { label: "주재료" },
  render: () => <IngredientSelect />,
  play: async ({ canvas, userEvent }) => {
    // selected 아이템: muted 배경 + 체크 아이콘
    const selected = canvas.getByRole("option", { name: "돼지고기" });
    await expect(selected).toHaveAttribute("aria-selected", "true");
    await expect(getComputedStyle(selected).backgroundColor).toBe("rgb(239, 232, 219)");
    await expect(selected.querySelector("svg")).toBeTruthy();

    const unselected = canvas.getByRole("option", { name: "두부" });
    await expect(unselected.querySelector("svg")).toBeNull();

    // 아이템 선택 → 트리거 값 갱신 + 패널 닫힘
    await userEvent.click(unselected);
    const trigger = canvas.getByRole("button", { name: "주재료" });
    await expect(trigger).toHaveTextContent("두부");
    await expect(canvas.queryByRole("listbox")).toBeNull();
  },
};
