import { describe, expect, it } from "vitest";
import { buildAll, generate, MAX_LENGTH, plainText } from "./generate";
import { TARGET_LABELS, TONE_LABELS, type PopInput, type Target, type Tone } from "../types";

const TARGETS = Object.keys(TARGET_LABELS) as Target[];
const TONES = Object.keys(TONE_LABELS) as Tone[];

function input(target: Target, tone: Tone, features: string[]): PopInput {
  return { heading: "", sub: "", name: "消せるボールペン", features, target, tone, notices: [] };
}

// トーン×対象のすべての組み合わせを試す（ひな形を足したときの置き換え漏れも見つけられる）
const CASES = TARGETS.flatMap((target) => TONES.map((tone) => ({ target, tone })));

describe("buildAll", () => {
  it.each(CASES)("$target / $tone：{商品} などの置き換え漏れが残らない", ({ target, tone }) => {
    const texts = buildAll(input(target, tone, ["消せる", "ラメ入り", "きれい"]));
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) expect(text).not.toMatch(/[{}]/);
  });

  it("「/」は画面に出ない改行位置に変わり、そのまま残らない", () => {
    for (const text of buildAll(input("kids", "genki", ["消せる"]))) {
      expect(text).not.toContain("/");
    }
  });

  it("特徴が空欄でも候補が出る", () => {
    for (const { target, tone } of CASES) {
      expect(buildAll(input(target, tone, ["", "  "])).length).toBeGreaterThan(0);
    }
  });
});

describe("generate", () => {
  it("候補は最大8件で、短い文が先に並ぶ", () => {
    const texts = generate(input("adult", "jouhin", ["消せる", "ラメ入り", "書きやすい"]));
    expect(texts.length).toBeLessThanOrEqual(7);
    const lengths = texts.map((t) => plainText(t).length);
    const firstLong = lengths.findIndex((n) => n > MAX_LENGTH);
    if (firstLong >= 0) expect(lengths.slice(firstLong).every((n) => n > MAX_LENGTH)).toBe(true);
  });
});
