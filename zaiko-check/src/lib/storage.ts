import type { Item, Thresholds } from "../types";

const ITEMS_KEY = "zaiko-check:items";
const SETTINGS_KEY = "zaiko-check:settings";

export const DEFAULT_THRESHOLDS: Thresholds = { red: 7, yellow: 14 };

// 商品リスト。この端末のブラウザの中だけに保存する
export function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (raw == null) return [];
    const saved = JSON.parse(raw);
    return Array.isArray(saved) ? (saved as Item[]) : [];
  } catch {
    return [];
  }
}

export function saveItems(items: Item[]): void {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    // 保存できない環境（プライベートモード等）でも画面はそのまま使えるようにする
  }
}

export function loadThresholds(): Thresholds {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw == null) return DEFAULT_THRESHOLDS;
    return { ...DEFAULT_THRESHOLDS, ...(JSON.parse(raw) as Partial<Thresholds>) };
  } catch {
    return DEFAULT_THRESHOLDS;
  }
}

export function saveThresholds(t: Thresholds): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(t));
  } catch {
    // 保存できなくても、開いている間はそのまま使える
  }
}
