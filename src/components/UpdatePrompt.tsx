import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'

/**
 * 新しいバージョンが配信されたときに「更新」ボタンを出す。
 * 自動で再読み込みすると入力中の内容が消えてしまうため、更新のタイミングは利用者に任せる。
 */
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true })

  if (!needRefresh) return null
  return (
    <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.5rem)] z-50 flex justify-center px-4">
      <div className="animate-fade flex w-full max-w-md items-center gap-2 rounded-2xl border border-line bg-surface-2 py-2 pr-2 pl-4 shadow-xl shadow-black/20">
        <RefreshCw size={16} className="shrink-0 text-accent" />
        <span className="min-w-0 flex-1 text-sm font-medium">新しいバージョンがあります</span>
        <button
          onClick={() => setNeedRefresh(false)}
          className="min-h-11 rounded-xl px-3 text-sm text-muted active:bg-line"
        >
          あとで
        </button>
        <button
          onClick={() => updateServiceWorker(true)}
          className="min-h-11 rounded-xl bg-accent px-4 text-sm font-bold text-accent-ink active:opacity-80"
        >
          更新
        </button>
      </div>
    </div>
  )
}
