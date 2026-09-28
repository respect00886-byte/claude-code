import type { ReactNode } from 'react'

export default function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-2 active:opacity-70'
      }`}
    >
      {children}
    </button>
  )
}
