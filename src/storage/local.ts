import type {
  InventoryItem,
  MealRecord,
  RecommendationLog,
  SavingsEntry,
  SavingsLedger,
  TasteProfile,
} from '../domain/types';

export interface KeyValueBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// contracts/storage-schema.md — fr.v1.* 키, 파싱 불가 시 기본값, 쓰기 실패는 전파
const KEYS = {
  profile: 'fr.v1.profile',
  meals: 'fr.v1.meals',
  inventory: 'fr.v1.inventory',
  recolog: 'fr.v1.recolog',
  savings: 'fr.v1.savings',
} as const;

const LOG_RETENTION_DAYS = 90;
const DAY_MS = 86_400_000;

export interface Storage {
  loadProfile(): TasteProfile | null;
  saveProfile(p: TasteProfile): void;
  loadMeals(): MealRecord[];
  appendMeal(m: MealRecord): void;
  loadInventory(): InventoryItem[];
  saveInventory(items: InventoryItem[]): void;
  loadTodayLog(today: string): RecommendationLog | null;
  saveTodayLog(log: RecommendationLog): void;
  loadSavings(): SavingsLedger;
  appendSaving(entry: SavingsEntry): void;
}

function parse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function createStorage(backend: KeyValueBackend): Storage {
  const read = <T,>(key: string, fallback: T): T => parse(backend.getItem(key), fallback);
  const write = (key: string, value: unknown): void => {
    backend.setItem(key, JSON.stringify(value));
  };
  const readLogs = (): RecommendationLog[] => {
    const v = read<RecommendationLog[]>(KEYS.recolog, []);
    return Array.isArray(v) ? v : [];
  };

  return {
    loadProfile() {
      const p = read<TasteProfile | null>(KEYS.profile, null);
      if (p && typeof p === 'object' && Array.isArray(p.excludedIngredients)) return p;
      return null;
    },
    saveProfile(p) {
      write(KEYS.profile, p);
    },
    loadMeals() {
      const v = read<MealRecord[]>(KEYS.meals, []);
      return Array.isArray(v) ? v : [];
    },
    appendMeal(m) {
      const all = this.loadMeals();
      all.push(m);
      write(KEYS.meals, all);
    },
    loadInventory() {
      const v = read<InventoryItem[]>(KEYS.inventory, []);
      return Array.isArray(v) ? v : [];
    },
    saveInventory(items) {
      write(KEYS.inventory, items);
    },
    loadTodayLog(today) {
      return readLogs().find((l) => l.date === today) ?? null;
    },
    saveTodayLog(log) {
      const cutoff = new Date(new Date(`${log.date}T00:00:00`).getTime() - LOG_RETENTION_DAYS * DAY_MS);
      const rest = readLogs().filter(
        (l) => l.date !== log.date && new Date(`${l.date}T00:00:00`).getTime() >= cutoff.getTime(),
      );
      rest.push(log);
      write(KEYS.recolog, rest);
    },
    loadSavings() {
      const v = read<SavingsLedger>(KEYS.savings, { entries: [] });
      return v && Array.isArray(v.entries) ? v : { entries: [] };
    },
    appendSaving(entry) {
      const ledger = this.loadSavings();
      ledger.entries.push(entry);
      write(KEYS.savings, ledger);
    },
  };
}

/** 브라우저 런타임용 기본 백엔드 */
export function browserBackend(): KeyValueBackend {
  return window.localStorage;
}
