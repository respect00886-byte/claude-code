// POP画像のサイズ。用紙サイズは実物の寸法（mm）を持ち、画像の縦横比と印刷の大きさに使う。
export type PopSizeId =
  | "a4-landscape"
  | "a4-portrait"
  | "a5-landscape"
  | "a5-portrait"
  | "card"
  | "square";

export interface PopSize {
  id: PopSizeId;
  label: string;
  widthMm: number;
  heightMm: number;
  // 長い辺の画素数。3508 は A4 で約300dpi（印刷所でも使う細かさ）。
  // 小さい用紙も同じ画素数にして、拡大印刷してもぼやけにくくする
  longPx: number;
  // true なら印刷時に A4 用紙いっぱいに広げる。false なら A4 用紙に実物大で出して切って使う
  fillPage: boolean;
}

export const POP_SIZES: PopSize[] = [
  { id: "a4-landscape", label: "A4横", widthMm: 297, heightMm: 210, longPx: 3508, fillPage: true },
  { id: "a4-portrait", label: "A4縦", widthMm: 210, heightMm: 297, longPx: 3508, fillPage: true },
  { id: "a5-landscape", label: "A5横", widthMm: 210, heightMm: 148, longPx: 3508, fillPage: false },
  { id: "a5-portrait", label: "A5縦", widthMm: 148, heightMm: 210, longPx: 3508, fillPage: false },
  { id: "card", label: "名刺（棚用）", widthMm: 91, heightMm: 55, longPx: 3508, fillPage: false },
  // SNS は 2160px 四方あれば十分きれい。印刷するときは15cm四方で出す
  { id: "square", label: "正方形（SNS）", widthMm: 150, heightMm: 150, longPx: 2160, fillPage: false },
];

export function findSize(id: PopSizeId | undefined): PopSize {
  return POP_SIZES.find((s) => s.id === id) ?? POP_SIZES[0];
}

// A4用紙（余白10mm）に印刷するときの大きさ（mm）と用紙の向き
export function printLayout(size: PopSize): {
  landscape: boolean;
  widthMm: number;
  heightMm: number;
} {
  const landscape = size.widthMm > size.heightMm && size.fillPage;
  if (!size.fillPage) return { landscape, widthMm: size.widthMm, heightMm: size.heightMm };
  // 用紙より少し内側に収め、プリンターの都合で2枚目にはみ出さないようにする
  const pageW = (landscape ? 297 : 210) - 22;
  const pageH = (landscape ? 210 : 297) - 22;
  const k = Math.min(pageW / size.widthMm, pageH / size.heightMm);
  return { landscape, widthMm: size.widthMm * k, heightMm: size.heightMm * k };
}
