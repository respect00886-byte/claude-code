import type { ReactNode } from 'react'

export default function PageHeader({ title, right }: { title: ReactNode; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-bg/90 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 backdrop-blur-lg">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {right}
    </header>
  )
}
