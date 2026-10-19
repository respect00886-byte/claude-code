import type { Background } from "../data/backgrounds";
import type { PopSize } from "../data/sizes";
import { BREAK, plainText } from "./generate";

// 描くときは「短い辺＝1240」の目盛りで位置や大きさを決め、最後に実際の画素数へ拡大する。
// こうするとどのサイズでも余白・模様・文字のつり合いが同じになる
const BASE = 1240;

const FONT = '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif';
const NOTICE_COLOR = "#e5484d";
// 行の頭に来ると読みにくい文字
const NO_LINE_START = "！？、。ー〜ッャュョァィゥェォっゃゅょぁぃぅぇぉ";

export interface PopDrawing {
  text: string;
  name: string; // 文に商品名が入っていないときだけ下に添える
  notices: string[];
  features: string[]; // 「速乾インク」などの特徴は、入るかぎり途中で改行しない
  background: Background;
  size: PopSize;
}

// 「！」「、」「。」の後ろと、ひな形で決めた区切り（BREAK）で分ける。どこで改行しても自然な位置
export function splitLines(text: string): string[] {
  return text
    .split(BREAK)
    .flatMap((s) => s.split(/(?<=[！、。])/))
    .filter((s) => s !== "");
}

type CharKind = "kanji" | "kana" | "katakana" | "other";

function charKind(c: string): CharKind {
  if (/\p{Script=Han}/u.test(c)) return "kanji";
  if (/[\p{Script=Katakana}ー]/u.test(c)) return "katakana";
  if (/\p{Script=Hiragana}/u.test(c)) return "kana";
  return "other";
}

// 区切りの間の文が長すぎるときだけ使う、もう一段細かい区切り。
// 商品名などは「キラキラ｜消せる｜ボールペン」のように文字の種類が変わる所で分ける。
// ひらがな→漢字（「ひと｜息」「お｜子さま」）は言葉の途中のことが多いので分けない。
// カタカナの後の漢字1文字（「ラメ｜入り」「ゴムバンド｜付き」）も分けない。
// keep に入っている言葉（特徴）の中も分けない
function splitWords(seg: string, keep: string[]): string[] {
  const chars = [...seg];
  const kept = new Set<number>();
  for (const word of keep) {
    const len = [...word].length;
    for (let i = 0; i + len <= chars.length; i++) {
      if (chars.slice(i, i + len).join("") === word) {
        for (let j = i + 1; j < i + len; j++) kept.add(j);
      }
    }
  }
  const words: string[] = [];
  let start = 0;
  for (let i = 1; i < chars.length; i++) {
    if (NO_LINE_START.includes(chars[i]) || kept.has(i)) continue;
    const prev = charKind(chars[i - 1]);
    const cur = charKind(chars[i]);
    const toKatakana = cur === "katakana" || cur === "other";
    const fromKatakana = prev === "katakana" || prev === "other";
    const kanjiRun = cur === "kanji" && i + 1 < chars.length && charKind(chars[i + 1]) === "kanji";
    if (
      (prev === "kana" && toKatakana) ||
      (prev === "kanji" && toKatakana) ||
      (fromKatakana && kanjiRun)
    ) {
      words.push(chars.slice(start, i).join(""));
      start = i;
    }
  }
  words.push(chars.slice(start).join(""));
  return words;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
}

// 模様の上に白い板を敷き、文字が模様に埋もれないようにする
function panel(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  roundRect(ctx, 110, 110, w - 220, h - 220, 50);
  ctx.fill();
}

