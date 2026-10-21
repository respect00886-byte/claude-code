// 売れ数の入れ方。「期間の合計」から割り算するか、「1日の数」を直接入れるか
export type SalesMode = "period" | "daily";

export interface StockItem {
  id: string;
  name: string;
  // 数えた日の時点の在庫数
  stock: number;
  salesMode: SalesMode;
  periodDays: number;
  periodSold: number;
  dailySold: number;
  // 発注してから届くまでの日数。未入力なら発注の目安は出さない
  leadDays: number | null;
  // 在庫を数えた日（YYYY-MM-DD）。ここから日がたつほど残り日数を減らす
  countedOn: string;
}
