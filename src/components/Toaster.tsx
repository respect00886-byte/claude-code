import { dismissToast, useToast } from '../lib/toast'

/** 画面下部に表示する通知。「元に戻す」などのボタンを1つ持てる */
export default function Toaster() {
  const toast = useToast()
  if (!toast) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(10rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4"
    >
      <div
        key={toast.id}
        className="animate-fade pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-line bg-surface-2 py-2 pr-2 pl-4 text-ink shadow-xl shadow-black/20"
      >
        <span className="min-w-0 flex-1 text-sm font-medium">{toast.message}</span>
        {toast.action && (
          <button
            onClick={async () => {
              const { onClick } = toast.action!
              dismissToast(toast.id)
              await onClick()
            }}
            className="min-h-11 shrink-0 rounded-xl px-3 text-sm font-bold text-accent active:bg-line"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  )
}