function drawBackground(ctx: CanvasRenderingContext2D, bg: Background, w: number, h: number) {
  ctx.fillStyle = bg.base;
  ctx.fillRect(0, 0, w, h);

  switch (bg.id) {
    case "simple":
      ctx.strokeStyle = bg.pattern;
      ctx.lineWidth = 36;
      roundRect(ctx, 40, 40, w - 80, h - 80, 50);
      ctx.stroke();
      break;

    case "dots":
      for (let row = 0, y = 40; y < h + 60; row++, y += 120) {
        for (let x = row % 2 === 0 ? 40 : 100; x < w + 60; x += 120) {
          ctx.fillStyle = (x + row) % 3 === 0 ? bg.accent : bg.pattern;
          ctx.beginPath();
          ctx.arc(x, y, 26, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      panel(ctx, w, h);
      break;

    case "stars":
      // 毎回同じ並びになるよう、乱数ではなく番号から位置と大きさを決める
      for (let row = 0, y = 50; y < h + 60; row++, y += 140) {
        for (let col = 0, x = row % 2 === 0 ? 50 : 120; x < w + 60; col++, x += 140) {
          ctx.fillStyle = (row + col) % 2 === 0 ? bg.pattern : bg.accent;
          star(ctx, x, y, 30 + ((row * 7 + col * 3) % 4) * 8);
        }
      }
      panel(ctx, w, h);
      break;

    case "lines":
      ctx.strokeStyle = bg.pattern;
      ctx.lineWidth = 4;
      for (let y = 140; y < h; y += 72) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      // ノートの左側の赤い縦線
      ctx.strokeStyle = bg.accent;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(150, 0);
      ctx.lineTo(150, h);
      ctx.stroke();
      break;

    case "stripe":
      ctx.fillStyle = bg.pattern;
      for (let x = -h; x < w; x += 140) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x + 70, h);
        ctx.lineTo(x + 70 + h, 0);
        ctx.lineTo(x + h, 0);
        ctx.closePath();
        ctx.fill();
      }
      panel(ctx, w, h);
      break;

    case "frame": {
      ctx.strokeStyle = bg.pattern;
      ctx.lineWidth = 28;
      ctx.strokeRect(40, 40, w - 80, h - 80);
      ctx.strokeStyle = bg.accent;
      ctx.lineWidth = 8;
      ctx.strokeRect(90, 90, w - 180, h - 180);
      // 内側の枠の四隅にひし形の飾り
      ctx.fillStyle = bg.pattern;
      for (const [x, y] of [
        [90, 90],
        [w - 90, 90],
        [90, h - 90],
        [w - 90, h - 90],
      ]) {
        ctx.beginPath();
        ctx.moveTo(x, y - 34);
        ctx.lineTo(x + 34, y);
        ctx.lineTo(x, y + 34);
        ctx.lineTo(x - 34, y);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
  }
}

// 言葉を順に詰めて、limit の幅を超えたら次の行にする
function pack(words: string[], width: (s: string) => number, limit: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current !== "" && width(current + word) > limit) {
      lines.push(current);
      current = word;
    } else {
      current += word;
    }
  }
  if (current !== "") lines.push(current);
  return lines;
}

// 同じ行数のまま各行の長さをそろえ、最後の行に短い言葉だけが残らないようにする
function balance(words: string[], width: (s: string) => number, maxWidth: number): string[] {
  const count = pack(words, width, maxWidth).length;
  let lo = Math.max(...words.map(width));
  let hi = maxWidth;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (pack(words, width, mid).length <= count) hi = mid;
    else lo = mid;
  }
  return pack(words, width, hi);
}

// 区切りごとのまとまりをなるべく1行に収め、入らないときだけ言葉の切れ目で折り返す。
// 言葉そのものが入らないときは null を返し、文字を小さくしてもらう。
// 一番小さい文字でも入らないとき（allowCharBreak）だけ、しかたなく1文字ずつ折り返す
function wrap(
  ctx: CanvasRenderingContext2D,
  segments: string[],
  maxWidth: number,
  keep: string[],
  allowCharBreak: boolean,
): string[] | null {
  const width = (s: string) => ctx.measureText(s).width;
  const lines: string[] = [];
  let current = "";

  for (const seg of segments) {
    if (width(current + seg) <= maxWidth) {
      current += seg;
      continue;
    }
    if (current !== "") lines.push(current);
    if (width(seg) <= maxWidth) {
      current = seg;
      continue;
    }
    let words = splitWords(seg, keep);
    if (words.some((word) => width(word) > maxWidth)) {
      if (!allowCharBreak) return null;
      // 一番小さい文字でも入らないときだけ、特徴の中 → 1文字ずつ の順で分ける
      words = words
        .flatMap((word) => (width(word) > maxWidth ? splitWords(word, []) : [word]))
        .flatMap((word) => (width(word) > maxWidth ? [...word] : [word]));
    }
    const chunks = balance(words, width, maxWidth);
    lines.push(...chunks.slice(0, -1));
    current = chunks[chunks.length - 1];
  }
  if (current !== "") lines.push(current);
  return lines;
}

