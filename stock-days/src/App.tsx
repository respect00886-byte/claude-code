import { useEffect, useMemo, useRef, useState } from "react";
import type { SalesMode, StockItem } from "./types";
import { calcStock, compareResults, formatDate, todayStr, type StockResult } from "./lib/calc";
import { loadItems, saveItems } from "./lib/storage";

// 入力欄は途中の「空」も扱えるよう、文字のまま持っておく
interface Form {
  name: string;
  stock: string;
  salesMode: SalesMode;
  periodDays: string;
  periodSold: string;
  dailySold: string;
  leadDays: string;
  countedOn: string;
}

function emptyForm(): Form {
  return {
    name: "",
    stock: "",
    salesMode: "period",
    periodDays: "7",
    periodSold: "",
    dailySold: "",
    leadDays: "",
    countedOn: todayStr(),
  };
}

function toForm(item: StockItem): Form {
  return {
    name: item.name,
    stock: String(item.stock),
    salesMode: item.salesMode,
    periodDays: String(item.periodDays),
    periodSold: String(item.periodSold),
    dailySold: String(item.dailySold),
    leadDays: item.leadDays == null ? "" : String(item.leadDays),
    countedOn: item.countedOn,
  };
}

// 全角数字で入力されても受け付ける
function num(s: string): number | null {
  const t = s.replace(/[０-９．]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const LEVEL_LABEL = { danger: "急いで", warn: "注意", ok: "余裕あり", none: "—" } as const;

function formatPerDay(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function App() {
  const [items, setItems] = useState<StockItem[]>(loadItems);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const today = todayStr();

  useEffect(() => saveItems(items), [items]);

  const rows = useMemo(
    () =>
      items
        .map((item) => ({ item, result: calcStock(item, today) }))
        .sort((a, b) => compareResults(a.result, b.result)),
    [items, today],
  );

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    const stock = num(form.stock);
    const periodDays = num(form.periodDays);
    const periodSold = num(form.periodSold);
    const dailySold = num(form.dailySold);
    const leadDays = num(form.leadDays);
    if (form.name.trim() === "") return setError("商品名を入れてください");
    if (stock == null) return setError("在庫数を数字で入れてください");
    if (form.salesMode === "period") {
      if (periodDays == null || periodDays <= 0) return setError("何日間かを1以上で入れてください");
      if (periodSold == null) return setError("その期間に売れた数を入れてください");
    } else if (dailySold == null) {
      return setError("1日に売れる数を入れてください");
    }
    if (form.leadDays.trim() !== "" && leadDays == null) {
      return setError("納品までの日数は数字で入れてください");
    }

    const item: StockItem = {
      id: editingId ?? newId(),
      name: form.name.trim(),
      stock,
      salesMode: form.salesMode,
      periodDays: periodDays ?? 7,
      periodSold: periodSold ?? 0,
      dailySold: dailySold ?? 0,
      leadDays,
      countedOn: form.countedOn || today,
    };
    setItems((list) =>
      editingId ? list.map((x) => (x.id === editingId ? item : x)) : [...list, item],
    );
    setForm(emptyForm());
    setEditingId(null);
    setError("");
  };

  const startEdit = (item: StockItem) => {
    setForm(toForm(item));
    setEditingId(item.id);
    setError("");
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelEdit = () => {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
  };

  const remove = (item: StockItem) => {
    if (!confirm(`「${item.name}」を一覧から消しますか？`)) return;
    setItems((list) => list.filter((x) => x.id !== item.id));
    if (editingId === item.id) cancelEdit();
  };

  return (
    <div className="app">
      <h1>在庫もつ日数</h1>
      <p className="lead">在庫があと何日もつか、いつまでに発注すればよいかを計算します。</p>

      <div className="card" ref={formRef}>
        <h2>{editingId ? "商品を編集" : "商品を追加"}</h2>

        <label className="field">
          <span className="label">商品名</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="例：キャラクターボールペン"
          />
        </label>

        <label className="field">
          <span className="label">今の在庫数</span>
          <span className="inline">
            <input
              type="text"
              inputMode="numeric"
              value={form.stock}
              // 在庫を数え直したときは、数えた日も今日に合わせる
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value, countedOn: today }))}
              placeholder="0"
            />
            個
          </span>
        </label>

        <div className="field">
          <span className="label">売れる数</span>
          <div className="toggle">
            <button
              type="button"
              className={form.salesMode === "period" ? "on" : ""}
              onClick={() => set("salesMode", "period")}
            >
              期間の合計で
            </button>
            <button
              type="button"
              className={form.salesMode === "daily" ? "on" : ""}
              onClick={() => set("salesMode", "daily")}
            >
              1日の数で
            </button>
          </div>
          {form.salesMode === "period" ? (
            <span className="inline">
              過去
              <input
                type="text"
                inputMode="numeric"
                value={form.periodDays}
                onChange={(e) => set("periodDays", e.target.value)}
              />
              日で
              <input
                type="text"
                inputMode="numeric"
                value={form.periodSold}
                onChange={(e) => set("periodSold", e.target.value)}
                placeholder="0"
              />
              個
            </span>
          ) : (
            <span className="inline">
              1日
              <input
                type="text"
                inputMode="decimal"
                value={form.dailySold}
                onChange={(e) => set("dailySold", e.target.value)}
                placeholder="0"
              />
              個
            </span>
          )}
        </div>

        <label className="field">
          <span className="label">
            納品までの日数 <small>（任意）</small>
          </span>
          <span className="inline">
            発注から
            <input
              type="text"
              inputMode="numeric"
              value={form.leadDays}
              onChange={(e) => set("leadDays", e.target.value)}
              placeholder="例 5"
            />
            日で届く
          </span>
          <span className="hint">入れると「いつまでに発注すればよいか」も出します。</span>
        </label>

        <label className="field">
          <span className="label">在庫を数えた日</span>
          <input
            type="date"
            value={form.countedOn}
            max={today}
            onChange={(e) => set("countedOn", e.target.value)}
          />
          <span className="hint">日がたつと、そのぶん残り日数を自動で減らします。</span>
        </label>

        {error && <p className="error">{error}</p>}

        <div className="actions">
          {editingId && (
            <button type="button" className="sub" onClick={cancelEdit}>
              やめる
            </button>
          )}
          <button type="button" className="primary" onClick={submit}>
            {editingId ? "保存する" : "一覧に追加"}
          </button>
        </div>
      </div>

      <h2 className="list-title">もうすぐ無くなる順</h2>
      {rows.length === 0 ? (
        <p className="empty">まだ商品がありません。上のフォームから追加してください。</p>
      ) : (
        <ul className="list">
          {rows.map(({ item, result }) => (
            <li key={item.id} className={`item ${result.level}`}>
              <div className="item-head">
                <span className="badge">{LEVEL_LABEL[result.level]}</span>
                <span className="name">{item.name}</span>
              </div>
              <Summary result={result} />
              <p className="detail">
                在庫 {item.stock}個（{formatDate(item.countedOn)}時点）・1日 約
                {formatPerDay(result.perDay)}個売れる
              </p>
              <div className="item-actions">
                <button type="button" onClick={() => startEdit(item)}>
                  編集・数え直し
                </button>
                <button type="button" className="delete" onClick={() => remove(item)}>
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Summary({ result }: { result: StockResult }) {
  if (result.daysLeft == null) {
    return <p className="days">売れていないため計算できません</p>;
  }
  return (
    <>
      <p className="days">
        {result.daysLeft === 0 ? (
          <strong>今日中に無くなります</strong>
        ) : (
          <>
            あと <strong>{result.daysLeft}</strong> 日
            <span className="date">（{formatDate(result.emptyOn!)}ごろ無くなる）</span>
          </>
        )}
      </p>
      {result.daysToOrder != null && (
        <p className="order">
          {result.daysToOrder <= 0
            ? "今すぐ発注してください"
            : `${formatDate(result.orderBy!)}までに発注`}
        </p>
      )}
    </>
  );
}
