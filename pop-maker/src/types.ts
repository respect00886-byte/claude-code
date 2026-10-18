import type { BackgroundId } from "./data/backgrounds";

export type Target = "kids" | "adult" | "fan" | "gift";
export type Tone = "genki" | "yasashii" | "jouhin";

export interface PopInput {
  name: string;
  features: string[];
  target: Target;
  tone: Tone;
  category?: string; // 特徴の候補を出す商品の種類（data/featureSuggestions.ts の id）
  notices: string[]; // POPの上に帯で出すお知らせ
  background?: BackgroundId;
}

export const TARGET_LABELS: Record<Target, string> = {
  kids: "子ども",
  adult: "大人",
  fan: "ファン向け",
  gift: "プレゼント",
};

export const TONE_LABELS: Record<Tone, string> = {
  genki: "元気・にぎやか",
  yasashii: "やさしい",
  jouhin: "上品・落ち着き",
};
