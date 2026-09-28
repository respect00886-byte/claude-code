import { useEffect, type ReactNode } from 'react'
import { ChevronLeft, X } from 'lucide-react'

interface Props {
  open: boolean
  title: ReactNode
  onClose: () => void
  /** false のとき、背景タップや Esc では閉じない (入力途中の誤操作防止)。× ボタンでは閉じる */
  dismissible?: boolean
  /** 指定すると見出しの左に「戻る」ボタンを出す */
  onBack?: () => void
  children: ReactNode
}

/** 画面下からせり上がるボトムシート */
export default function Sheet({
  open,
  title,
  onClose,
  dismissible = true,
  onBack,
  children,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismissible && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, dismissible])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div
        className="animate-fade absolute inset-0 bg-black/50"
        onClick={() => dismissible && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="animate-sheet relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl"
      >
        <div className="flex items-center gap-1 px-5 pt-3 pb-2">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="種目を選び直す"
              className="-ml-3 flex size-11 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-2"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h2 className="min-w-0 flex-1 truncate text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="-mr-3 flex size-11 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-2"
          >
            <X size={22} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}
