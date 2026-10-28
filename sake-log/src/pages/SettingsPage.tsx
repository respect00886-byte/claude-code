import { useEffect, useRef, useState } from "react";
import { addCustomTag, db, type CustomTag } from "../db";
import { PRESET_TAGS } from "../data/tags";
import { exportZip, importBackup, parseZip, saveFile } from "../lib/backup";
import { toDateKey } from "../lib/date";
import { makeThumb } from "../lib/image";
import { go } from "../lib/route";
import { formatBytes, getLastBackupAt, setLastBackupAt, usedBytes } from "../lib/storage";
import type { Toast } from "../App";

interface Props {
  customTags: CustomTag[];
  count: number;
  onToast: (t: Toast) => void;
}

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export default function SettingsPage({ customTags, count, onToast }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState("");
  const [usage, setUsage] = useState<number>();
  const [lastBackup, setLastBackup] = useState(getLastBackupAt);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void usedBytes().then(setUsage);
  }, [count]);

  const add = async () => {
    await addCustomTag(text, PRESET_TAGS);
    setText("");
  };

  const exportBackup = async () => {
    setBusy("export");
    try {
      const ok = await saveFile(await exportZip(), `sake-log-${toDateKey()}.zip`);
      if (ok) {
        setLastBackupAt();
        setLastBackup(new Date());
        onToast({ message: "バックアップを書き出しました" });
      }
    } catch {
      onToast({ message: "書き出しに失敗しました" });
    } finally {
      setBusy("");
    }
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy("import");
    try {
      const parsed = parseZip(new Uint8Array(await file.arrayBuffer()));
      const ok = window.confirm(
        `${parsed.sakes.length}件の記録を読み込みます。\n今ある${count}件の記録は消えて、置き換わります。よろしいですか？`,
      );
      if (ok) {
        await importBackup(parsed, makeThumb);
        onToast({ message: "読み込みました" });
      }
    } catch (e) {
      onToast({ message: e instanceof Error ? e.message : "読み込みに失敗しました" });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="page settings-page">
      <header className="topbar">
        <button type="button" className="icon-btn" aria-label="戻る" onClick={() => go("#/")}>
          ‹
        </button>
        <h1>設定</h1>
        <span className="icon-btn-space" />
      </header>

      <section className="panel">
        <h2>マイコメント</h2>
        <p className="note">
          記録画面で使える自分だけのコメントです。消しても、付けた記録からは消えません。
        </p>
        <form
          className="add-row"
          onSubmit={(e) => {
            e.preventDefault();
            void add();
          }}
        >
          <input
            className="input"
            value={text}
            maxLength={20}
            placeholder="例：桃っぽい"
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn" disabled={!text.trim()}>
            追加
          </button>
        </form>
        {customTags.length > 0 && (
          <ul className="my-tags">
            {customTags.map((t) => (
              <li key={t.id}>
                <span>{t.label}</span>
                <button
                  type="button"
                  className="link-btn danger"
                  onClick={() => void db.customTags.delete(t.id)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>バックアップ</h2>
        <p className="note">
          記録はこのスマホの中だけに保存されています。機種変更やもしもの時のために、ときどき書き出しておきましょう（写真も入ります）。
        </p>
        <p className="note strong">
          最後のバックアップ：
          {lastBackup ? lastBackup.toLocaleDateString("ja-JP") : "まだしていません"}
        </p>
        <div className="stack">
          <button
            type="button"
            className="btn primary"
            disabled={busy !== "" || count === 0}
            onClick={exportBackup}
          >
            {busy === "export" ? "書き出し中…" : "バックアップを書き出す"}
          </button>
          <button
            type="button"
            className="btn"
            disabled={busy !== ""}
            onClick={() => fileRef.current?.click()}
          >
            {busy === "import" ? "読み込み中…" : "バックアップから戻す"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".zip,application/zip"
            hidden
            onChange={(e) => {
              void importFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="panel">
        <h2>保存の状態</h2>
        <p className="note">
          記録：{count}件{/* 容量は同じサイトの他アプリ（GymLog など）も含めた合計しか分からない */}
          {usage !== undefined && ` ／ 使用容量（他のアプリ含む）：約${formatBytes(usage)}`}
        </p>
        {isIOS() && !isStandalone() && (
          <p className="note warn">
            iPhone では、しばらく開かないと記録が消えることがあります。Safari
            の共有ボタンから「ホーム画面に追加」して使うと消えにくくなります。
          </p>
        )}
      </section>
    </div>
  );
}
