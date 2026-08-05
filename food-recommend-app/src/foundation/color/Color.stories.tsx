import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { useState } from "react";

const PALETTE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const PRIMITIVE_PALETTES = [
  { key: "brand", label: "브랜드" },
  { key: "neutral", label: "뉴트럴" },
  { key: "green", label: "성공 (green)" },
  { key: "amber", label: "경고 (amber)" },
  { key: "blue", label: "정보 (blue)" },
  { key: "red", label: "에러 (red)" },
] as const;

const ALPHA_TOKENS = [
  "color-alpha-dark-6",
  "color-alpha-dark-8",
  "color-alpha-dark-65",
  "color-alpha-dark-70",
  "color-alpha-dark-80",
  "color-alpha-light-15",
  "color-alpha-light-70",
  "color-alpha-light-80",
  "color-alpha-light-85",
  "color-alpha-transparent",
];

const LOGO_TOKENS = [
  "color-logo-google-blue",
  "color-logo-google-green",
  "color-logo-google-yellow",
  "color-logo-google-red",
];

const SEMANTIC_GROUPS: { label: string; tokens: [name: string, ref: string][] }[] = [
  {
    label: "텍스트",
    tokens: [
      ["color-text-default", "color-neutral-950"],
      ["color-text-subtle", "color-neutral-600"],
      ["color-text-muted", "color-neutral-500"],
      ["color-text-placeholder", "color-neutral-400"],
      ["color-text-disabled", "color-neutral-300"],
      ["color-text-inverse", "color-neutral-50"],
      ["color-text-brand", "color-brand-600"],
      ["color-text-brand-strong", "color-brand-700"],
      ["color-text-on-brand", "color-neutral-50"],
      ["color-text-success", "color-green-600"],
      ["color-text-on-success", "color-neutral-50"],
      ["color-text-warning", "color-amber-700"],
      ["color-text-on-warning", "color-amber-950"],
      ["color-text-warning-inverse", "color-amber-300"],
      ["color-text-info", "color-blue-600"],
      ["color-text-on-info", "color-neutral-50"],
      ["color-text-error", "color-red-600"],
      ["color-text-on-error", "color-neutral-50"],
    ],
  },
  {
    label: "배경",
    tokens: [
      ["color-background-default", "color-neutral-100"],
      ["color-background-surface", "color-neutral-50"],
      ["color-background-muted", "color-neutral-200"],
      ["color-background-strong", "color-neutral-400"],
      ["color-background-inverse", "color-neutral-950"],
      ["color-background-disabled", "color-neutral-200"],
      ["color-background-brand", "color-brand-500"],
      ["color-background-brand-hover", "color-brand-600"],
      ["color-background-brand-subtle", "color-brand-100"],
      ["color-background-success", "color-green-500"],
      ["color-background-success-subtle", "color-green-100"],
      ["color-background-warning", "color-amber-300"],
      ["color-background-warning-subtle", "color-amber-100"],
      ["color-background-info", "color-blue-500"],
      ["color-background-info-subtle", "color-blue-100"],
      ["color-background-error", "color-red-500"],
      ["color-background-error-subtle", "color-red-100"],
      ["color-background-scrim-subtle", "color-alpha-dark-65"],
      ["color-background-scrim", "color-alpha-dark-70"],
      ["color-background-scrim-strong", "color-alpha-dark-80"],
      ["color-background-surface-translucent-subtle", "color-alpha-light-70"],
      ["color-background-surface-translucent", "color-alpha-light-80"],
      ["color-background-surface-translucent-strong", "color-alpha-light-85"],
      ["color-background-track-inverse", "color-alpha-light-15"],
      ["color-background-transparent", "color-alpha-transparent"],
    ],
  },
  {
    label: "보더",
    tokens: [
      ["color-border-default", "color-neutral-300"],
      ["color-border-subtle", "color-neutral-200"],
      ["color-border-strong", "color-neutral-400"],
      ["color-border-inverse", "color-neutral-950"],
      ["color-border-brand", "color-brand-500"],
      ["color-border-brand-subtle", "color-brand-200"],
      ["color-border-success", "color-green-500"],
      ["color-border-success-subtle", "color-green-200"],
      ["color-border-warning", "color-amber-400"],
      ["color-border-warning-subtle", "color-amber-200"],
      ["color-border-info", "color-blue-500"],
      ["color-border-info-subtle", "color-blue-200"],
      ["color-border-error", "color-red-500"],
      ["color-border-error-subtle", "color-red-200"],
      ["color-border-transparent", "color-alpha-transparent"],
    ],
  },
  {
    label: "섀도우",
    tokens: [
      ["color-shadow-default", "color-alpha-dark-6"],
      ["color-shadow-strong", "color-alpha-dark-8"],
    ],
  },
];

