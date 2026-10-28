interface InputProps {
  value: number;
  onChange: (v: number) => void;
}

/** 星の入力。同じ星をもう一度押すと取り消し（押し間違いを直せるように） */
export function StarInput({ value, onChange }: InputProps) {
  return (
    <div className="star-input" role="radiogroup" aria-label="評価">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`星${n}`}
          className={n <= value ? "star on" : "star"}
          onClick={() => onChange(value === n ? 0 : n)}
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
      <span className="star-num">{value ? `★${value}` : "未評価"}</span>
    </div>
  );
}

/** 星の表示（一覧・詳細用） */
export function Stars({ value, small }: { value: number; small?: boolean }) {
  return (
    <span className={small ? "stars small" : "stars"} aria-label={`星${value}`}>
      {"★".repeat(value)}
      <span className="stars-off">{"★".repeat(5 - value)}</span>
    </span>
  );
}
