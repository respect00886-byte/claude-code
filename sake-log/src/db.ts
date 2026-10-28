import Dexie, { type EntityTable } from "dexie";

export type ShopKind = "drank" | "bought";

export interface Sake {
  id: number;
  name: string;
  /** 1〜5 */
  rating: number;
  tags: string[];
  type: string;
  brewery: string;
  prefecture: string;
  shopKind: ShopKind;
  shopName: string;
  /** 円。未入力は undefined */
  price?: number;
  /** YYYY-MM-DD */
  drankOn: string;
  hasPhoto: boolean;
  createdAt: number;
  updatedAt: number;
}

export type SakeInput = Omit<Sake, "id" | "createdAt" | "updatedAt" | "hasPhoto">;

/** 写真は一覧を軽くするため本体とは別テーブルに、Blob のまま保存する */
export interface Photo {
  sakeId: number;
  /** 詳細画面用（長辺1000px） */
  full: Blob;
  /** 一覧用（長辺320px） */
  thumb: Blob;
}

export interface CustomTag {
  id: number;
  label: string;
}

export class SakeDB extends Dexie {
  sakes!: EntityTable<Sake, "id">;
  photos!: EntityTable<Photo, "sakeId">;
  customTags!: EntityTable<CustomTag, "id">;

  constructor(name = "sake-log") {
    // 同じサイトの GymLog（"gymlog"）などと名前がぶつからないようにする
    super(name);
    // 形を変えるときは version を1つ増やし、既存データの移行処理を書く
    this.version(1).stores({
      sakes: "++id, name, rating, drankOn, *tags, shopName",
      photos: "sakeId",
      customTags: "++id, &label",
    });
  }
}

export const db = new SakeDB();

export interface PhotoInput {
  full: Blob;
  thumb: Blob;
}

/**
 * 記録を保存する。id があれば上書き。
 * photo: 新しい写真 / null: 写真を消す / undefined: 写真はそのまま
 */
export async function saveSake(
  input: SakeInput,
  options: { id?: number; photo?: PhotoInput | null } = {},
  database: SakeDB = db,
): Promise<number> {
  const { id, photo } = options;
  return database.transaction("rw", database.sakes, database.photos, async () => {
    const now = Date.now();
    const prev = id ? await database.sakes.get(id) : undefined;
    const hasPhoto = photo === undefined ? (prev?.hasPhoto ?? false) : photo !== null;
    const row = {
      ...input,
      hasPhoto,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    };
    let savedId: number;
    if (prev) {
      await database.sakes.put({ ...row, id: prev.id });
      savedId = prev.id;
    } else {
      savedId = await database.sakes.add(row as Sake);
    }
    if (photo) await database.photos.put({ sakeId: savedId, ...photo });
    else if (photo === null) await database.photos.delete(savedId);
    return savedId;
  });
}

/** 削除する。「元に戻す」用に消した中身を返す */
export async function deleteSake(id: number, database: SakeDB = db) {
  return database.transaction("rw", database.sakes, database.photos, async () => {
    const sake = await database.sakes.get(id);
    const photo = await database.photos.get(id);
    await database.sakes.delete(id);
    await database.photos.delete(id);
    return { sake, photo };
  });
}

/** 削除したものを同じ id で戻す */
export async function restoreSake(sake: Sake, photo: Photo | undefined, database: SakeDB = db) {
  await database.transaction("rw", database.sakes, database.photos, async () => {
    await database.sakes.put(sake);
    if (photo) await database.photos.put(photo);
  });
}

/** マイコメントを追加。同じ言葉が定番・登録済みにあれば何もしない */
export async function addCustomTag(label: string, presets: string[], database: SakeDB = db) {
  const v = label.trim();
  if (!v || presets.includes(v)) return;
  if (await database.customTags.where("label").equals(v).count()) return;
  await database.customTags.add({ label: v } as CustomTag);
}
