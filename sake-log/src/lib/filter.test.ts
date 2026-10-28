import { describe, expect, it } from "vitest";
import type { Sake } from "../db";
import { filterSakes, isIncomplete, latestSake, normalize, recentShopNames } from "./filter";

let nextId = 1;
function sake(p: Partial<Sake>): Sake {
  const id = nextId++;
  return {
    id,
    name: "酒",
    rating: 3,
    tags: [],
    type: "",
    brewery: "",
    prefecture: "",
    shopKind: "drank",
    shopName: "",
    drankOn: "2026-10-01",
    hasPhoto: false,
    createdAt: id,
    updatedAt: id,
    ...p,
  };
}

describe("normalize", () => {
  it("ひらがな・カタカナ、全角・半角、大文字・小文字の違いをそろえる", () => {
    expect(normalize("ふるーてぃ")).toBe(normalize("フルーティ"));
    expect(normalize("ＡＢＣ")).toBe("abc");
    expect(normalize("十四 代")).toBe("十四代");
  });
});

describe("filterSakes", () => {
  const a = sake({
    name: "獺祭",
    brewery: "旭酒造",
    prefecture: "山口",
    rating: 4,
    tags: ["フルーティ", "華やか"],
    drankOn: "2026-10-02",
  });
  const b = sake({
    name: "黒龍",
    prefecture: "福井",
    rating: 5,
    tags: ["すっきり"],
    drankOn: "2026-09-01",
    shopName: "酒の店まつもと",
  });
  const c = sake({
    name: "新政",
    prefecture: "秋田",
    rating: 4,
    tags: ["フルーティ", "酸味"],
    drankOn: "2026-10-05",
  });
  const list = [a, b, c];

  it("新しい順（飲んだ日）に並ぶ", () => {
    expect(filterSakes(list, { query: "", tags: [], sort: "new" }).map((s) => s.id)).toEqual([
      c.id,
      a.id,
      b.id,
    ]);
  });

  it("星の多い順。同じ星なら新しい順", () => {
    expect(filterSakes(list, { query: "", tags: [], sort: "rating" }).map((s) => s.id)).toEqual([
      b.id,
      c.id,
      a.id,
    ]);
  });

  it("名前・蔵元・産地・店名で探せる", () => {
    expect(filterSakes(list, { query: "旭", tags: [], sort: "new" })).toEqual([a]);
    expect(filterSakes(list, { query: "秋田", tags: [], sort: "new" })).toEqual([c]);
    expect(filterSakes(list, { query: "まつもと", tags: [], sort: "new" })).toEqual([b]);
  });

  it("空白で区切ると、すべての言葉を含むものだけ", () => {
    expect(filterSakes(list, { query: "獺祭　山口", tags: [], sort: "new" })).toEqual([a]);
    expect(filterSakes(list, { query: "獺祭 秋田", tags: [], sort: "new" })).toEqual([]);
  });

  it("コメントで絞り込むと、選んだコメントをすべて持つものだけ", () => {
    expect(filterSakes(list, { query: "", tags: ["フルーティ"], sort: "new" })).toEqual([c, a]);
    expect(filterSakes(list, { query: "", tags: ["フルーティ", "酸味"], sort: "new" })).toEqual([
      c,
    ]);
  });

  it("元の配列を並べ替えない", () => {
    const copy = [...list];
    filterSakes(list, { query: "", tags: [], sort: "rating" });
    expect(list).toEqual(copy);
  });
});

describe("店名の候補・前回の記録", () => {
  it("最近使った順・重複なし・空欄は除く", () => {
    const list = [
      sake({ shopName: "A店", createdAt: 1 }),
      sake({ shopName: "B店", createdAt: 2 }),
      sake({ shopName: "", createdAt: 3 }),
      sake({ shopName: "A店", createdAt: 4 }),
    ];
    expect(recentShopNames(list)).toEqual(["A店", "B店"]);
    expect(latestSake(list)?.createdAt).toBe(4);
    expect(latestSake([])).toBeUndefined();
  });
});

describe("isIncomplete", () => {
  it("種類・蔵元・産地・店のどれかが空なら追記が必要", () => {
    expect(isIncomplete(sake({}))).toBe(true);
    expect(
      isIncomplete(sake({ type: "純米", brewery: "旭酒造", prefecture: "山口", shopName: "A店" })),
    ).toBe(false);
  });
});
