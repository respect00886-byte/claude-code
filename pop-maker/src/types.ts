import type { BackgroundId } from "./data/backgrounds";
import type { PopSizeId } from "./data/sizes";
import type { TextColorId } from "./data/textColors";

export type Target = "kids" | "adult" | "fan" | "gift";
export type Tone = "genki" | "yasashii" | "jouhin";

export interface PopInput {
  heading: string; // POPの見出し（大きい文字）。自分で入力するのが基本
  sub: string; // 見出しの下に添える補足文（小さい文字）
  name: string; // ここから下の name〜tone は、サブ機能「自動で候補を出す」用
  features: string[];
  target: Target;
  tone: Tone;
  category?: string; // 特徴の候補を出す商品の種類（data/featureSuggestions.ts の id）
  notices: string[]; // POPの上に帯で出すお知らせ
  background?: BackgroundId;
  size?: PopSizeId; // 保存・印刷する画像の大きさ（未設定なら A4横）
  headingColor?: TextColorId; // 見出しの色（未設定なら背景に合わせる）
  subColor?: TextColorId; // 補足文の色（未設定なら濃いグレー）
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
