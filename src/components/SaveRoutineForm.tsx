import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type ExerciseKind, type MenuItem } from '../db/db'
import { describeSets } from '../lib/stats'

interface Props {
  items: (MenuItem & { name: string; kind: ExerciseKind })[]
  defaultName: string
  onSave: (name: string) => Promise<void>
}

/** その日のメニューに名前を付けてルーティンとして保存する */
export default function SaveRoutineForm({ items, defaultName, onSave }: Props) {
  const [name, setName] = useState(defaultName)
  const [busy, setBusy] = useState(false)
  const names = useLiveQuery(async () => (await db.routines.toArray()).map((r) => r.name), [])
  const overwrite = names?.includes(name.trim())

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!name.trim() || busy) return
        setBusy(true)
        try {
          await onSave(name.trim())
        } finally {
          setBusy(false)
        }
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="ルーティン名"
        placeholder="ルーティン名（例：胸の日）"
        className="rounded-xl bg-surface-2 px-3 py-3 outline-none placeholder:text-muted"
      />
      {overwrite && <p className="text-sm text-danger">同じ名前のルーティンは上書きされます</p>}
      <ul className="flex flex-col gap-1 rounded-xl bg-surface-2 px-3 py-2 text-sm">
        {items.map((it) => (
          <li key={it.exerciseId} className="flex justify-between gap-2">
            <span className="font-medium">{it.name}</span>
            <span className="text-muted tabular-nums">{describeSets(it, it.kind)}</span>
          </li>
        ))}
      </ul>
      <button
        type="submit"
        disabled={!name.trim() || busy}
        className="rounded-2xl bg-accent py-4 text-lg font-bold text-accent-ink active:opacity-80 disabled:opacity-50"
      >
        {overwrite ? '上書き保存' : '保存'}
      </button>
    </form>
  )
}
