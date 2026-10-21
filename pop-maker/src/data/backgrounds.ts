// POP画像の背景。模様はすべて lib/drawPop.ts でコードから描く（画像素材は使わない）。
export type BackgroundId =
  | "simple"
  | "dots"
  | "stars"
  | "lines"
  | "stripe"
  | "frame"
  | "plain"
  | "formal"
  | "gray"
  | "navy"
  | "beige";

export interface Background {
  id: BackgroundId;
  label: string;
  base: string; // 地の色
  pattern: string; // 模様・枠の色
  accent: string; // 2色目の模様
  text: string; // キャッチコピーの色
  calm?: boolean; // お詫びなどに使うおとなしい背景。選ぶ欄で別の段に分けて出す
}

export const BACKGROUNDS: Background[] = [
  {
    id: "simple",
    label: "シンプル",
    base: "#fffbe6",
    pattern: "#ff7a45",
    accent: "#ff7a45",
    text: "#d4380d",
  },
  {
    id: "dots",
    label: "水玉",
    base: "#fff0f6",
    pattern: "#ffadd2",
    accent: "#ffd6e7",
    text: "#c41d7f",
  },
  {
    id: "stars",
    label: "星",
    base: "#e6f4ff",
    pattern: "#ffd666",
    accent: "#91caff",
    text: "#0958d9",
  },
  {
    id: "lines",
    label: "ノート罫線",
    base: "#ffffff",
    pattern: "#bae0ff",
    accent: "#ffa39e",
    text: "#1d39c4",
  },
  {
    id: "stripe",
    label: "ストライプ",
    base: "#fffbe6",
    pattern: "#ffe58f",
    accent: "#ffe58f",
    text: "#ad4e00",
  },
  {
    id: "frame",
    label: "二重フレーム",
    base: "#ffffff",
    pattern: "#389e0d",
    accent: "#95de64",
    text: "#237804",
  },
  // ---- おとなしい背景（お詫び・お知らせ向け）。模様は入れず、細い枠だけにする ----
  {
    id: "plain",
    label: "白・細枠",
    base: "#ffffff",
    pattern: "#9e9e9e",
    accent: "#9e9e9e",
    text: "#262626",
    calm: true,
  },
  {
    id: "formal",
    label: "かしこまり",
    base: "#ffffff",
    pattern: "#1f1f1f",
    accent: "#1f1f1f",
    text: "#000000",
    calm: true,
  },
  {
    id: "gray",
    label: "薄グレー",
    base: "#f2f2f2",
    pattern: "#bfbfbf",
    accent: "#bfbfbf",
    text: "#333333",
    calm: true,
  },
  {
    id: "navy",
    label: "紺の細枠",
    base: "#ffffff",
    pattern: "#1d2b53",
    accent: "#1d2b53",
    text: "#1d2b53",
    calm: true,
  },
  {
    id: "beige",
    label: "ベージュ",
    base: "#faf5ea",
    pattern: "#a1785a",
    accent: "#a1785a",
    text: "#5c3d24",
    calm: true,
  },
];

export function findBackground(id: string | undefined): Background {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}
