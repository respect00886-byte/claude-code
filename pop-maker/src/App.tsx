import { useEffect, useMemo, useRef, useState } from "react";
import { BACKGROUNDS, findBackground } from "./data/backgrounds";
import { FEATURE_CATEGORIES } from "./data/featureSuggestions";
import { NOTICES } from "./data/notices";
import { drawPop, popFileName, savePng } from "./lib/drawPop";
import { generate } from "./lib/generate";
import { loadInput, saveInput } from "./lib/storage";
import { TARGET_LABELS, TONE_LABELS } from "./types";
import type { PopInput, Target, Tone } from "./types";

const FEATURE_SLOTS = 3;

const EMPTY_INPUT: PopInput = {
  name: "",
  features: ["", "", ""],
  target: "kids",
  tone: "genki",
  notices: [],
};

function initialInput(): PopInput {
  const saved = loadInput();
  if (!saved) return EMPTY_INPUT;
  // 古い保存データでも特徴欄が3つそろうようにする
  const features = [...(saved.features ?? []), "", "", ""].slice(0, FEATURE_SLOTS);
  return { ...EMPTY_INPUT, ...saved, features, notices: saved.notices ?? [] };
}

// クリップボードが使えない古いブラウザ向けに、選択→コピーの方法も用意する
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  }
}

export default function App() {
  const [input, setInput] = useState<PopInput>(initialInput);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [popText, setPopText] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canGenerate = input.name.trim() !== "";
  const category = FEATURE_CATEGORIES.find((c) => c.id === input.category);
  const featuresFull = input.features.every((f) => f.trim() !== "");
  const background = findBackground(input.background);
  // お知らせは選んだ順ではなく、いつも同じ並び順で出す
  const notices = useMemo(() => NOTICES.filter((n) => input.notices.includes(n)), [input.notices]);

  // プレビューと保存画像を同じキャンバスで描くので、画面で見たものがそのまま画像になる
  useEffect(() => {
    if (popText && canvasRef.current) {
      drawPop(canvasRef.current, { text: popText, name: input.name, notices, background });
    }
  }, [popText, input.name, notices, background]);

  function update(next: Partial<PopInput>) {
    const merged = { ...input, ...next };
    setInput(merged);
    saveInput(merged);
  }

  function setFeature(index: number, value: string) {
    const features = [...input.features];
    features[index] = value;
    update({ features });
  }

  // 候補をタップすると空いている欄に入れ、選択中ならその欄を空ける
  function toggleFeature(word: string) {
    const features = [...input.features];
    const selected = features.findIndex((f) => f.trim() === word);
    if (selected >= 0) {
      features[selected] = "";
    } else {
      const empty = features.findIndex((f) => f.trim() === "");
      if (empty < 0) return;
      features[empty] = word;
    }
    update({ features });
  }

  function toggleNotice(notice: string) {
    const next = input.notices.includes(notice)
      ? input.notices.filter((n) => n !== notice)
      : [...input.notices, notice];
    update({ notices: next });
  }

  function handleGenerate() {
    if (!canGenerate) return;
    setCandidates(generate(input));
    setCopied(null);
  }

  async function handleCopy(text: string) {
    if (await copyText(text)) {
      setCopied(text);
    } else {
      alert("コピーできませんでした。文字を長押しして選択してください。");
    }
  }

  async function handleSave() {
    if (!canvasRef.current) return;
    setSaving(true);
    try {
      await savePng(canvasRef.current, popFileName(input.name));
    } catch {
      alert("画像を保存できませんでした。画面を長押しして保存してください。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <header className="no-print">
        <h1>POPキャッチコピー作成</h1>
        <p className="lead">
          商品名と特徴を入れて「候補を出す」を押すと、POPに使える短い文が出ます。
        </p>
      </header>

      <main className="layout no-print">
        <section className="card">
          <label className="field">
            <span className="label">
              商品名 <em>必須</em>
            </span>
            <input
              type="text"
              value={input.name}
              placeholder="例：キラキラ消せるボールペン"
              onChange={(e) => update({ name: e.target.value })}
            />
          </label>

          <div className="field">
            <span className="label">特徴（3つまで・空欄でもOK）</span>
            <span className="sub-label">商品の種類を選ぶと、特徴の候補が出ます</span>
            <div className="chips">
              {FEATURE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={input.category === c.id ? "chip active" : "chip"}
                  onClick={() => update({ category: input.category === c.id ? undefined : c.id })}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {category && (
              <div className="chips suggestions">
                {category.features.map((word) => {
                  const selected = input.features.some((f) => f.trim() === word);
                  return (
                    <button
                      key={word}
                      type="button"
                      className={selected ? "chip small active" : "chip small"}
                      disabled={!selected && featuresFull}
                      onClick={() => toggleFeature(word)}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            )}
            {category && featuresFull && (
              <p className="hint">特徴は3つまでです。選んだ候補をもう一度押すと外せます。</p>
            )}
            {input.features.map((f, i) => (
              <input
                key={i}
                type="text"
                value={f}
                placeholder={["例：ラメ入り", "例：消せる", "例：限定デザイン"][i]}
                onChange={(e) => setFeature(i, e.target.value)}
              />
            ))}
          </div>

          <div className="field">
            <span className="label">お知らせ（複数OK）</span>
            <span className="sub-label">POPの上に目立つ帯で入ります</span>
            <div className="chips">
              {NOTICES.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={input.notices.includes(n) ? "chip notice active" : "chip notice"}
                  onClick={() => toggleNotice(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="label">だれに向けて？</span>
            <div className="chips">
              {(Object.keys(TARGET_LABELS) as Target[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={input.target === t ? "chip active" : "chip"}
                  onClick={() => update({ target: t })}
                >
                  {TARGET_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="label">雰囲気</span>
            <div className="chips">
              {(Object.keys(TONE_LABELS) as Tone[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={input.tone === t ? "chip active" : "chip"}
                  onClick={() => update({ tone: t })}
                >
                  {TONE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="primary"
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            {candidates.length > 0 ? "別の候補を出す" : "候補を出す"}
          </button>
          {!canGenerate && <p className="hint">商品名を入れると押せるようになります。</p>}
        </section>

        {candidates.length > 0 && (
          <section className="card">
            <h2>候補</h2>
            <ul className="candidates">
              {candidates.map((c) => (
                <li key={c}>
                  <p className="copy-text">{c}</p>
                  <div className="row-actions">
                    <button type="button" onClick={() => handleCopy(c)}>
                      {copied === c ? "コピーしました" : "コピー"}
                    </button>
                    <button type="button" onClick={() => setPopText(c)}>
                      POPで表示
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {popText && (
        <div className="pop-overlay">
          <div className="pop-actions no-print">
            <button type="button" onClick={() => setPopText(null)}>
              戻る
            </button>
            <button type="button" onClick={() => window.print()}>
              印刷
            </button>
            <button type="button" className="primary" disabled={saving} onClick={handleSave}>
              画像で保存
            </button>
          </div>
          <div className="pop-backgrounds no-print">
            <span className="label">背景</span>
            <div className="chips">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={background.id === b.id ? "chip active" : "chip"}
                  onClick={() => update({ background: b.id })}
                >
                  <span className="swatch" style={{ background: b.base, borderColor: b.pattern }} />
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <canvas ref={canvasRef} className="pop-canvas" aria-label={popText} />
        </div>
      )}
    </div>
  );
}
