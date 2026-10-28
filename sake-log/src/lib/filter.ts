import type { Sake } from "../db";

export type SortKey = "new" | "rating";

export interface FilterOptions {
  query: string;
  /** ここに入っているコメントを「すべて」付けた記録だけ残す */
  tags: string[];
  sort: SortKey;
}

/**
 * 検索用に文字をそろえる。
 * 全角/半角・大文字/小文字・ひらがな/カタカナの違いで見つからないことがないようにする
 */
export function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
    .replace(/\s+/g, "");
}

function matchesQuery(s: Sake, words: string[]): boolean {
  if (words.length === 0) return true;
  const text = normalize([s.name, s.brewery, s.prefecture, s.shopName, s.type].join(" "));
  return words.every((w) => text.includes(w));
}

export function filterSakes(list: Sake[], { query, tags, sort }: FilterOptions): Sake[] {
  const words = query.split(/\s+/).map(normalize).filter(Boolean);
  const result = list.filter(
    (s) => matchesQuery(s, words) && tags.every((t) => s.tags.includes(t)),
  );
  const byNew = (a: Sake, b: Sake) =>
    b.drankOn.localeCompare(a.drankOn) || b.createdAt - a.createdAt;
  return result.sort(sort === "rating" ? (a, b) => b.rating - a.rating || byNew(a, b) : byNew);
}

/** 過去に入力した店名（最近使った順・重複なし）。入力欄の候補に使う */
export function recentShopNames(list: Sake[]): string[] {
  const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
  return [...new Set(sorted.map((s) => s.shopName).filter(Boolean))];
}

/** 一番最近記録したもの（新規記録の初期値に使う） */
export function latestSake(list: Sake[]): Sake | undefined {
  return list.reduce<Sake | undefined>(
    (a, b) => (!a || b.createdAt > a.createdAt ? b : a),
    undefined,
  );
}

/** 一覧で「あとで追記」の印を出すか（くわしい項目が空のとき） */
export function isIncomplete(s: Sake): boolean {
  return !s.type || !s.brewery || !s.prefecture || !s.shopName;
}
