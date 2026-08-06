import { SettingRow } from "@/blocks/setting-row/SettingRow";
import { Chip } from "@/ui/chip/Chip";
import { Switch } from "@/ui/switch/Switch";
import { MyProfileCard } from "./MyProfileCard";

const CARD = "rounded-card border border-border-default bg-background-surface";

export interface MyPageViewProps {
  profileName: string;
  /** 표시용 공개 URL (base + path 조합, 없으면 null → 기본 아이콘) */
  profileImageUrl: string | null;
}

export function MyPageView({ profileName, profileImageUrl }: MyPageViewProps) {
  return (
    <main className="flex flex-col gap-5 pt-8">
      <h1 className="typo-display-sm text-text-default">마이페이지</h1>

      <MyProfileCard
        name={profileName}
        subtitle="집밥 34일째 · 총 62끼 · 절약 384,000원"
        imageUrl={profileImageUrl}
      />

      <div className={`${CARD} flex flex-col gap-3.5 p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="typo-label-lg text-text-default">저녁 추천 알림</span>
            <span className="typo-body-md text-text-subtle">묻기 전에 먼저 보내드리는 하루 한 번의 알림</span>
          </div>
          <Switch defaultChecked label="제철 재료 알림" className="shrink-0" />
        </div>
        <div className="flex gap-2">
          <Chip selected>17:30</Chip>
          <Chip>18:30</Chip>
          <Chip>퇴근할 때</Chip>
        </div>
        <p className="typo-label-md text-text-muted">장 보기 전에 받아 보고 싶다면 퇴근 시간대로 맞춰 두세요.</p>
      </div>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
        <section className="flex flex-col gap-2">
          <h2 className="typo-label-md text-text-muted">추천 맞춤</h2>
          <div className={`${CARD} flex flex-col px-4 py-1.5`}>
            <SettingRow icon="heart" label="취향 다시 설정" value="3문항" chevron />
            <SettingRow icon="ban" label="못 먹는 재료" value="2개" chevron />
            <SettingRow icon="flame" label="주방 환경" value="1구 · 에어프라이어" chevron />
            <SettingRow icon="wallet" label="월 식비 목표" value="300,000원" chevron />
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="typo-label-md text-text-muted">표시 방식</h2>
          <div className={`${CARD} flex flex-col px-4 py-1.5`}>
            <SettingRow icon="scale" label="계량 단위" value="밥숟갈 · 종이컵" chevron />
            <SettingRow
              icon="comment"
              label="재고 확인 질문"
              control={<Switch defaultChecked label="제철 재료 알림" />}
            />
            <SettingRow icon="languages" label="가격 표시" value="장보기 총액 우선" chevron />
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="typo-label-md text-text-muted">기타</h2>
          <div className={`${CARD} flex flex-col px-4 py-1.5`}>
            <SettingRow icon="shield-check" label="데이터 · 개인정보" chevron />
            <SettingRow icon="comment" label="의견 보내기" chevron />
            <SettingRow icon="info" label="버전" value="1.0.0" />
          </div>
        </section>
      </div>
    </main>
  );
}
