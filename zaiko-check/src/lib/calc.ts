import type { Item, Level, Thresholds } from "../types";

// あと何日もつか。売れていない商品は計算できないので null を返す
export function daysLeft(item: Item): number | null {
  if (item.perDay <= 0) return null;
  return item.stock / item.perDay;
}

export function levelOf(days: number | null, t: Thresholds): Level {
  if (days == null) return "none";
  if (days <= t.red) return "red";
  if (days <= t.yellow) return "yellow";
  return "green";
}

export const LEVEL_LABEL: Record<Level, string> = {
  red: "発注",
  yellow: "注意",
  green: "大丈夫",
  none: "売れていない",
};

// 「あと3.3日」のように見せると迷うので、切り捨てて整数日で出す
export function formatDays(days: number | null): string {
  if (days == null) return "−";
  return `${Math.floor(days)}日`;
}

// 最後に数を直した日から数えて、在庫が切れる目安の日（例：10/31ごろ）
export function runOutDate(item: Item): string {
  const days = daysLeft(item);
  if (days == null) return "";
  const d = new Date(item.updatedAt + Math.floor(days) * 24 * 60 * 60 * 1000);
  return `${d.getMonth() + 1}/${d.getDate()}ごろ`;
}

// もちが短い順。売れていない商品は最後に回す
export function sortByDays(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    const da = daysLeft(a);
    const db = daysLeft(b);
    if (da == null && db == null) return a.name.localeCompare(b.name, "ja");
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });
}
