import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { FileUploader, FileUploaderItem } from "./FileUploader";

const meta = {
  title: "UI/FileUploader",
  component: FileUploader,
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta<typeof FileUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

const zoneOf = (root: HTMLElement, index = 0) =>
  root.querySelectorAll<HTMLElement>('[data-slot="dropzone"]')[index];

/** 드롭존 — default·disabled·error (dragover는 드래그 중에만 나타난다) */
export const Dropzone: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-8 bg-background-default p-6">
      <FileUploader />
      <FileUploader disabled />
      <FileUploader errorText="10MB를 넘는 파일은 올릴 수 없어요" />
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    const zones = [zoneOf(canvasElement, 0), zoneOf(canvasElement, 1), zoneOf(canvasElement, 2)];
    await expect(getComputedStyle(zones[0]).borderColor).toBe("rgb(227, 218, 202)");
    await expect(getComputedStyle(zones[0]).height).toBe("150px");

    await expect(getComputedStyle(zones[1]).backgroundColor).toBe("rgb(239, 232, 219)");
    await expect(getComputedStyle(zones[2]).borderColor).toBe("rgb(201, 50, 48)");

    const errorMessage = canvas.getByText("10MB를 넘는 파일은 올릴 수 없어요");
    await expect(getComputedStyle(errorMessage).color).toBe("rgb(166, 36, 34)");
  },
};

export const PickFile: Story = {
  args: { onFilesSelected: fn() },
  play: async ({ args, canvasElement, userEvent }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(["dummy"], "된장찌개_재료.jpg", { type: "image/jpeg" });
    await userEvent.upload(input, file);
    await expect(args.onFilesSelected).toHaveBeenCalledOnce();
  },
};

/** 파일 아이템 — uploading(스피너)·complete(체크)·error(에러 아이콘) */
export const Items: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-3 bg-background-default p-6">
      <FileUploaderItem
        status="uploading"
        name="된장찌개_재료.jpg"
        statusText="업로드 중 · 64%"
        onDelete={() => {}}
      />
      <FileUploaderItem
        status="complete"
        name="된장찌개_재료.jpg"
        statusText="업로드 완료 · 1.2MB"
        onDelete={() => {}}
      />
      <FileUploaderItem
        status="error"
        name="된장찌개_재료.jpg"
        statusText="업로드 실패 · 다시 시도해주세요"
        onDelete={() => {}}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status", { name: "업로드 중" })).toBeTruthy();

    const completeStatus = canvas.getByText("업로드 완료 · 1.2MB");
    await expect(getComputedStyle(completeStatus).color).toBe("rgb(76, 101, 69)");

    const errorStatus = canvas.getByText("업로드 실패 · 다시 시도해주세요");
    await expect(getComputedStyle(errorStatus).color).toBe("rgb(166, 36, 34)");

    await expect(canvas.getAllByRole("button", { name: "된장찌개_재료.jpg 삭제" })).toHaveLength(3);
  },
};
