import { useEffect, useState } from "react";
import type { Item, Thresholds } from "./types";
import { LEVEL_LABEL, daysLeft, formatDays, levelOf, runOutDate, sortByDays } from "./lib/calc";
import { loadItems, loadThresholds, saveItems, saveThresholds } from "./lib/storage";

// 入力欄の文字を数に直す。空や数字以外、マイナスは 0 にする
function toNumber(text: string): number {
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// 固定した順番の中での位置。リストにない商品（念のため）は最後に回す
function orderIndex(order: string[], id: string): number {
  const i = order.indexOf(id);
  return i === -1 ? order.length : i;
}

export default function App() {
  const [items, setItems] = useState<Item[]>(loadItems);
  const [thresholds, setThresholds] = useState<Thresholds>(loadThresholds);
  const [openId, setOpenId] = useState<string | null>(null);
  // 編集中に並び順が変わると、押したい商品が指の下から動いてしまうので、開いた時の順番で止めておく
  const [frozenOrder, setFrozenOrder] = useState<string[] | null>(null);

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [perDay, setPerDay] = useState("");

  useEffect(() => saveItems(items), [items]);
  useEffect(() => saveThresholds(thresholds), [thresholds]);

  function addItem() {
    if (name.trim() === "") return;
    const item: Item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      stock: toNumber(stock),
      perDay: toNumber(perDay),
      updatedAt: Date.now(),
    };
    setItems((prev) => [...prev, item]);
    setName("");
    setStock("");
    setPerDay("");
  }

  // 数を直したら「最後に直した日」も今日にする（切れる目安日がずれないように）
  function updateItem(id: string, patch: Partial<Item>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch, updatedAt: Date.now() } : it)),
    );
  }

  function removeItem(item: Item) {
    if (!window.confirm(`「${item.name}」を削除しますか？`)) return;
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    toggle(null);
  }

  function toggle(id: string | null) {
    setOpenId(id);
    setFrozenOrder(id == null ? null : sorted.map((it) => it.id));
  }

  const sorted = frozenOrder
    ? [...items].sort((a, b) => orderIndex(frozenOrder, a.id) - orderIndex(frozenOrder, b.id))
    : sortByDays(items);
  const redCount = sorted.filter((it) => levelOf(daysLeft(it), thresholds) === "red").length;

  return (
    <div className="app">
      <h1>在庫もちチェッカー</h1>
      <p className="lead">在庫数 ÷ 1日に売れる数 ＝ あと何日もつか</p>

      <section className="card">
        <h2>商品を追加</h2>
        <label className="field">
          商品名
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：ボールペン 黒" />
        </label>
        <div className="row2">
          <label className="field">
            在庫数
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="30"
            />
          </label>
          <label className="field">
            1日に売れる数
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={perDay}
              onChange={(e) => setPerDay(e.target.value)}
              placeholder="3"
            />
          </label>
        </div>
        <button className="primary" onClick={addItem} disabled={name.trim() === ""}>
          追加する
        </button>
      </section>

      <section className="card">
        <h2>
          一覧（{items.length}件）
          {redCount > 0 && <span className="alert">発注 {redCount}件</span>}
        </h2>
        {items.length === 0 && <p className="empty">まだ商品がありません。上から追加してください。</p>}
        <ul className="list">
          {sorted.map((it) => {
            const days = daysLeft(it);
            const level = levelOf(days, thresholds);
            const open = openId === it.id;
            return (
              <li key={it.id} className={`item level-${level}`}>
                <button className="item-head" onClick={() => toggle(open ? null : it.id)}>
                  <span className="item-name">{it.name}</span>
                  <span className="item-days">{formatDays(days)}</span>
                  <span className={`badge badge-${level}`}>{LEVEL_LABEL[level]}</span>
                  <span className="item-sub">
                    在庫 {it.stock}個 ／ 1日 {it.perDay}個 {runOutDate(it) && `／ ${runOutDate(it)}に切れる`}
                  </span>
                </button>
                {open && (
                  <div className="item-edit">
                    <div className="label">在庫数</div>
                    <div className="stepper">
                      {[-10, -1].map((d) => (
                        <button key={d} onClick={() => updateItem(it.id, { stock: Math.max(0, it.stock + d) })}>
                          {d}
                        </button>
                      ))}
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={it.stock}
                        onChange={(e) => updateItem(it.id, { stock: toNumber(e.target.value) })}
                      />
                      {[1, 10].map((d) => (
                        <button key={d} onClick={() => updateItem(it.id, { stock: it.stock + d })}>
                          +{d}
                        </button>
                      ))}
                    </div>
                    <label className="field">
                      1日に売れる数
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.1"
                        value={it.perDay}
                        onChange={(e) => updateItem(it.id, { perDay: toNumber(e.target.value) })}
                      />
                    </label>
                    <div className="edit-actions">
                      <button className="danger" onClick={() => removeItem(it)}>
                        削除
                      </button>
                      <button className="primary" onClick={() => toggle(null)}>
                        閉じる
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <h2>色分けの基準</h2>
        <div className="row2">
          <label className="field">
            <span>
              <span className="badge badge-red">発注</span> あと何日以下
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={thresholds.red}
              onChange={(e) => {
                const red = toNumber(e.target.value);
                // 「注意」は「発注」より短くならないようにそろえる
                setThresholds((t) => ({ red, yellow: Math.max(t.yellow, red) }));
              }}
            />
          </label>
          <label className="field">
            <span>
              <span className="badge badge-yellow">注意</span> あと何日以下
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={thresholds.yellow}
              onChange={(e) => setThresholds((t) => ({ ...t, yellow: toNumber(e.target.value) }))}
              onBlur={() => setThresholds((t) => ({ ...t, yellow: Math.max(t.yellow, t.red) }))}
            />
          </label>
        </div>
        <p className="note">データはこの端末のブラウザの中だけに保存されます。</p>
      </section>
    </div>
  );
}
