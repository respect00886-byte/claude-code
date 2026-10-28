import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Sake } from "../db";
import { PRESET_TAGS } from "../data/tags";
import { BlobImage } from "../components/BlobImage";
import { Stars } from "../components/Stars";
import { filterSakes, isIncomplete, type FilterOptions } from "../lib/filter";
import { formatDate } from "../lib/date";
import { go } from "../lib/route";

export interface ListState extends FilterOptions {
  view: "card" | "tile";
}

interface Props {
  sakes: Sake[];
  customTags: string[];
  state: ListState;
  onChange: (s: ListState) => void;
}

export default function ListPage({ sakes, customTags, state, onChange }: Props) {
  const shown = useMemo(() => filterSakes(sakes, state), [sakes, state]);

  // 絞り込みのチップは、実際に記録に付いているコメントだけを定番の並び順で出す
  const usedTags = useMemo(() => {
    const used = new Set(sakes.flatMap((s) => s.tags));
    const order = [...PRESET_TAGS, ...customTags];
    const rest = [...used].filter((t) => !order.includes(t));
    return [...order, ...rest].filter((t) => used.has(t) && !state.tags.includes(t));
  }, [sakes, customTags, state.tags]);

  const set = (p: Partial<ListState>) => onChange({ ...state, ...p });

  return (
    <div className="page list-page">
      <header className="topbar">
        <h1>日本酒ログ</h1>
        <button
          type="button"
          className="icon-btn"
          aria-label="設定"
          onClick={() => go("#/settings")}
        >
          ⚙
        </button>
      </header>

      {sakes.length > 0 && (
        <div className="list-tools">
          <input
            type="search"
            className="search"
            placeholder="名前・蔵元・産地・お店で探す"
            value={state.query}
            onChange={(e) => set({ query: e.target.value })}
          />
          <div className="tool-row">
            <div className="segment" role="group" aria-label="並び替え">
              <button
                type="button"
                aria-pressed={state.sort === "new"}
                onClick={() => set({ sort: "new" })}
              >
                新しい順
              </button>
              <button
                type="button"
                aria-pressed={state.sort === "rating"}
                onClick={() => set({ sort: "rating" })}
              >
                ★の多い順
              </button>
            </div>
            <div className="segment" role="group" aria-label="表示">
              <button
                type="button"
                aria-pressed={state.view === "card"}
                onClick={() => set({ view: "card" })}
              >
                一覧
              </button>
              <button
                type="button"
                aria-pressed={state.view === "tile"}
                onClick={() => set({ view: "tile" })}
              >
                写真
              </button>
            </div>
          </div>
          {(state.tags.length > 0 || usedTags.length > 0) && (
            <div className="filter-chips">
              {state.tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="chip on"
                  aria-label={`${t}の絞り込みを解除`}
                  onClick={() => set({ tags: state.tags.filter((x) => x !== t) })}
                >
                  ✓ {t} ×
                </button>
              ))}
              {usedTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="chip"
                  onClick={() => set({ tags: [...state.tags, t] })}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
          <div className="count">
            {shown.length}件
            {(state.query || state.tags.length > 0) && (
              <button
                type="button"
                className="link-btn"
                onClick={() => set({ query: "", tags: [] })}
              >
                条件をクリア
              </button>
            )}
          </div>
        </div>
      )}

      {sakes.length === 0 ? (
        <p className="empty">
          まだ記録がありません。
          <br />
          右下の「＋」から、飲んだお酒を記録しましょう。
        </p>
      ) : shown.length === 0 ? (
        <p className="empty">条件に合う記録はありません。</p>
      ) : state.view === "tile" ? (
        <div className="tiles">
          {shown.map((s) => (
            <Tile key={s.id} sake={s} />
          ))}
        </div>
      ) : (
        <div className="cards">
          {shown.map((s) => (
            <Card key={s.id} sake={s} />
          ))}
        </div>
      )}

      <button type="button" className="fab" aria-label="新しく記録" onClick={() => go("#/new")}>
        ＋
      </button>
    </div>
  );
}

function useThumb(sake: Sake) {
  return useLiveQuery(
    async () => (sake.hasPhoto ? (await db.photos.get(sake.id))?.thumb : undefined),
    [sake.id, sake.hasPhoto, sake.updatedAt],
  );
}

function Card({ sake }: { sake: Sake }) {
  const thumb = useThumb(sake);
  return (
    <button type="button" className="card" onClick={() => go(`#/sake/${sake.id}`)}>
      <div className="card-photo">
        {thumb ? <BlobImage blob={thumb} alt="" /> : <span aria-hidden>🍶</span>}
      </div>
      <div className="card-body">
        <div className="card-name">{sake.name}</div>
        <Stars value={sake.rating} small />
        {sake.tags.length > 0 && (
          <div className="card-tags">
            {sake.tags.slice(0, 3).join("・")}
            {sake.tags.length > 3 && ` ほか${sake.tags.length - 3}`}
          </div>
        )}
        <div className="card-meta">
          {formatDate(sake.drankOn)}
          {sake.shopName && ` ・ ${sake.shopName}`}
        </div>
        {isIncomplete(sake) && <span className="badge">あとで追記</span>}
      </div>
    </button>
  );
}

function Tile({ sake }: { sake: Sake }) {
  const thumb = useThumb(sake);
  return (
    <button
      type="button"
      className="tile"
      aria-label={`${sake.name} 星${sake.rating}`}
      onClick={() => go(`#/sake/${sake.id}`)}
    >
      {thumb ? <BlobImage blob={thumb} alt="" /> : <span className="tile-name">{sake.name}</span>}
      <span className="tile-stars">★{sake.rating}</span>
    </button>
  );
}
