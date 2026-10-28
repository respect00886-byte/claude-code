import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from "fflate";
import { db as defaultDb, type CustomTag, type Photo, type Sake, type SakeDB } from "../db";
import { isDateKey } from "./date";

/**
 * バックアップは zip ファイル1つ。
 *   data.json        … 記録とマイコメント
 *   photos/{id}.jpg  … 写真（保存用の大きいほうだけ。一覧用は読み込み時に作り直す）
 * 写真を文字（base64）にして JSON に入れると、枚数が多いときに iPhone で落ちるため zip にしている
 */
export const BACKUP_VERSION = 1;

interface BackupJson {
  app: "sake-log";
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  sakes: Sake[];
  customTags: CustomTag[];
}

export async function exportZip(database: SakeDB = defaultDb): Promise<Uint8Array> {
  const sakes = await database.sakes.toArray();
  const customTags = await database.customTags.toArray();
  const photos = await database.photos.toArray();
  const data: BackupJson = {
    app: "sake-log",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    sakes,
    customTags,
  };
  const files: Zippable = { "data.json": strToU8(JSON.stringify(data)) };
  for (const p of photos) {
    // JPEG はもう圧縮済みなので、zip では圧縮しない（時間の無駄になるため）
    files[`photos/${p.sakeId}.jpg`] = [new Uint8Array(await p.full.arrayBuffer()), { level: 0 }];
  }
  return zipSync(files);
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isId = (v: unknown): v is number => Number.isInteger(v) && (v as number) > 0;
const isStr = (v: unknown): v is string => typeof v === "string";

function isSake(v: unknown): v is Sake {
  return (
    isObj(v) &&
    isId(v.id) &&
    isStr(v.name) &&
    v.name.length > 0 &&
    Number.isInteger(v.rating) &&
    (v.rating as number) >= 1 &&
    (v.rating as number) <= 5 &&
    Array.isArray(v.tags) &&
    v.tags.every(isStr) &&
    isStr(v.type) &&
    isStr(v.brewery) &&
    isStr(v.prefecture) &&
    (v.shopKind === "drank" || v.shopKind === "bought") &&
    isStr(v.shopName) &&
    (v.price === undefined || (typeof v.price === "number" && v.price >= 0)) &&
    isDateKey(v.drankOn) &&
    typeof v.hasPhoto === "boolean" &&
    typeof v.createdAt === "number" &&
    typeof v.updatedAt === "number"
  );
}

function isCustomTag(v: unknown): v is CustomTag {
  return isObj(v) && isId(v.id) && isStr(v.label) && v.label.length > 0;
}

export interface ParsedBackup {
  sakes: Sake[];
  customTags: CustomTag[];
  /** sakeId → 写真（保存用） */
  photos: Map<number, Blob>;
}

/** バックアップファイルの中身を確かめて返す。問題があれば日本語のエラーを投げる */
export function parseZip(bytes: Uint8Array): ParsedBackup {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(bytes);
  } catch {
    throw new Error("バックアップファイルとして読み込めませんでした");
  }
  const json = files["data.json"];
  if (!json) throw new Error("日本酒ログのバックアップファイルではありません");
  let data: unknown;
  try {
    data = JSON.parse(strFromU8(json));
  } catch {
    throw new Error("バックアップファイルが壊れています");
  }
  if (!isObj(data) || data.app !== "sake-log") {
    throw new Error("日本酒ログのバックアップファイルではありません");
  }
  if (data.version !== BACKUP_VERSION) {
    throw new Error("このバージョンのバックアップファイルには対応していません");
  }
  if (!Array.isArray(data.sakes) || !Array.isArray(data.customTags)) {
    throw new Error("バックアップファイルの形式が正しくありません");
  }
  const bad = data.sakes.findIndex((s) => !isSake(s));
  if (bad !== -1) throw new Error(`記録の${bad + 1}件目のデータが壊れています`);
  if (!data.customTags.every(isCustomTag)) throw new Error("マイコメントのデータが壊れています");
  const sakes = data.sakes as Sake[];
  if (new Set(sakes.map((s) => s.id)).size !== sakes.length) {
    throw new Error("記録に重複したデータがあります");
  }

  const photos = new Map<number, Blob>();
  for (const s of sakes) {
    const f = files[`photos/${s.id}.jpg`];
    // 写真が見つからない記録は「写真なし」として扱う
    if (f) photos.set(s.id, new Blob([f as BlobPart], { type: "image/jpeg" }));
  }
  const fixed = sakes.map((s) => ({ ...s, hasPhoto: photos.has(s.id) }));
  // ラベルが重複していたら1つにまとめる（同じ言葉は1つしか登録できないため）
  const seen = new Set<string>();
  const customTags = (data.customTags as CustomTag[]).filter(
    (t) => !seen.has(t.label) && seen.add(t.label),
  );
  return { sakes: fixed, customTags, photos };
}

/** 今の記録をすべて消して、バックアップの中身に置き換える */
export async function importBackup(
  parsed: ParsedBackup,
  makeThumb: (full: Blob) => Promise<Blob>,
  database: SakeDB = defaultDb,
) {
  // 一覧用の写真作りは時間がかかるので、保存処理（トランザクション）の前に済ませておく
  const photos: Photo[] = [];
  for (const [sakeId, full] of parsed.photos) {
    let thumb: Blob;
    try {
      thumb = await makeThumb(full);
    } catch {
      thumb = full;
    }
    photos.push({ sakeId, full, thumb });
  }
  await database.transaction(
    "rw",
    database.sakes,
    database.photos,
    database.customTags,
    async () => {
      await database.sakes.clear();
      await database.photos.clear();
      await database.customTags.clear();
      await database.sakes.bulkAdd(parsed.sakes);
      await database.photos.bulkAdd(photos);
      await database.customTags.bulkAdd(parsed.customTags);
    },
  );
}

/**
 * ファイルを保存する。
 * スマホでは共有シート（「ファイルに保存」など）が使える場合はそちらを優先する。
 * @returns 保存できたら true、キャンセルしたら false
 */
export async function saveFile(bytes: Uint8Array, filename: string): Promise<boolean> {
  const file = new File([bytes as BlobPart], filename, { type: "application/zip" });
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (isTouch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return false;
      // 共有に失敗した場合は通常のダウンロードにする
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // すぐに解放すると Safari でダウンロードが始まらないことがあるため少し待つ
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}