// 横幅に収まるまで文字を小さくする
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  weight: number,
  maxWidth: number,
) {
  let s = size;
  ctx.font = `${weight} ${s}px ${FONT}`;
  while (s > 20 && ctx.measureText(text).width > maxWidth) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${FONT}`;
  }
  return s;
}

function drawNotices(
  ctx: CanvasRenderingContext2D,
  notices: string[],
  centerX: number,
  top: number,
  maxWidth: number,
) {
  const height = 110;
  const padX = 40;
  const gap = 24;
  let size = 64;
  const totalWidth = () =>
    notices.reduce((sum, n) => sum + ctx.measureText(n).width + padX * 2, 0) +
    gap * (notices.length - 1);

  ctx.font = `bold ${size}px ${FONT}`;
  while (size > 24 && totalWidth() > maxWidth) {
    size -= 2;
    ctx.font = `bold ${size}px ${FONT}`;
  }

  let x = centerX - totalWidth() / 2;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (const n of notices) {
    const width = ctx.measureText(n).width + padX * 2;
    ctx.fillStyle = NOTICE_COLOR;
    roundRect(ctx, x, top, width, height, height / 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(n, x + width / 2, top + height / 2);
    x += width + gap;
  }
  return height;
}

export function drawPop(canvas: HTMLCanvasElement, pop: PopDrawing) {
  const { widthMm, heightMm, longPx } = pop.size;
  const shortMm = Math.min(widthMm, heightMm);
  const w = Math.round((BASE * widthMm) / shortMm);
  const h = Math.round((BASE * heightMm) / shortMm);
  const scale = longPx / Math.max(w, h);
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  drawBackground(ctx, pop.background, w, h);

  const left = 190;
  const maxWidth = w - left * 2;
  let top = 170;
  let bottom = h - 170;

  if (pop.notices.length > 0) {
    top += drawNotices(ctx, pop.notices, w / 2, top, maxWidth) + 40;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const name = pop.name.trim();
  if (name !== "" && !plainText(pop.text).includes(name)) {
    const size = fitFont(ctx, name, 72, 700, maxWidth);
    ctx.fillStyle = "#333333";
    ctx.fillText(name, w / 2, bottom - size / 2);
    bottom -= size + 40;
  }

  // 使える高さに収まる一番大きな文字サイズを探す
  const segments = splitLines(pop.text);
  let size = 230;
  let lines: string[] = [];
  for (; ; size -= 6) {
    const smallest = size - 6 < 48;
    ctx.font = `900 ${size}px ${FONT}`;
    const result = wrap(ctx, segments, maxWidth, pop.features, smallest);
    if (result) lines = result;
    if (smallest || (result && result.length * size * 1.3 <= bottom - top)) break;
  }

  const lineHeight = size * 1.3;
  let y = (top + bottom) / 2 - (lineHeight * (lines.length - 1)) / 2;
  ctx.fillStyle = pop.background.text;
  for (const line of lines) {
    ctx.fillText(line, w / 2, y);
    y += lineHeight;
  }
}

// ファイル名に使えない文字を取り除く
export function popFileName(name: string): string {
  const safe = name.replace(/[\\/:*?"<>|\s]/g, "");
  return `pop-${safe || "pop"}.png`;
}

// スマホは共有メニュー（「画像を保存」で写真に入る）、パソコンはダウンロードで保存する
export async function savePng(canvas: HTMLCanvasElement, fileName: string): Promise<void> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("画像を作れませんでした");

  const file = new File([blob], fileName, { type: "image/png" });
  const isPhone = window.matchMedia("(pointer: coarse)").matches;
  if (isPhone && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      // 共有メニューを閉じただけなら何もしない
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
