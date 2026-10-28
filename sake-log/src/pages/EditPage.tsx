import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { addCustomTag, db, saveSake, type PhotoInput, type Sake, type ShopKind } from "../db";
import { PREFECTURES, SAKE_TYPES } from "../data/options";
import { PRESET_TAGS } from "../data/tags";
import { BlobImage } from "../components/BlobImage";
import { StarInput } from "../components/Stars";
import { TagPicker } from "../components/TagPicker";
import { latestSake, recentShopNames } from "../lib/filter";
import { toDateKey } from "../lib/date";
import { makePhoto } from "../lib/image";
import { go } from "../lib/route";
import type { Toast } from "../App";

interface Props {
  /** 編集するとき。なければ新規 */
  sake?: Sake;
  sakes: Sake[];
  customTags: string[];
  onToast: (t: Toast) => void;
}

/** undefined: 写真はそのまま / null: 写真を消す / それ以外: 新しい写真 */
type PhotoChange = PhotoInput | null | undefined;

export default function EditPage({ sake, sakes, customTags, onToast }: Props) {
  // 新規のときは、前回のお店をそのまま使えるよう初期値にする（同じ店で何杯も飲むことが多いため）
  const last = sake ? undefined : latestSake(sakes);
  const [name, setName] = useState(sake?.name ?? "");
  const [rating, setRating] = useState(sake?.rating ?? 0);
  const [tags, setTags] = useState<string[]>(sake?.tags ?? []);
  const [type, setType] = useState(sake?.type ?? "");
  const [brewery, setBrewery] = useState(sake?.brewery ?? "");
  const [prefecture, setPrefecture] = useState(sake?.prefecture ?? "");
  const [shopKind, setShopKind] = useState<ShopKind>(sake?.shopKind ?? last?.shopKind ?? "drank");
  const [shopName, setShopName] = useState(sake?.shopName ?? last?.shopName ?? "");
  const [price, setPrice] = useState(sake?.price?.toString() ?? "");
  const [drankOn, setDrankOn] = useState(sake?.drankOn ?? toDateKey());
  const [photo, setPhoto] = useState<PhotoChange>(undefined);
  const [busy, setBusy] = useState<"" | "photo" | "save">("");
  const fileRef = useRef<HTMLInputElement>(null);

  const saved = useLiveQuery(
    async () => (sake?.hasPhoto ? (await db.photos.get(sake.id))?.thumb : undefined),
    [sake?.id, sake?.hasPhoto],
  );
  const preview = photo === undefined ? saved : (photo?.thumb ?? undefined);
  const shops = recentShopNames(sakes);
  const breweries = [...new Set(sakes.map((s) => s.brewery).filter(Boolean))];
  const canSave = name.trim() !== "" && rating > 0 && busy === "";

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setBusy("photo");
    try {
      setPhoto(await makePhoto(file));
    } catch {
      onToast({ message: "写真を読み込めませんでした" });
    } finally {
      setBusy("");
    }
  };

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const save = async () => {
    if (!canSave) return;
    setBusy("save");
    const n = Number(price);
    try {
      const id = await saveSake(
        {
          name: name.trim(),
          rating,
          tags,
          type,
          brewery: brewery.trim(),
          prefecture,
          shopKind,
          shopName: shopName.trim(),
          price: price.trim() !== "" && Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined,
          drankOn: drankOn || toDateKey(),
        },
        { id: sake?.id, photo },
      );
      onToast({ message: "保存しました" });
      go(sake ? `#/sake/${id}` : "#/", true);
    } catch {
      setBusy("");
      onToast({ message: "保存できませんでした。もう一度お試しください" });
    }
  };

  return (
    <div className="page edit-page">
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="戻る" onClick={() => history.back()}>
          ‹
        </button>
        <h1>{sake ? "記録を直す" : "新しく記録"}</h1>
        <span className="icon-btn-space" />
      </header>

      <section className="field">
        <label className="label" htmlFor="name">
          お酒の名前 <span className="req">必須</span>
        </label>
        <div className="name-row">
          <input
            id="name"
            className="input"
            value={name}
            placeholder="例：獺祭 純米大吟醸45"
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            className="photo-btn"
            aria-label={preview ? "写真を撮り直す" : "写真を追加"}
            onClick={() => fileRef.current?.click()}
            disabled={busy === "photo"}
          >
            {busy === "photo" ? "…" : preview ? <BlobImage blob={preview} alt="" /> : "📷"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              void pickPhoto(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {preview && (
          <button type="button" className="link-btn" onClick={() => setPhoto(null)}>
            写真を外す
          </button>
        )}
      </section>

      <section className="field">
        <div className="label">
          評価 <span className="req">必須</span>
        </div>
        <StarInput value={rating} onChange={setRating} />
      </section>

      <section className="field">
        <div className="label">味・香りのコメント（タップで選ぶ）</div>
        <TagPicker
          selected={tags}
          customTags={customTags}
          onToggle={toggleTag}
          onAddCustom={(t) => void addCustomTag(t, PRESET_TAGS)}
        />
      </section>

      {/* 酔っていてもすぐ保存できるよう、くわしい項目は折りたたむ（編集のときは開いておく） */}
      <details className="more" open={!!sake}>
        <summary>くわしく（任意・あとで追記もできます）</summary>

        <section className="field">
          <div className="label">種類</div>
          <div className="chips">
            {SAKE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={type === t ? "chip on" : "chip"}
                aria-pressed={type === t}
                onClick={() => setType(type === t ? "" : t)}
              >
                {type === t && <span aria-hidden>✓ </span>}
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="field">
          <label className="label" htmlFor="brewery">
            蔵元
          </label>
          <input
            id="brewery"
            className="input"
            list="brewery-list"
            value={brewery}
            placeholder="例：旭酒造"
            onChange={(e) => setBrewery(e.target.value)}
          />
          <datalist id="brewery-list">
            {breweries.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </section>

        <section className="field">
          <label className="label" htmlFor="pref">
            産地
          </label>
          <select
            id="pref"
            className="input"
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
          >
            <option value="">選ばない</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </section>

        <section className="field">
          <div className="label">お店</div>
          <div className="two-choice" role="group" aria-label="飲んだ店か買った店か">
            <button
              type="button"
              aria-pressed={shopKind === "drank"}
              onClick={() => setShopKind("drank")}
            >
              🍶 飲んだ店
            </button>
            <button
              type="button"
              aria-pressed={shopKind === "bought"}
              onClick={() => setShopKind("bought")}
            >
              🛍 買った店
            </button>
          </div>
          <input
            className="input"
            list="shop-list"
            value={shopName}
            placeholder="お店の名前"
            aria-label="お店の名前"
            onChange={(e) => setShopName(e.target.value)}
          />
          <datalist id="shop-list">
            {shops.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </section>

        <div className="field-row">
          <section className="field">
            <label className="label" htmlFor="price">
              値段（円）
            </label>
            <input
              id="price"
              className="input"
              inputMode="numeric"
              value={price}
              placeholder="例：800"
              onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
            />
          </section>
          <section className="field">
            <label className="label" htmlFor="date">
              飲んだ日
            </label>
            <input
              id="date"
              className="input"
              type="date"
              value={drankOn}
              onChange={(e) => setDrankOn(e.target.value)}
            />
          </section>
        </div>
      </details>

      <div className="save-bar">
        {!canSave && busy === "" && <div className="save-hint">名前と星を入れると保存できます</div>}
        <button type="button" className="btn primary big" disabled={!canSave} onClick={save}>
          {busy === "save" ? "保存中…" : "保存する"}
        </button>
      </div>
    </div>
  );
}
