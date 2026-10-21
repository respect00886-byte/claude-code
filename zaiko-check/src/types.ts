// 売り場の商品1つ分
export interface Item {
  id: string;
  name: string;
  // 今ある在庫の数
  stock: number;
  // 1日にだいたい何個売れるか（小数も可）
  perDay: number;
  // 最後に数を直した日時（ミリ秒）
  updatedAt: number;
}

// 色分けの基準（あと何日以下で色を変えるか）
export interface Thresholds {
  red: number;
  yellow: number;
}

export type Level = "red" | "yellow" | "green" | "none";
