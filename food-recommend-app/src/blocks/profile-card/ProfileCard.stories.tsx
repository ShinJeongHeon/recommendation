import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ProfileCard } from "./ProfileCard";

const meta = {
  title: "Blocks/ProfileCard",
  component: ProfileCard,
  parameters: { layout: "centered" },
  tags: ["ai-generated"],
  args: {
    name: "소진",
    subtitle: "집밥 34일째 · 총 62끼 · 절약 384,000원",
  },
  render: (args) => (
    <div className="w-96">
      <ProfileCard {...args} />
    </div>
  ),
} satisfies Meta<typeof ProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 기본 표시 — onSave가 없으면 수정 버튼도 없다. */
export const ReadOnly: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("소진님")).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "이름 수정" })).not.toBeInTheDocument();
  },
};

/** 이름 수정 성공 흐름 — 모달 열기 → 입력 → 저장 → onSave 호출·모달 닫힘. */
export const EditAndSave: Story = {
  args: { onSave: fn(async () => {}) },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "이름 수정" }));
    const dialog = within(await canvas.findByRole("dialog"));
    const input = dialog.getByLabelText("이름");
    await expect(input).toHaveValue("소진");
    await userEvent.clear(input);
    await userEvent.type(input, "  새이름  ");
    await userEvent.click(dialog.getByRole("button", { name: "저장" }));
    await expect(args.onSave).toHaveBeenCalledWith("새이름");
    await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

/** 저장 실패 — 에러 문구가 표시되고 모달은 열린 채 유지된다. */
export const SaveError: Story = {
  args: {
    onSave: fn(async () => {
      throw new Error("network");
    }),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "이름 수정" }));
    const dialog = within(await canvas.findByRole("dialog"));
    await userEvent.click(dialog.getByRole("button", { name: "저장" }));
    await expect(
      await dialog.findByText("저장에 실패했어요. 잠시 후 다시 시도해 주세요.")
    ).toBeInTheDocument();
    await expect(canvas.getByRole("dialog")).toBeInTheDocument();
  },
};

/** 1×1 PNG 데이터 URI — 브라우저 테스트에서 네트워크 없이 로드 성공하는 이미지. */
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const uploadTestFile = () => new File(["x"], "photo.jpg", { type: "image/jpeg" });

/** 이미지 없음 — 기본 셰프 모자 아이콘, 업로드 진입점 노출. */
export const AvatarWithoutImage: Story = {
  args: { imageUrl: null, onImageSelect: fn(async () => {}) },
  play: async ({ canvas }) => {
    await expect(canvas.queryByAltText("프로필 사진")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "프로필 사진 변경" })).toBeInTheDocument();
  },
};

/** 이미지 있음 — 아바타에 사진이 표시된다. */
export const AvatarWithImage: Story = {
  args: { imageUrl: TINY_PNG, onImageSelect: fn(async () => {}) },
  play: async ({ canvas }) => {
    const img = canvas.getByAltText("프로필 사진");
    await expect(img).toHaveAttribute("src", TINY_PNG);
  },
};

/** 업로드 중 — 로딩 표시, 파일 선택 비활성(중복 차단 FR-008). */
export const ImageUploading: Story = {
  args: {
    // 완료되지 않는 업로드 — 업로드 중 상태를 고정해 관찰한다
    onImageSelect: fn(() => new Promise<void>(() => {})),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "프로필 사진 변경" }));
    const dialog = within(await canvas.findByRole("dialog"));
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, uploadTestFile());
    await expect(await dialog.findByRole("status", { name: "업로드 중" })).toBeInTheDocument();
    await expect(dialog.getByRole("button", { name: "파일 선택" })).toBeDisabled();
  },
};

/** 검증 에러 — onImageSelect가 안내 문구와 함께 reject되면 모달에 표시. */
export const ImageValidationError: Story = {
  args: {
    onImageSelect: fn(async () => {
      throw new Error("JPG·PNG·WebP 이미지만 올릴 수 있어요.");
    }),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "프로필 사진 변경" }));
    const dialog = within(await canvas.findByRole("dialog"));
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, uploadTestFile());
    await expect(
      await dialog.findByText("JPG·PNG·WebP 이미지만 올릴 수 있어요.")
    ).toBeInTheDocument();
    await expect(canvas.getByRole("dialog")).toBeInTheDocument();
  },
};

/** 이미지 로드 실패(깨진 URL) — 기본 아이콘으로 폴백한다 (FR-006). */
export const ImageLoadErrorFallback: Story = {
  args: {
    imageUrl: "data:image/png;base64,broken",
    onImageSelect: fn(async () => {}),
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.queryByAltText("프로필 사진")).not.toBeInTheDocument());
    const avatar = canvas.getByRole("button", { name: "프로필 사진 변경" });
    await expect(avatar.querySelector("svg")).not.toBeNull();
  },
};

/** 업로드 실패 — 에러 문구 표시, 기존 이미지 유지(FR-009). */
export const ImageUploadError: Story = {
  args: {
    imageUrl: TINY_PNG,
    onImageSelect: fn(async () => {
      throw new Error("업로드에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }),
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "프로필 사진 변경" }));
    const dialog = within(await canvas.findByRole("dialog"));
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, uploadTestFile());
    await expect(
      await dialog.findByText("업로드에 실패했어요. 잠시 후 다시 시도해 주세요.")
    ).toBeInTheDocument();
    await expect(canvas.getByAltText("프로필 사진")).toHaveAttribute("src", TINY_PNG);
  },
};
