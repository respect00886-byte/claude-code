// ワンタップで付けられる定番コメント。
// 押す場所を覚えられるよう、並びは固定にしている（使う回数で並べ替えない）
export interface TagGroup {
  label: string;
  tags: string[];
}

export const TAG_GROUPS: TagGroup[] = [
  {
    label: "香り",
    tags: ["フルーティ", "華やか", "吟醸香", "穏やか", "米の香り", "熟成香"],
  },
  {
    label: "味",
    // 甘口と辛口は対になっていると分かるよう隣に置く
    tags: ["甘口", "辛口", "旨口", "淡麗", "濃醇", "酸味", "苦み"],
  },
  {
    label: "口当たり",
    tags: ["すっきり", "まろやか", "キレ", "軽快", "とろみ", "ガス感"],
  },
  {
    label: "その他",
    tags: ["食中酒向き", "冷やが合う", "燗が合う", "コスパ良し", "また飲みたい"],
  },
];

export const PRESET_TAGS: string[] = TAG_GROUPS.flatMap((g) => g.tags);
