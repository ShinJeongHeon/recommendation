"use client";

import {
  fillIcons,
  outlineIcons,
  type FillIconName,
  type IconName,
  type IconSize,
} from "./icons";

export interface IconProps {
  name: IconName;
  /** 디자인시스템 아이콘 사이즈: 16 | 20 | 24 | 32 */
  size?: IconSize;
  className?: string;
  /** 지정 시 장식용이 아닌 의미 있는 아이콘으로 노출된다(role="img"). */
  "aria-label"?: string;
}

function isFillIcon(name: IconName): name is FillIconName {
  return name in fillIcons;
}

/**
 * 파운데이션 아이콘. 색상은 currentColor를 상속하므로
 * 텍스트 컬러 토큰(text-text-default 등)으로 제어한다.
 */
export function Icon({ name, size = 24, className, "aria-label": ariaLabel }: IconProps) {
  const a11yProps = ariaLabel
    ? ({ role: "img", "aria-label": ariaLabel } as const)
    : ({ "aria-hidden": true } as const);

  if (isFillIcon(name)) {
    const FillIcon = fillIcons[name];
    return <FillIcon size={size} weight="fill" className={className} {...a11yProps} />;
  }
  const OutlineIcon = outlineIcons[name];
  return <OutlineIcon size={size} className={className} {...a11yProps} />;
}
