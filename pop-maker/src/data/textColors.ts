// 文字の色の選択肢。"auto" は背景ごとに決まった色（data/backgrounds.ts の text）を使う
export type TextColorId = "auto" | "black" | "navy" | "red" | "green" | "brown" | "pink" | "orange";

export interface TextColor {
  id: TextColorId;
  label: string;
  color: string;
}

// 補足文の標準の色。見出しの色に負けないよう、黒より少しやわらかい濃いグレーにしている
export const SUB_DEFAULT_COLOR = "#333333";

// 白っぽい背景の上でも遠くから読めるよう、どれも濃いめの色にしている
export const TEXT_COLORS: TextColor[] = [
  { id: "black", label: "黒", color: "#1f1f1f" },
  { id: "navy", label: "紺", color: "#1d2b53" },
  { id: "red", label: "赤", color: "#cf1322" },
  { id: "green", label: "緑", color: "#237804" },
  { id: "brown", label: "茶", color: "#5c3d24" },
  { id: "pink", label: "ピンク", color: "#c41d7f" },
  { id: "orange", label: "オレンジ", color: "#d4380d" },
];

// 色を決める。"auto"（未設定）のときは fallback（背景に合わせた色）を使う
export function resolveTextColor(id: TextColorId | undefined, fallback: string): string {
  return TEXT_COLORS.find((c) => c.id === id)?.color ?? fallback;
}
