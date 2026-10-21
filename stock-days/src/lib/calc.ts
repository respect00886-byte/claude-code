import type { StockItem } from "../types";

// 色分けの段階。none は売れ数が0で計算できないもの
export type Level = "danger" | "warn" | "ok" | "none";

export interface StockResult {
  perDay: number;
  // あと何日もつか（今日から数えて）。計算できなければ null
  daysLeft: number | null;
  emptyOn: string | null;
  // 発注すべき日と、そこまでの日数（マイナスなら過ぎている）
  orderBy: string | null;
  daysToOrder: number | null;
  level: Level;
}

// 日付は時刻のずれで1日ずれないよう、"YYYY-MM-DD" の文字列のまま扱う
export function todayStr(): string {
  return toStr(new Date());
}

function toStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function parse(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return toStr(d);
}

// 夏時間などで1日が24時間でない日があっても狂わないよう、四捨五入する
function diffDays(from: string, to: string): number {
  return Math.round((parse(to).getTime() - parse(from).getTime()) / 86400000);
}

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDate(s: string): string {
  const d = parse(s);
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEK[d.getDay()]})`;
}

export function perDayOf(item: StockItem): number {
  if (item.salesMode === "daily") return item.dailySold;
  return item.periodDays > 0 ? item.periodSold / item.periodDays : 0;
}

export function calcStock(item: StockItem, today: string): StockResult {
  const perDay = perDayOf(item);
  // 未来の日付が入っていても、経過日数はマイナスにしない
  const elapsed = Math.max(0, diffDays(item.countedOn, today));

  let daysLeft: number | null;
  if (item.stock <= 0) {
    daysLeft = 0;
  } else if (perDay <= 0) {
    daysLeft = null;
  } else {
    // 「あと2.7日」は2日目の途中で無くなるので、切り捨てて少なめに見ておく
    daysLeft = Math.max(0, Math.floor(item.stock / perDay - elapsed));
  }

  if (daysLeft == null) {
    return { perDay, daysLeft, emptyOn: null, orderBy: null, daysToOrder: null, level: "none" };
  }

  const emptyOn = addDays(today, daysLeft);
  const daysToOrder = item.leadDays == null ? null : daysLeft - item.leadDays;
  const orderBy = daysToOrder == null ? null : addDays(today, daysToOrder);

  let level: Level = "ok";
  if (daysLeft <= 3 || (daysToOrder != null && daysToOrder <= 0)) level = "danger";
  else if (daysLeft <= 7 || (daysToOrder != null && daysToOrder <= 3)) level = "warn";

  return { perDay, daysLeft, emptyOn, orderBy, daysToOrder, level };
}

// もうすぐ無くなる順。計算できないものは最後に回す
export function compareResults(a: StockResult, b: StockResult): number {
  if (a.daysLeft == null || b.daysLeft == null) {
    return (a.daysLeft == null ? 1 : 0) - (b.daysLeft == null ? 1 : 0);
  }
  if (a.daysLeft !== b.daysLeft) return a.daysLeft - b.daysLeft;
  return (a.daysToOrder ?? 99999) - (b.daysToOrder ?? 99999);
}