const CHECKER_STYLE: React.CSSProperties = {
  backgroundImage:
    "conic-gradient(#e5e5e5 0 25%, #ffffff 0 50%, #e5e5e5 0 75%, #ffffff 0)",
  backgroundSize: "12px 12px",
};

function ResolvedValue({ token }: { token: string }) {
  const [value] = useState(() =>
    typeof window === "undefined"
      ? ""
      : getComputedStyle(document.documentElement)
          .getPropertyValue(`--${token}`)
          .trim()
          .toUpperCase(),
  );
  return <span className="typo-label-md text-text-muted">{value}</span>;
}

function Swatch({ token, caption }: { token: string; caption: string }) {
  return (
    <div className="flex w-20 flex-col items-center gap-1">
      <div className="size-16 overflow-hidden rounded-lg border border-border-subtle" style={CHECKER_STYLE}>
        <div
          data-token={token}
          className="size-full"
          style={{ backgroundColor: `var(--${token})` }}
        />
      </div>
      <span className="typo-label-md text-text-subtle">{caption}</span>
      <ResolvedValue token={token} />
    </div>
  );
}

function PaletteRow({ label, tokens }: { label: string; tokens: { token: string; caption: string }[] }) {
  return (
    <div className="flex items-start gap-4">
      <h3 className="typo-heading-sm w-28 shrink-0 pt-5 text-text-default">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {tokens.map(({ token, caption }) => (
          <Swatch key={token} token={token} caption={caption} />
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: "Foundation/Color",
  parameters: { layout: "padded" },
  tags: ["ai-generated"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** 프리미티브 팔레트 — 컬러별 1행, 토큰당 정사각형 1개 (디자인 팔레트 프레임과 동일 구조) */
export const Primitive: Story = {
  render: () => (
    <div className="flex flex-col gap-8 bg-background-surface p-6">
      <h2 className="typo-display-sm text-text-default">프리미티브 토큰</h2>
      {PRIMITIVE_PALETTES.map(({ key, label }) => (
        <PaletteRow
          key={key}
          label={label}
          tokens={PALETTE_STEPS.map((step) => ({
            token: `color-${key}-${step}`,
            caption: String(step),
          }))}
        />
      ))}
      <PaletteRow
        label="알파"
        tokens={ALPHA_TOKENS.map((token) => ({
          token,
          caption: token.replace("color-alpha-", ""),
        }))}
      />
      <PaletteRow
        label="로고"
        tokens={LOGO_TOKENS.map((token) => ({
          token,
          caption: token.replace("color-logo-", ""),
        }))}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // 토큰 CSS가 로드되지 않으면 var()가 해석되지 않아 실패한다.
    const brand500 = canvasElement.querySelector('[data-token="color-brand-500"]');
    await expect(getComputedStyle(brand500!).backgroundColor).toBe("rgb(226, 85, 43)");
    const swatches = canvasElement.querySelectorAll("[data-token]");
    await expect(swatches).toHaveLength(6 * 11 + ALPHA_TOKENS.length + LOGO_TOKENS.length);
  },
};

/** 시맨틱 토큰 — 프리미티브 참조 관계와 함께 표시 */
export const Semantic: Story = {
  render: () => (
    <div className="flex flex-col gap-8 bg-background-surface p-6">
      <h2 className="typo-display-sm text-text-default">시맨틱 토큰</h2>
      {SEMANTIC_GROUPS.map(({ label, tokens }) => (
        <section key={label} className="flex flex-col gap-3">
          <h3 className="typo-heading-md text-text-default">{label}</h3>
          <ul className="flex flex-col">
            {tokens.map(([name, ref]) => (
              <li key={name} className="flex items-center gap-3 border-b border-border-subtle py-2">
                <span className="size-8 shrink-0 overflow-hidden rounded-md border border-border-subtle" style={CHECKER_STYLE}>
                  <span
                    data-token={name}
                    className="block size-full"
                    style={{ backgroundColor: `var(--${name})` }}
                  />
                </span>
                <code className="typo-label-lg min-w-80 text-text-default">{name}</code>
                <span className="typo-label-md text-text-muted">→ {ref}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // 시맨틱 → 프리미티브 참조가 런타임에 해석되는지 확인 (#1C1A16)
    const textDefault = canvasElement.querySelector('[data-token="color-text-default"]');
    await expect(getComputedStyle(textDefault!).backgroundColor).toBe("rgb(28, 26, 22)");
  },
};
