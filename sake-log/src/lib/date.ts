// toISOString は世界標準時なので、日本の朝9時前に使うと前の日になる。ローカル日付で作る
/** ローカル日付を YYYY-MM-DD で返す */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** YYYY-MM-DD 形式の実在する日付か */
export function isDateKey(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  return toDateKey(new Date(y, m - 1, d)) === v;
}

/** 2026/10/28 形式 */
export function formatDate(key: string): string {
  return key.replace(/-/g, "/");
}
