import { strToU8, zipSync } from "fflate";
import { beforeEach, describe, expect, it } from "vitest";
import { SakeDB, addCustomTag, deleteSake, restoreSake, saveSake, type SakeInput } from "../db";
import { exportZip, importBackup, parseZip } from "./backup";

let n = 0;
const newDb = () => new SakeDB(`test-${n++}`);

const input: SakeInput = {
  name: "獺祭",
  rating: 4,
  tags: ["フルーティ"],
  type: "純米大吟醸",
  brewery: "旭酒造",
  prefecture: "山口",
  shopKind: "bought",
  shopName: "A店",
  price: 1650,
  drankOn: "2026-10-28",
};

const blob = (text: string) => new Blob([text], { type: "image/jpeg" });
const thumbOf = async (full: Blob) => new Blob([`thumb:${await full.text()}`]);

describe("記録の保存", () => {
  let db: SakeDB;
  beforeEach(() => {
    db = newDb();
  });

  it("写真ありで保存し、編集で写真を残す・消す", async () => {
    const id = await saveSake(input, { photo: { full: blob("F"), thumb: blob("T") } }, db);
    expect((await db.sakes.get(id))?.hasPhoto).toBe(true);

    await saveSake({ ...input, rating: 5 }, { id }, db);
    const edited = await db.sakes.get(id);
    expect(edited?.rating).toBe(5);
    expect(edited?.hasPhoto).toBe(true);
    expect(await (await db.photos.get(id))?.full.text()).toBe("F");

    await saveSake(input, { id, photo: null }, db);
    expect((await db.sakes.get(id))?.hasPhoto).toBe(false);
    expect(await db.photos.get(id)).toBeUndefined();
  });

  it("削除して元に戻すと同じ id で戻る", async () => {
    const id = await saveSake(input, { photo: { full: blob("F"), thumb: blob("T") } }, db);
    const { sake, photo } = await deleteSake(id, db);
    expect(await db.sakes.count()).toBe(0);
    await restoreSake(sake!, photo, db);
    expect((await db.sakes.get(id))?.name).toBe("獺祭");
    expect(await db.photos.get(id)).toBeDefined();
  });

  it("マイコメントは定番や登録済みと同じ言葉なら追加しない", async () => {
    await addCustomTag(" 桃っぽい ", ["フルーティ"], db);
    await addCustomTag("桃っぽい", ["フルーティ"], db);
    await addCustomTag("フルーティ", ["フルーティ"], db);
    await addCustomTag("  ", ["フルーティ"], db);
    expect((await db.customTags.toArray()).map((t) => t.label)).toEqual(["桃っぽい"]);
  });
});

describe("バックアップ", () => {
  it("書き出して別の端末に読み込むと、写真も含めて同じに戻る", async () => {
    const src = newDb();
    const id1 = await saveSake(input, { photo: { full: blob("PHOTO1"), thumb: blob("T") } }, src);
    const id2 = await saveSake({ ...input, name: "黒龍", price: undefined }, {}, src);
    await addCustomTag("桃っぽい", [], src);

    const parsed = parseZip(await exportZip(src));
    const dst = newDb();
    await saveSake({ ...input, name: "消える記録" }, {}, dst);
    await importBackup(parsed, thumbOf, dst);

    const sakes = await dst.sakes.toArray();
    expect(sakes.map((s) => s.name).sort()).toEqual(["獺祭", "黒龍"].sort());
    expect((await dst.sakes.get(id2))?.price).toBeUndefined();
    const photo = await dst.photos.get(id1);
    expect(await photo?.full.text()).toBe("PHOTO1");
    expect(await photo?.thumb.text()).toBe("thumb:PHOTO1");
    expect((await dst.customTags.toArray()).map((t) => t.label)).toEqual(["桃っぽい"]);
  });

  it("一覧用写真が作れなくても、大きい写真で代わりにする", async () => {
    const src = newDb();
    const id = await saveSake(input, { photo: { full: blob("P"), thumb: blob("T") } }, src);
    const dst = newDb();
    await importBackup(parseZip(await exportZip(src)), () => Promise.reject(new Error()), dst);
    expect(await (await dst.photos.get(id))?.thumb.text()).toBe("P");
  });

  it("写真ファイルが欠けている記録は写真なしにする", async () => {
    const src = newDb();
    await saveSake(input, { photo: { full: blob("P"), thumb: blob("T") } }, src);
    const files = await exportZip(src);
    const { unzipSync } = await import("fflate");
    const unzipped = unzipSync(files);
    const parsed = parseZip(zipSync({ "data.json": unzipped["data.json"] }));
    expect(parsed.sakes[0].hasPhoto).toBe(false);
  });

  it("壊れたファイル・別アプリのファイルを弾く", () => {
    expect(() => parseZip(strToU8("not zip"))).toThrow("読み込めませんでした");
    expect(() => parseZip(zipSync({ "a.txt": strToU8("x") }))).toThrow("ではありません");
    expect(() =>
      parseZip(zipSync({ "data.json": strToU8(JSON.stringify({ app: "gymlog", version: 3 })) })),
    ).toThrow("ではありません");
    const bad = {
      app: "sake-log",
      version: 1,
      sakes: [{ id: 1, name: "x", rating: 9 }],
      customTags: [],
    };
    expect(() => parseZip(zipSync({ "data.json": strToU8(JSON.stringify(bad)) }))).toThrow("1件目");
  });
});
