import { useEffect, useMemo, useRef, useState } from "react";
import { BACKGROUNDS, findBackground } from "./data/backgrounds";
import { FEATURE_CATEGORIES } from "./data/featureSuggestions";
import { NOTICES } from "./data/notices";
import { PHRASE_CATEGORIES } from "./data/phrases";
import { findSize, POP_SIZES, printLayout } from "./data/sizes";
import { drawPop, popFileName, savePng } from "./lib/drawPop";
import { generate, plainText } from "./lib/generate";
import { loadInput, loadPhrases, saveInput, savePhrases } from "./lib/storage";
import type { MyPhrases } from "./lib/storage";
import { TARGET_LABELS, TONE_LABELS } from "./types";
import type { PopInput, Target, Tone } from "./types";

const FEATURE_SLOTS = 3;

const EMPTY_INPUT: PopInput = {
  heading: "",
  sub: "",
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
  const [showPop, setShowPop] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phrases, setPhrases] = useState<MyPhrases>(loadPhrases);
  const [phraseCategory, setPhraseCategory] = useState<string | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canGenerate = input.name.trim() !== "";
  const hasText = input.heading.trim() !== "" || input.sub.trim() !== "";
  const category = FEATURE_CATEGORIES.find((c) => c.id === input.category);
  const stockPhrases = PHRASE_CATEGORIES.find((c) => c.id === phraseCategory);
  const featuresFull = input.features.every((f) => f.trim() !== "");
  const background = findBackground(input.background);
  const size = findSize(input.size);
  const print = printLayout(size);
  // お知らせは選んだ順ではなく、いつも同じ並び順で出す
  const notices = useMemo(() => NOTICES.filter((n) => input.notices.includes(n)), [input.notices]);

  const features = useMemo(
    () => input.features.map((f) => f.trim()).filter((f) => f !== ""),
    [input.features],
  );

  // プレビューと保存画像は同じ描き方なので、画面で見たものがそのまま画像になる
  useEffect(() => {
    const pop = { heading: input.heading, sub: input.sub, notices, features, background, size };
    if (previewRef.current) drawPop(previewRef.current, pop);
    if (showPop && canvasRef.current) drawPop(canvasRef.current, pop);
  }, [showPop, input.heading, input.sub, notices, features, background, size]);

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

  function addPhrase(kind: keyof MyPhrases, text: string) {
    const phrase = text.trim();
    if (phrase === "") return;
    // 同じフレーズは重ねず、新しく登録したものを先頭に出す
    const next = { ...phrases, [kind]: [phrase, ...phrases[kind].filter((p) => p !== phrase)] };
    setPhrases(next);
    savePhrases(next);
  }

  function removePhrase(kind: keyof MyPhrases, phrase: string) {
    if (!confirm(`「${plainText(phrase)}」を削除しますか？`)) return;
    const next = { ...phrases, [kind]: phrases[kind].filter((p) => p !== phrase) };
    setPhrases(next);
    savePhrases(next);
  }

  // 自動生成の候補を見出しに入れる。文に商品名が入っていなければ補足文に添える
  function applyCandidate(text: string) {
    const name = input.name.trim();
    const sub = input.sub.trim() === "" && !plainText(text).includes(name) ? name : input.sub;
    update({ heading: text, sub });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleGenerate() {
    if (!canGenerate) return;
    setCandidates(generate(input));
    setCopied(null);
  }

  async function handleCopy(text: string) {
    if (await copyText(plainText(text))) {
      setCopied(text);
    } else {
      alert("コピーできませんでした。文字を長押しして選択してください。");
    }
  }

  async function handleSave() {
    if (!canvasRef.current) return;
    setSaving(true);
    try {
      await savePng(canvasRef.current, popFileName(plainText(input.heading).slice(0, 20)));
    } catch {
      alert("画像を保存できませんでした。画面を長押しして保存してください。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <header className="no-print">
        <h1>POP作成</h1>
        <p className="lead">
          見出しと補足文を入れると、下のプレビューにPOPができます。文字の大きさは文字数に合わせて自動で変わります。
        </p>
      </header>

      <main className="layout no-print">
        <div className="column">
          <section className="card">
            <h2>POPの文章</h2>
            <div className="field">
              <div className="label-row">
                <span className="label">見出し（大きい文字）</span>
                <span className="count">
                  {plainText(input.heading).replace(/\n/g, "").length}文字
                </span>
              </div>
              <span className="sub-label">改行すると、その位置で行が変わります</span>
              <textarea
                rows={2}
                value={input.heading}
                placeholder="例：ただいま品切れ中です"
                onChange={(e) => update({ heading: e.target.value })}
              />
              <button
                type="button"
                className="register"
                disabled={input.heading.trim() === ""}
                onClick={() => addPhrase("headings", input.heading)}
              >
                ☆ この文をマイフレーズに登録
              </button>
            </div>

            <div className="field">
              <div className="label-row">
                <span className="label">補足文（小さい文字・空欄でもOK）</span>
                <span className="count">{plainText(input.sub).replace(/\n/g, "").length}文字</span>
              </div>
              <span className="sub-label">見出しの下に小さく入ります</span>
              <textarea
                rows={3}
                value={input.sub}
                placeholder="例：次回入荷は10月下旬の予定です。"
                onChange={(e) => update({ sub: e.target.value })}
              />
              <button
                type="button"
                className="register"
                disabled={input.sub.trim() === ""}
                onClick={() => addPhrase("subs", input.sub)}
              >
                ☆ この文をマイフレーズに登録
              </button>
            </div>

            <div className="field">
              <span className="label">お知らせ（複数OK）</span>
              <span className="sub-label">POPの上に赤い帯で入ります</span>
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
          </section>

          <section className="card">
            <h2>言い回しから選ぶ</h2>
            <p className="hint top">タップすると入力欄に入ります（今の文と入れ替わります）</p>
            <div className="field">
              <span className="label">定番の言い回し</span>
              <div className="chips">
                {PHRASE_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={phraseCategory === c.id ? "chip active" : "chip"}
                    onClick={() => setPhraseCategory(phraseCategory === c.id ? null : c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {stockPhrases && (
                <div className="phrase-box">
                  <span className="sub-label">見出しに入れる</span>
                  <div className="chips">
                    {stockPhrases.headings.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="chip small"
                        onClick={() => update({ heading: p })}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <span className="sub-label">補足文に入れる</span>
                  <div className="chips">
                    {stockPhrases.subs.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="chip small"
                        onClick={() => update({ sub: p })}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="field">
              <span className="label">マイフレーズ</span>
              {phrases.headings.length === 0 && phrases.subs.length === 0 ? (
                <p className="hint">
                  まだありません。入力欄の下の「☆ 登録」で、よく使う文を登録できます。
                </p>
              ) : (
                <div className="phrase-box">
                  {phrases.headings.length > 0 && <span className="sub-label">見出し用</span>}
                  <div className="chips">
                    {phrases.headings.map((p) => (
                      <span key={p} className="my-phrase">
                        <button
                          type="button"
                          className="chip small"
                          onClick={() => update({ heading: p })}
                        >
                          {plainText(p)}
                        </button>
                        <button
                          type="button"
                          className="remove"
                          aria-label="削除"
                          onClick={() => removePhrase("headings", p)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  {phrases.subs.length > 0 && <span className="sub-label">補足文用</span>}
                  <div className="chips">
                    {phrases.subs.map((p) => (
                      <span key={p} className="my-phrase">
                        <button
                          type="button"
                          className="chip small"
                          onClick={() => update({ sub: p })}
                        >
                          {plainText(p)}
                        </button>
                        <button
                          type="button"
                          className="remove"
                          aria-label="削除"
                          onClick={() => removePhrase("subs", p)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="column">
          <section className="card preview">
            <h2>プレビュー</h2>
            {hasText ? (
              <canvas
                ref={previewRef}
                className={
                  size.widthMm < size.heightMm ? "preview-canvas portrait" : "preview-canvas"
                }
                aria-label={plainText(`${input.heading} ${input.sub}`)}
              />
            ) : (
              <p className="hint">見出しか補足文を入れると、ここにPOPが出ます。</p>
            )}
            <button
              type="button"
              className="primary"
              disabled={!hasText}
              onClick={() => setShowPop(true)}
            >
              仕上げ・印刷・保存へ
            </button>
          </section>

          <details className="card sub-feature">
            <summary>自動で候補を出す（サブ機能）</summary>
            <p className="hint top">
              商品名と特徴を入れると、見出しに使える短い文の候補を出します。
            </p>
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

            {candidates.length > 0 && (
              <ul className="candidates">
                {candidates.map((c) => (
                  <li key={c}>
                    <p className="copy-text">{plainText(c)}</p>
                    <div className="row-actions">
                      <button type="button" onClick={() => handleCopy(c)}>
                        {copied === c ? "コピーしました" : "コピー"}
                      </button>
                      <button type="button" onClick={() => applyCandidate(c)}>
                        見出しに使う
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </details>
        </div>
      </main>

      {showPop && (
        <div className="pop-overlay">
          <div className="pop-actions no-print">
            <button type="button" onClick={() => setShowPop(false)}>
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
            <span className="label">サイズ</span>
            <div className="chips">
              {POP_SIZES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={size.id === s.id ? "chip active" : "chip"}
                  onClick={() => update({ size: s.id })}
                >
                  {s.label}
                </button>
              ))}
            </div>
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
          {/* 用紙の向きと印刷の大きさはサイズごとに変わるので、ここで指定する */}
          <style>{`
            @page { size: A4 ${print.landscape ? "landscape" : "portrait"}; margin: 10mm; }
            @media print {
              .pop-canvas, .pop-canvas.portrait { width: ${print.widthMm}mm; height: ${print.heightMm}mm; }
            }
          `}</style>
          <canvas
            ref={canvasRef}
            className={size.widthMm < size.heightMm ? "pop-canvas portrait" : "pop-canvas"}
            aria-label={plainText(`${input.heading} ${input.sub}`)}
          />
        </div>
      )}
    </div>
  );
}
