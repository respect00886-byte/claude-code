import { useLiveQuery } from "dexie-react-hooks";
import { db, deleteSake, restoreSake, type Sake } from "../db";
import { BlobImage } from "../components/BlobImage";
import { Stars } from "../components/Stars";
import { formatDate } from "../lib/date";
import { go } from "../lib/route";
import type { Toast } from "../App";

interface Props {
  sake: Sake;
  onToast: (t: Toast) => void;
}

export default function DetailPage({ sake, onToast }: Props) {
  const full = useLiveQuery(
    async () => (sake.hasPhoto ? (await db.photos.get(sake.id))?.full : undefined),
    [sake.id, sake.hasPhoto, sake.updatedAt],
  );

  // 確認ダイアログの代わりに、消したあと数秒「元に戻す」を出す（タップ数を減らすため）
  const remove = async () => {
    const { sake: removed, photo } = await deleteSake(sake.id);
    go("#/", true);
    if (removed) {
      onToast({
        message: `「${removed.name}」を削除しました`,
        action: { label: "元に戻す", run: () => void restoreSake(removed, photo) },
      });
    }
  };

  const rows: [string, string][] = [
    ["種類", sake.type],
    ["蔵元", sake.brewery],
    ["産地", sake.prefecture],
    [sake.shopKind === "bought" ? "買った店" : "飲んだ店", sake.shopName],
    ["値段", sake.price !== undefined ? `${sake.price.toLocaleString()}円` : ""],
    ["飲んだ日", formatDate(sake.drankOn)],
  ];

  return (
    <div className="page detail-page">
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="戻る" onClick={() => go("#/")}>
          ‹
        </button>
        <h1 className="ellipsis">{sake.name}</h1>
        <span className="icon-btn-space" />
      </header>

      {full && <BlobImage blob={full} alt={sake.name} className="detail-photo" />}

      <div className="detail-head">
        <div className="detail-name">{sake.name}</div>
        <Stars value={sake.rating} />
      </div>

      {sake.tags.length > 0 && (
        <div className="chips">
          {sake.tags.map((t) => (
            <span key={t} className="chip static">
              {t}
            </span>
          ))}
        </div>
      )}

      <dl className="detail-list">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd className={v ? "" : "blank"}>{v || "未入力"}</dd>
          </div>
        ))}
      </dl>

      <div className="detail-actions">
        <button type="button" className="btn primary big" onClick={() => go(`#/edit/${sake.id}`)}>
          直す・追記する
        </button>
        <button type="button" className="btn danger" onClick={remove}>
          削除
        </button>
      </div>
    </div>
  );
}
