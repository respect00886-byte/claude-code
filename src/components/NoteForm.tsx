import { useState } from 'react'

interface Props {
  initial: string
  placeholder: string
  /** 前回のメモなど、参考として表示する文 */
  hint?: string
  onSave: (text: string) => Promise<void>
  onDirtyChange?: (dirty: boolean) => void
}

/** メモの入力。空にして保存すると削除 */
export default function NoteForm({ initial, placeholder, hint, onSave, onDirtyChange }: Props) {
  const [text, setText] = useState(initial)
  const [busy, setBusy] = useState(false)
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault()
        if (busy) return
        setBusy(true)
        try {
          await onSave(text)
        } finally {
          setBusy(false)
        }
      }}
    >
      {hint && <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink-2">{hint}</p>}
      <textarea
        autoFocus
        rows={4}
        maxLength={1000}
        value={text}
        aria-label="メモ"
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value)
          onDirtyChange?.(e.target.value !== initial)
        }}
        className="resize-none rounded-xl bg-surface-2 px-3 py-3 outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-2xl bg-accent py-4 text-lg font-bold text-accent-ink active:opacity-80 disabled:opacity-50"
      >
        {initial && !text.trim() ? 'メモを削除' : '保存'}
      </button>
    </form>
  )
}
