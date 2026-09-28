import { useSyncExternalStore } from 'react'
import { toDateKey } from './date'

function msUntilMidnight() {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return next.getTime() - now.getTime() + 1000
}

function subscribe(cb: () => void) {
  let timer: ReturnType<typeof setTimeout>
  const schedule = () => {
    timer = setTimeout(() => {
      cb()
      schedule()
    }, msUntilMidnight())
  }
  schedule()
  // スリープ復帰時はタイマーが遅れることがあるので、表示のたびに確認する
  const onVisible = () => document.visibilityState === 'visible' && cb()
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('focus', cb)
  return () => {
    clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('focus', cb)
  }
}

/** 今日の日付 (YYYY-MM-DD)。アプリを開いたまま日付が変わっても追従する */
export function useToday(): string {
  return useSyncExternalStore(subscribe, () => toDateKey())
}
