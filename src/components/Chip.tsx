import type { ReactNode } from 'react'

export default function Chip({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean
  onClick?: () => void
  /** 表示が短い場合の読み上げ用ラベル */
  label?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`min-h-11 min-w-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
        active ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-2 active:opacity-70'
      }`}
    >
      {children}
    </button>
  )
}
