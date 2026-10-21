export type CheckResult =
  | { kind: "noSales" }
  | {
      kind: "ok" | "short";
      daysLeft: number; // あと何日もつか（小数は切り捨て）
      runOutDate: Date; // 在庫が切れる日
      shortDays: number; // 納品までに足りない日数（足りるときは0）
      shortQty: number; // 納品までに足りない個数の目安（足りるときは0）
    };

// 在庫・1日の販売数・納品までの日数から、在庫のもちを計算する
export function checkStock(
  stock: number,
  perDay: number,
  leadDays: number,
  today: Date = new Date(),
): CheckResult {
  // 売れていない商品は在庫が減らないので、日数を出さない
  if (perDay <= 0) return { kind: "noSales" };

  const daysLeft = Math.floor(stock / perDay);
  const runOutDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysLeft);
  const shortDays = Math.max(0, leadDays - daysLeft);
  // 納品日までに売れる見込みの数から、今の在庫を引いた分が不足
  const shortQty = Math.max(0, Math.ceil(perDay * leadDays - stock));

  return {
    kind: daysLeft < leadDays ? "short" : "ok",
    daysLeft,
    runOutDate,
    shortDays,
    shortQty,
  };
}

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

// 例：10月31日（土）
export function formatDate(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEK[d.getDay()]}）`;
}
