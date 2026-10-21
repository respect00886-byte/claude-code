import { useState } from "react";
import { checkStock, formatDate } from "./lib/calc";

// 空欄や数字以外は「未入力」として扱う
function toNumber(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export default function App() {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [perDay, setPerDay] = useState("");
  const [leadDays, setLeadDays] = useState("");

  const s = toNumber(stock);
  const p = toNumber(perDay);
  const l = toNumber(leadDays);
  const ready = s !== null && p !== null && l !== null;
  const result = ready ? checkStock(s, p, l) : null;
  const label = name.trim() || "この商品";

  const reset = () => {
    setName("");
    setStock("");
    setPerDay("");
    setLeadDays("");
  };

  return (
    <div className="app">
      <h1>在庫もちチェッカー</h1>
      <p className="lead">入力すると、すぐに結果が出ます。</p>

      <div className="form">
        <label>
          商品名
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：キャラクターボールペン"
          />
        </label>
        <label>
          現在の在庫数（個）
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="例：30"
          />
        </label>
        <label>
          1日に売れる数（個）
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={perDay}
            onChange={(e) => setPerDay(e.target.value)}
            placeholder="例：3"
          />
        </label>
        <label>
          納品までの日数（日）
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={leadDays}
            onChange={(e) => setLeadDays(e.target.value)}
            placeholder="例：7"
          />
        </label>
      </div>

      {!result && <p className="hint">在庫数・売れる数・納品までの日数を入れてください。</p>}

      {result?.kind === "noSales" && (
        <div className="result ok">
          <p className="title">{label}</p>
          <p className="verdict">1日に売れる数が0のため、在庫は減りません。</p>
        </div>
      )}

      {result && result.kind !== "noSales" && (
        <div className={`result ${result.kind}`}>
          <p className="title">{label}</p>
          <p className="big">
            あと <strong>{result.daysLeft}</strong> 日もちます
          </p>
          <p>
            在庫が切れる日：
            <strong>{formatDate(result.runOutDate)}</strong>
            （{result.daysLeft === 0 ? "今日" : `今日から${result.daysLeft}日後`}）
          </p>
          {result.kind === "short" ? (
            <p className="verdict">
              ⚠ 納品までに足りなくなります
              <br />
              <span className="sub">
                {result.shortDays}日分・約{result.shortQty}個 不足
              </span>
            </p>
          ) : (
            <p className="verdict">✓ 納品まで間に合います</p>
          )}
        </div>
      )}

      <button type="button" className="reset" onClick={reset}>
        入力をクリア
      </button>
    </div>
  );
}
