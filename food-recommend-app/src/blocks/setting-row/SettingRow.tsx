import type { ReactNode } from "react";
import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";

export interface SettingRowProps {
  icon: IconName;
  label: string;
  value?: string;
  chevron?: boolean;
  /** 우측 커스텀 컨트롤(토글 등) — value·chevron 대신 사용 */
  control?: ReactNode;
}

/** 마이페이지 설정 행 — 아이콘·라벨·우측 값/셰브론 또는 컨트롤. */
export function SettingRow({ icon, label, value, chevron = false, control }: SettingRowProps) {
  return (
    <div className="flex min-h-12 items-center gap-3 py-2">
      <Icon name={icon} size={20} className="shrink-0 text-text-subtle" />
      <span className="flex-1 typo-body-lg text-text-default">{label}</span>
      {control ?? (
        <span className="flex items-center gap-1.5">
          {value && <span className="typo-body-md text-text-subtle">{value}</span>}
          {chevron && <Icon name="chevron-right" size={16} className="text-text-placeholder" />}
        </span>
      )}
    </div>
  );
}
