import type { BackgroundId } from "../data/backgrounds";
import type { PopSizeId } from "../data/sizes";
import type { TextColorId } from "../data/textColors";

// まとめて印刷に入れた原稿1つ分。作ったときの見た目をそのまま残す
export interface BatchItem {
  id: string;
  size: BatchSizeId;
  copies: number; // 印刷する枚数
  heading: string;
  sub: string;
  notices: string[];
  background?: BackgroundId;
  headingColor?: TextColorId;
  subColor?: TextColorId;
}

export type BatchSizeId = Extract<PopSizeId, "card" | "a5-landscape" | "a5-portrait">;

// A4用紙1枚への並べ方
export interface SheetLayout {
  size: BatchSizeId;
  label: string;
  landscape: boolean; // 用紙の向き
  marginMm: number; // 用紙の余白
  cols: number;
  rows: number;
  cellWidthMm: number; // 1枚分の印刷の大きさ
  cellHeightMm: number;
  note: string;
}

export const SHEET_LAYOUTS: SheetLayout[] = [
  // 名刺は実物大で 2列×5段。91×2=182mm、55×5=275mm で、余白10mmのA4（190×277mm）に収まる
  {
    size: "card",
    label: "名刺（棚用）",
    landscape: false,
    marginMm: 10,
    cols: 2,
    rows: 5,
    cellWidthMm: 91,
    cellHeightMm: 55,
    note: "A4用紙1枚に10枚（実物大）",
  },
  // A5はA4のちょうど半分だが、プリンターは紙の端まで印刷できないので95%に縮めて2枚並べる
  {
    size: "a5-landscape",
    label: "A5横",
    landscape: false,
    marginMm: 5,
    cols: 1,
    rows: 2,
    cellWidthMm: 210 * 0.95,
    cellHeightMm: 148 * 0.95,
    note: "A4用紙1枚に2枚（実物の約95%）",
  },
  {
    size: "a5-portrait",
    label: "A5縦",
    landscape: true,
    marginMm: 5,
    cols: 2,
    rows: 1,
    cellWidthMm: 148 * 0.95,
    cellHeightMm: 210 * 0.95,
    note: "A4用紙1枚に2枚（実物の約95%）",
  },
];

export function findSheetLayout(size: string | undefined): SheetLayout | undefined {
  return SHEET_LAYOUTS.find((l) => l.size === size);
}

// 枚数の分だけ原稿を並べ、用紙1枚ごとに分ける
export function paginate(items: BatchItem[], layout: SheetLayout): BatchItem[][] {
  const perPage = layout.cols * layout.rows;
  const all = items.filter((i) => i.size === layout.size).flatMap((i) => Array(i.copies).fill(i));
  const pages: BatchItem[][] = [];
  for (let i = 0; i < all.length; i += perPage) pages.push(all.slice(i, i + perPage));
  return pages;
}
