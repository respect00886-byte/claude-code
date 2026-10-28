import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import { go, parseRoute, useHash } from "./lib/route";
import { requestPersistentStorage } from "./lib/storage";
import ListPage, { type ListState } from "./pages/ListPage";
import EditPage from "./pages/EditPage";
import DetailPage from "./pages/DetailPage";
import SettingsPage from "./pages/SettingsPage";

export interface Toast {
  message: string;
  action?: { label: string; run: () => void };
}

export default function App() {
  const route = parseRoute(useHash());
  const sakes = useLiveQuery(() => db.sakes.toArray());
  const customTags = useLiveQuery(() => db.customTags.toArray());
  const [toast, setToast] = useState<Toast | null>(null);
  // 詳細を見て一覧に戻ったとき、検索や絞り込みが消えないようここで持っておく
  const [listState, setListState] = useState<ListState>({
    query: "",
    tags: [],
    sort: "new",
    view: "card",
  });

  useEffect(() => {
    // 記録が消されないよう、最初に開いたときにブラウザへ頼んでおく
    void requestPersistentStorage();
  }, []);

  useEffect(() => {
    if (!toast) return;
    // 「元に戻す」が押せるよう、操作付きのときは長めに出す
    const t = setTimeout(() => setToast(null), toast.action ? 6000 : 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // 画面が変わったらいちばん上から表示する
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.page]);

  if (!sakes || !customTags) return <div className="loading">読み込み中…</div>;
  const tagLabels = customTags.map((t) => t.label);

  let content;
  switch (route.page) {
    case "new":
      content = <EditPage key="new" sakes={sakes} customTags={tagLabels} onToast={setToast} />;
      break;
    case "edit": {
      const sake = sakes.find((s) => s.id === route.id);
      content = sake ? (
        <EditPage
          key={sake.id}
          sake={sake}
          sakes={sakes}
          customTags={tagLabels}
          onToast={setToast}
        />
      ) : (
        <NotFound />
      );
      break;
    }
    case "detail": {
      const sake = sakes.find((s) => s.id === route.id);
      content = sake ? <DetailPage sake={sake} onToast={setToast} /> : <NotFound />;
      break;
    }
    case "settings":
      content = <SettingsPage customTags={customTags} count={sakes.length} onToast={setToast} />;
      break;
    default:
      content = (
        <ListPage sakes={sakes} customTags={tagLabels} state={listState} onChange={setListState} />
      );
  }

  return (
    <>
      {content}
      {toast && (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action!.run();
                setToast(null);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </>
  );
}

function NotFound() {
  return (
    <div className="page">
      <p className="empty">この記録は見つかりませんでした。</p>
      <button type="button" className="btn" onClick={() => go("#/", true)}>
        一覧へ
      </button>
    </div>
  );
}
