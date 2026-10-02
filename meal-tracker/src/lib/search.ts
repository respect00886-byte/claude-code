import type { MenuItem } from "../types";

/** Simple case/kana-insensitive substring match over name and brand. Good enough for v1. */
export function searchMenuItems(query: string, items: MenuItem[]): MenuItem[] {
  const q = normalize(query.trim());
  if (q === "") return [];
  return items.filter((item) => {
    const haystack = normalize(`${item.name} ${item.brand ?? ""}`);
    return haystack.includes(q);
  });
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

/** Distinct brand names present in a menu list, sorted for stable chip ordering. */
export function extractBrands(items: MenuItem[]): string[] {
  const brands = new Set(items.map((item) => item.brand).filter((b): b is string => !!b));
  return Array.from(brands).sort((a, b) => a.localeCompare(b, "ja"));
}
