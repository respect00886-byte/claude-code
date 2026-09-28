import { useSyncExternalStore } from 'react'

const query =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function subscribe(cb: () => void) {
  query?.addEventListener('change', cb)
  return () => query?.removeEventListener('change', cb)
}

/** グラフ描画用に CSS 変数の色を取得 (ライト/ダーク切替に追従) */
export function useThemeColors() {
  const dark = useSyncExternalStore(subscribe, () => query?.matches ?? false)
  const css = getComputedStyle(document.documentElement)
  const get = (name: string) => css.getPropertyValue(name).trim()
  return {
    dark,
    accent: get('--accent'),
    line: get('--line'),
    muted: get('--muted'),
    surface: get('--surface'),
    ink: get('--ink'),
  }
}
