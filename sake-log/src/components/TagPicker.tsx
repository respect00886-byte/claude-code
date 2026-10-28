import { useState } from "react";
import { TAG_GROUPS } from "../data/tags";

interface Props {
  selected: string[];
  customTags: string[];
  onToggle: (tag: string) => void;
  onAddCustom: (tag: string) => void;
}

/** ワンタップで付けるコメント。ON は色だけでなく ✓ でも分かるようにする */
export function TagPicker({ selected, customTags, onToggle, onAddCustom }: Props) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");

  const known = new Set([...TAG_GROUPS.flatMap((g) => g.tags), ...customTags]);
  // 設定で消したマイコメントでも、この記録に付いていれば表示して外せるようにする
  const mine = [...customTags, ...selected.filter((t) => !known.has(t))];

  const submit = () => {
    const v = text.trim();
    if (v) {
      onAddCustom(v);
      if (!selected.includes(v)) onToggle(v);
    }
    setText("");
    setAdding(false);
  };

  const chip = (t: string) => {
    const on = selected.includes(t);
    return (
      <button
        key={t}
        type="button"
        className={on ? "chip on" : "chip"}
        aria-pressed={on}
        onClick={() => onToggle(t)}
      >
        {on && <span aria-hidden>✓ </span>}
        {t}
      </button>
    );
  };

  return (
    <div className="tag-picker">
      {TAG_GROUPS.map((g) => (
        <div key={g.label} className="tag-group">
          <div className="tag-group-label">{g.label}</div>
          <div className="chips">{g.tags.map(chip)}</div>
        </div>
      ))}
      <div className="tag-group">
        <div className="tag-group-label">マイコメント</div>
        <div className="chips">
          {mine.map(chip)}
          {adding ? (
            <form
              className="chip-add-form"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <input
                autoFocus
                value={text}
                maxLength={20}
                placeholder="例：桃っぽい"
                onChange={(e) => setText(e.target.value)}
                onBlur={submit}
              />
            </form>
          ) : (
            <button type="button" className="chip add" onClick={() => setAdding(true)}>
              ＋ 追加
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
