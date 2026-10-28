import { useSyncExternalStore } from "react";

// スマホの「戻る」で前の画面に戻れるよう、画面の切り替えは URL の # で行う
export type Route =
  | { page: "list" }
  | { page: "new" }
  | { page: "detail"; id: number }
  | { page: "edit"; id: number }
  | { page: "settings" };

export function parseRoute(hash: string): Route {
  const m = hash.match(/^#\/(sake|edit)\/(\d+)$/);
  if (m) return { page: m[1] === "sake" ? "detail" : "edit", id: Number(m[2]) };
  if (hash === "#/new") return { page: "new" };
  if (hash === "#/settings") return { page: "settings" };
  return { page: "list" };
}

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash);
}

/** replace: 履歴を残さない（保存後に「戻る」で入力画面に戻らないように） */
export function go(hash: string, replace = false) {
  if (replace) window.location.replace(hash);
  else window.location.hash = hash;
}
