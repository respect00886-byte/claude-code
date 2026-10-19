import { TEMPLATES } from "../data/templates";
import type { PopInput } from "../types";

// POPは遠くから一目で読める長さが良いので、これを超える文は後ろに回す
export const MAX_LENGTH = 25;
const COUNT = 8;

// ひな形の「/」（行を変えてよい位置）を、画面に出ない文字にして候補の中に残す。
// POPに描くときはこの位置で改行し、コピーするときは取り除く
export const BREAK = "\u200b";

export function plainText(text: string): string {
  return text.split(BREAK).join("");
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 「消せる」「かわいい」「書きやすかった」のような言葉かどうか（最後の1文字で判断する簡易版）
function isPredicate(feature: string): boolean {
  return /[るいた]$/.test(feature);
}

// 「〜が」「〜で」が続く位置用。「消せるが」は不自然なので「消せることが」にする
function asNoun(feature: string): string {
  return isPredicate(feature) ? `${feature}こと` : feature;
}

// 商品名の前に付ける形。「ラメ入りの」は「の」が要るが、「消せる」はそのままつながる
function asModifier(feature: string): string {
  return isPredicate(feature) || /[のな]$/.test(feature) ? feature : `${feature}の`;
}

function fillFeature(text: string, feature: string): string {
  return text.replace(/\{特徴の\}/g, asModifier(feature)).replace(/\{特徴\}/g, asNoun(feature));
}

// 入力に合うひな形すべてに商品名・特徴を当てはめた文を作る
export function buildAll(input: PopInput): string[] {
  const name = input.name.trim();
  const features = input.features.map((f) => f.trim()).filter((f) => f !== "");
  const results = new Set<string>();

  for (const t of TEMPLATES) {
    if (!t.tones.includes(input.tone)) continue;
    if (t.targets && !t.targets.includes(input.target)) continue;

    // 商品名に「/」が入っていても区切りと間違えないよう、先に置き換えておく
    const filled = t.text.replace(/\//g, BREAK).replace(/\{商品\}/g, name);
    if (filled.includes("{特徴")) {
      // 特徴が複数あれば、それぞれで1文ずつ作る
      for (const f of features) results.add(fillFeature(filled, f));
    } else {
      results.add(filled);
    }
  }
  return [...results];
}

// 候補をランダムに選ぶ。短い文を優先し、長すぎる文は足りないときだけ使う
export function generate(input: PopInput): string[] {
  const all = shuffle(buildAll(input));
  const short = all.filter((s) => plainText(s).length <= MAX_LENGTH);
  const long = all.filter((s) => plainText(s).length > MAX_LENGTH);
  return [...short, ...long].slice(0, COUNT);
}
