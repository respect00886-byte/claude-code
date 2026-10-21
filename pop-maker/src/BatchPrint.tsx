import { useState } from "react";
import type { CSSProperties } from "react";
import { findBackground } from "./data/backgrounds";
import { findSize } from "./data/sizes";
import { resolveTextColor, SUB_DEFAULT_COLOR } from "./data/textColors";
import { paginate, SHEET_LAYOUTS } from "./lib/batch";
import type { BatchItem, SheetLayout } from "./lib/batch";
import { drawPop } from "./lib/drawPop";
import { plainText } from "./lib/generate";

// まとめて印刷用の画像の細かさ（長い辺の画素数）。
// 1枚ずつの保存（3508px）ほどは要らず、10枚分でも重くならない大きさにする（どちらも約300dpi以上）
const BATCH_PX: Record<string, number> = { card: 1400, "a5-landscape": 2400, "a5-portrait": 2400 };

// 原稿の中身は追加後に変わらないので、一度描いた画像を使い回す（枚数を変えるたびに描き直さない）
const imageCache = new Map<string, string>();

function imageOf(item: BatchItem): string {
  let url = imageCache.get(item.id);
  if (url == null) {
    url = renderItem(item);
    imageCache.set(item.id, url);
  }
  return url;
}

function renderItem(item: BatchItem): string {
  const background = findBackground(item.background);
  const size = { ...findSize(item.size), longPx: BATCH_PX[item.size] };
  const canvas = document.createElement("canvas");
  drawPop(canvas, {
    heading: item.heading,
    sub: item.sub,
    headingColor: resolveTextColor(item.headingColor, background.text),
    subColor: resolveTextColor(item.subColor, SUB_DEFAULT_COLOR),
    notices: item.notices,
    features: [],
    background,
    size,
  });
  return canvas.toDataURL("image/png");
}

interface Props {
  items: BatchItem[];
  onChange: (items: BatchItem[]) => void;
  onClose: () => void;
}

export default function BatchPrint({ items, onChange, onClose }: Props) {
  // 一覧に入っているサイズだけ選べるようにする
  const layouts = SHEET_LAYOUTS.filter((l) => items.some((i) => i.size === l.size));
  const [selected, setSelected] = useState(layouts[0]?.size);
  const layout = layouts.find((l) => l.size === selected) ?? layouts[0];

  const pages = layout ? paginate(items, layout) : [];
  const shown = layout ? items.filter((i) => i.size === layout.size) : [];

  function setCopies(id: string, copies: number) {
    onChange(items.map((i) => (i.id === id ? { ...i, copies: Math.max(1, copies) } : i)));
  }

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  function clearAll() {
    if (!layout) return;
    if (!confirm(`${layout.label}の原稿をすべて一覧から消しますか？`)) return;
    onChange(items.filter((i) => i.size !== layout.size));
  }

  return (
    <div className="pop-overlay batch">
      <div className="pop-actions no-print">
        <button type="button" onClick={onClose}>
          戻る
        </button>
        <button
          type="button"
          className="primary"
          disabled={pages.length === 0}
          onClick={() => window.print()}
        >
          印刷（A4 {pages.length}枚）
        </button>
      </div>

      {!layout ? (
        <div className="pop-backgrounds no-print">
          <p className="hint">
            まだ原稿がありません。「仕上げ・印刷・保存へ」でサイズを名刺かA5にして、「まとめて印刷に追加」を押してください。
          </p>
        </div>
      ) : (
        <>
          <div className="pop-backgrounds no-print">
            <span className="label">サイズ</span>
            <div className="chips">
              {layouts.map((l) => (
                <button
                  key={l.size}
                  type="button"
                  className={layout.size === l.size ? "chip active" : "chip"}
                  onClick={() => setSelected(l.size)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <p className="hint">
              {layout.note}
              。印刷するときは、プリンターの設定を「倍率100%（実際のサイズ）」にしてください。
              「用紙に合わせる」だと小さく印刷されます。
            </p>
          </div>

          <ul className="batch-list no-print">
            {shown.map((item) => (
              <li key={item.id}>
                <img src={imageOf(item)} alt={plainText(`${item.heading} ${item.sub}`)} />
                <div className="batch-controls">
                  <span className="batch-copies">
                    <button
                      type="button"
                      aria-label="1枚減らす"
                      disabled={item.copies <= 1}
                      onClick={() => setCopies(item.id, item.copies - 1)}
                    >
                      −
                    </button>
                    <span>{item.copies}枚</span>
                    <button
                      type="button"
                      aria-label="1枚増やす"
                      onClick={() => setCopies(item.id, item.copies + 1)}
                    >
                      ＋
                    </button>
                  </span>
                  <button type="button" className="batch-remove" onClick={() => remove(item.id)}>
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="pop-backgrounds no-print">
            <button type="button" className="batch-clear" onClick={clearAll}>
              {layout.label}の原稿をすべて消す
            </button>
            <span className="label">印刷の見本</span>
          </div>

          {/* 用紙の向きと余白はサイズごとに変わるので、ここで指定する */}
          <style>{`
            @page { size: A4 ${layout.landscape ? "landscape" : "portrait"}; margin: ${layout.marginMm}mm; }
          `}</style>
          <div className="sheets">
            {pages.map((page, n) => (
              <Sheet key={n} layout={layout} page={page} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// A4用紙1枚分。位置は用紙に対する割合で決めるので、画面の見本と印刷で同じ並びになる
function Sheet({ layout, page }: { layout: SheetLayout; page: BatchItem[] }) {
  const pageW = (layout.landscape ? 297 : 210) - layout.marginMm * 2;
  // 高さぴったりだとプリンターによっては次の用紙にはみ出すので、少しだけ短くする
  const pageH = (layout.landscape ? 210 : 297) - layout.marginMm * 2 - 1;
  const offsetX = (pageW - layout.cellWidthMm * layout.cols) / 2;
  const offsetY = (pageH - layout.cellHeightMm * layout.rows) / 2;
  const pct = (v: number, total: number) => `${(v / total) * 100}%`;

  return (
    <div
      className="sheet"
      style={
        {
          aspectRatio: `${pageW} / ${pageH}`,
          "--sheet-w": `${pageW}mm`,
          "--sheet-h": `${pageH}mm`,
        } as CSSProperties
      }
    >
      {page.map((item, i) => {
        const col = i % layout.cols;
        const row = Math.floor(i / layout.cols);
        return (
          <img
            key={i}
            className="sheet-cell"
            src={imageOf(item)}
            alt=""
            style={{
              left: pct(offsetX + col * layout.cellWidthMm, pageW),
              top: pct(offsetY + row * layout.cellHeightMm, pageH),
              width: pct(layout.cellWidthMm, pageW),
              height: pct(layout.cellHeightMm, pageH),
            }}
          />
        );
      })}
    </div>
  );
}
