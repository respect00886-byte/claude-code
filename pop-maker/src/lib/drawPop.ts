import type { Background } from "../data/backgrounds";

// A4横の比率。A4にきれいに印刷できる細かさ（約150dpi）にしている
export const POP_WIDTH = 1754;
export const POP_HEIGHT = 1240;

const FONT = '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif';
const NOTICE_COLOR = "#e5484d";

export interface PopDrawing {
  text: string;
  name: string; // 文に商品名が入っていないときだけ下に添える
  notices: string[];
  background: Background;
}

// 「！」「、」「。」の後ろで区切り、POPで単語の途中から改行されにくくする
export function splitLines(text: string): string[] {
  return text.split(/(?<=[！、。])/).filter((s) => s !== "");
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
function panel(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  roundRect(ctx, 110, 110, POP_WIDTH - 220, POP_HEIGHT - 220, 50);
  ctx.fill();
}

function drawBackground(ctx: CanvasRenderingContext2D, bg: Background) {
  ctx.fillStyle = bg.base;
  ctx.fillRect(0, 0, POP_WIDTH, POP_HEIGHT);

  switch (bg.id) {
    case "simple":
      ctx.strokeStyle = bg.pattern;
      ctx.lineWidth = 36;
      roundRect(ctx, 40, 40, POP_WIDTH - 80, POP_HEIGHT - 80, 50);
      ctx.stroke();
      break;

    case "dots":
      for (let row = 0, y = 40; y < POP_HEIGHT + 60; row++, y += 120) {
        for (let x = row % 2 === 0 ? 40 : 100; x < POP_WIDTH + 60; x += 120) {
          ctx.fillStyle = (x + row) % 3 === 0 ? bg.accent : bg.pattern;
          ctx.beginPath();
          ctx.arc(x, y, 26, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      panel(ctx);
      break;

    case "stars":
      // 毎回同じ並びになるよう、乱数ではなく番号から位置と大きさを決める
      for (let row = 0, y = 50; y < POP_HEIGHT + 60; row++, y += 140) {
        for (let col = 0, x = row % 2 === 0 ? 50 : 120; x < POP_WIDTH + 60; col++, x += 140) {
          ctx.fillStyle = (row + col) % 2 === 0 ? bg.pattern : bg.accent;
          star(ctx, x, y, 30 + ((row * 7 + col * 3) % 4) * 8);
        }
      }
      panel(ctx);
      break;

    case "lines":
      ctx.strokeStyle = bg.pattern;
      ctx.lineWidth = 4;
      for (let y = 140; y < POP_HEIGHT; y += 72) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(POP_WIDTH, y);
        ctx.stroke();
      }
      // ノートの左側の赤い縦線
      ctx.strokeStyle = bg.accent;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(150, 0);
      ctx.lineTo(150, POP_HEIGHT);
      ctx.stroke();
      break;

    case "stripe":
      ctx.fillStyle = bg.pattern;
      for (let x = -POP_HEIGHT; x < POP_WIDTH; x += 140) {
        ctx.beginPath();
        ctx.moveTo(x, POP_HEIGHT);
        ctx.lineTo(x + 70, POP_HEIGHT);
        ctx.lineTo(x + 70 + POP_HEIGHT, 0);
        ctx.lineTo(x + POP_HEIGHT, 0);
        ctx.closePath();
        ctx.fill();
      }
      panel(ctx);
      break;

    case "frame": {
      ctx.strokeStyle = bg.pattern;
      ctx.lineWidth = 28;
      ctx.strokeRect(40, 40, POP_WIDTH - 80, POP_HEIGHT - 80);
      ctx.strokeStyle = bg.accent;
      ctx.lineWidth = 8;
      ctx.strokeRect(90, 90, POP_WIDTH - 180, POP_HEIGHT - 180);
      // 内側の枠の四隅にひし形の飾り
      ctx.fillStyle = bg.pattern;
      for (const [x, y] of [
        [90, 90],
        [POP_WIDTH - 90, 90],
        [90, POP_HEIGHT - 90],
        [POP_WIDTH - 90, POP_HEIGHT - 90],
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

// 区切りごとのまとまりをなるべく1行に収め、それでも入らないときだけ1文字ずつ折り返す
function wrap(ctx: CanvasRenderingContext2D, segments: string[], maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  const fits = (s: string) => ctx.measureText(s).width <= maxWidth;

  for (const seg of segments) {
    if (fits(current + seg)) {
      current += seg;
      continue;
    }
    if (current !== "") lines.push(current);
    if (fits(seg)) {
      current = seg;
      continue;
    }
    // 1行に入らないまとまりは、最後の行に1〜2文字だけ残らないよう同じくらいの長さに分ける
    const chars = [...seg];
    for (let n = 2; n <= chars.length; n++) {
      const size = Math.ceil(chars.length / n);
      const chunks: string[] = [];
      for (let i = 0; i < chars.length; i += size) chunks.push(chars.slice(i, i + size).join(""));
      if (chunks.every(fits)) {
        lines.push(...chunks.slice(0, -1));
        current = chunks[chunks.length - 1];
        break;
      }
    }
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

  let x = (POP_WIDTH - totalWidth()) / 2;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (const n of notices) {
    const w = ctx.measureText(n).width + padX * 2;
    ctx.fillStyle = NOTICE_COLOR;
    roundRect(ctx, x, top, w, height, height / 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(n, x + w / 2, top + height / 2);
    x += w + gap;
  }
  return height;
}

export function drawPop(canvas: HTMLCanvasElement, pop: PopDrawing) {
  canvas.width = POP_WIDTH;
  canvas.height = POP_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  drawBackground(ctx, pop.background);

  const left = 190;
  const maxWidth = POP_WIDTH - left * 2;
  let top = 170;
  let bottom = POP_HEIGHT - 170;

  if (pop.notices.length > 0) {
    top += drawNotices(ctx, pop.notices, top, maxWidth) + 40;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const name = pop.name.trim();
  if (name !== "" && !pop.text.includes(name)) {
    const size = fitFont(ctx, name, 72, 700, maxWidth);
    ctx.fillStyle = "#333333";
    ctx.fillText(name, POP_WIDTH / 2, bottom - size / 2);
    bottom -= size + 40;
  }

  // 使える高さに収まる一番大きな文字サイズを探す
  const segments = splitLines(pop.text);
  let size = 230;
  let lines: string[] = [];
  for (; size >= 48; size -= 6) {
    ctx.font = `900 ${size}px ${FONT}`;
    lines = wrap(ctx, segments, maxWidth);
    if (lines.length * size * 1.3 <= bottom - top) break;
  }

  const lineHeight = size * 1.3;
  let y = (top + bottom) / 2 - (lineHeight * (lines.length - 1)) / 2;
  ctx.fillStyle = pop.background.text;
  for (const line of lines) {
    ctx.fillText(line, POP_WIDTH / 2, y);
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
