import type { StockItem } from "../types";

const ITEMS_KEY = "stock-days:items";

// 登録した商品の一覧。次に開いたときも続きから使えるよう残しておく
export function loadItems(): StockItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    return raw == null ? [] : (JSON.parse(raw) as StockItem[]);
  } catch {
    return [];
  }
}

export function saveItems(items: StockItem[]): void {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    // 保存できない環境（プライベートモード等）でも、開いている間は使えるようにする
  }
}
