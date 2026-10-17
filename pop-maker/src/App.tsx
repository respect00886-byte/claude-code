import { useState } from "react";
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
};

function initialInput(): PopInput {
  const saved = loadInput();
  if (!saved) return EMPTY_INPUT;
  // 古い保存データでも特徴欄が3つそろうようにする
  const features = [...(saved.features ?? []), "", "", ""].slice(0, FEATURE_SLOTS);
  return { ...EMPTY_INPUT, ...saved, features };
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

// 「！」「、」「。」の後ろで区切り、POPで単語の途中から改行されにくくする
function splitLines(text: string): string[] {
  return text.split(/(?<=[！、。])/).filter((s) => s !== "");
}

export default function App() {
  const [input, setInput] = useState<PopInput>(initialInput);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [popText, setPopText] = useState<string | null>(null);

  const canGenerate = input.name.trim() !== "";

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

  return (
    <div className="app">
      <header className="no-print">
        <h1>POPキャッチコピー作成</h1>
        <p className="lead">商品名と特徴を入れて「候補を出す」を押すと、POPに使える短い文が出ます。</p>
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
            <button type="button" className="primary" onClick={() => window.print()}>
              印刷
            </button>
          </div>
          <div className="pop-card">
            <p className="pop-copy">
              {splitLines(popText).map((line, i) => (
                <span key={i} className="pop-line">
                  {line}
                </span>
              ))}
            </p>
            {/* コピー文に商品名が入っていなければ、下に小さく添える */}
            {!popText.includes(input.name.trim()) && <p className="pop-name">{input.name}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
