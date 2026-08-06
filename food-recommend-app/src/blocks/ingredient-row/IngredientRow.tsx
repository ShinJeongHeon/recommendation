import type { FridgeItem } from "@/data/fridge";

/** 냉장고 재료 행 — 이름·잔여 상태·신선도 바·구매일. */
export function IngredientRow({ item }: { item: FridgeItem }) {
  const statusColor = item.statusTone === "success" ? "text-text-success" : "text-text-warning";
  const barColor = item.statusTone === "success" ? "bg-background-success" : "bg-background-warning";

  return (
    <div className="flex flex-col gap-1.5 py-3.5">
      <div className="flex items-center justify-between">
        <span className="typo-label-lg text-text-default">{item.name}</span>
        <span className={`typo-label-lg ${statusColor}`}>{item.status}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-muted">
        <div
          data-slot="freshness"
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${item.freshness}%` }}
        />
      </div>
      <span className="self-end typo-label-md text-text-muted">{item.purchasedOn}</span>
    </div>
  );
}
