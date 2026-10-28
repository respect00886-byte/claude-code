import type { PhotoInput } from "../db";

const FULL_SIZE = 1000;
const THUMB_SIZE = 320;
const QUALITY = 0.8;

/**
 * 写真を読み込む。iPhone の写真（HEIC）や、縦横の向きの情報も
 * ブラウザに解釈させるため createImageBitmap を使う
 */
async function loadImage(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    // 古いブラウザは createImageBitmap の指定に対応していないので img 要素で読む
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function toJpeg(src: ImageBitmap | HTMLImageElement, maxSide: number): Promise<Blob> {
  const w = src.width;
  const h = src.height;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("写真を処理できませんでした"));
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("写真を処理できませんでした"))),
      "image/jpeg",
      QUALITY,
    ),
  );
}

/** 撮った写真を、保存用（長辺1000px）と一覧用（長辺320px）の2つに縮める */
export async function makePhoto(file: Blob): Promise<PhotoInput> {
  const img = await loadImage(file);
  try {
    return { full: await toJpeg(img, FULL_SIZE), thumb: await toJpeg(img, THUMB_SIZE) };
  } finally {
    if ("close" in img) img.close();
  }
}

/** バックアップから戻すとき、一覧用の小さい写真を作り直す */
export async function makeThumb(full: Blob): Promise<Blob> {
  const img = await loadImage(full);
  try {
    return await toJpeg(img, THUMB_SIZE);
  } finally {
    if ("close" in img) img.close();
  }
}
