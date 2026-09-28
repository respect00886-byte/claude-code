import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil, Trash2 } from 'lucide-react'
import { db, type Routine } from '../db/db'
import { showUndoToast } from '../lib/toast'
import Sheet from './Sheet'

/** 設定画面：ルーティンの名前変更・削除 */
export default function RoutineManager() {
  const data = useLiveQuery(async () => {
    const [routines, exercises] = await Promise.all([
      db.routines.orderBy('name').toArray(),
      db.exercises.toArray(),
    ])
    const names = new Map(exercises.map((e) => [e.id, e.name]))
    return routines.map((r) => ({
      routine: r,
      names: r.items.map((it) => names.get(it.exerciseId) ?? '(削除された種目)'),
    }))
  }, [])
  const [renaming, setRenaming] = useState<Routine>()

  const remove = async (r: Routine) => {
    await db.routines.delete(r.id)
    showUndoToast(`ルーティン「${r.name}」を削除しました`, async () => {
      await db.routines.put(r)
    })
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="font-bold">ルーティン</h2>
      {data?.length === 0 ? (
        <p className="mt-1 text-sm text-muted">
          記録画面の「ルーティンとして保存」で、その日のメニューを保存できます。
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {data?.map(({ routine, names }) => (
            <li key={routine.id} className="flex items-center gap-1 py-1">
              <span className="min-w-0 flex-1">
                <span className="block">{routine.name}</span>
                <span className="block truncate text-xs text-muted">{names.join('・')}</span>
              </span>
              <button
                aria-label={`${routine.name}の名前を変更`}
                onClick={() => setRenaming(routine)}
                className="flex size-11 items-center justify-center rounded-full text-muted active:bg-surface-2"
              >
                <Pencil size={16} />
              </button>
              <button
                aria-label={`${routine.name}を削除`}
                onClick={() => remove(routine)}
                className="flex size-11 items-center justify-center rounded-full text-muted active:bg-surface-2"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!renaming} onClose={() => setRenaming(undefined)} title="名前を変更">
        {renaming && (
          <RenameForm
            key={renaming.id}
            initial={renaming.name}
            onSave={async (name) => {
              await db.routines.update(renaming.id, { name })
              setRenaming(undefined)
            }}
          />
        )}
      </Sheet>
    </section>
  )
}

function RenameForm({ initial, onSave }: { initial: string; onSave: (name: string) => void }) {
  const [name, setName] = useState(initial)
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onSave(name.trim())
      }}
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="ルーティン名"
        className="rounded-xl bg-surface-2 px-3 py-3 outline-none"
      />
      <button
        type="submit"
        disabled={!name.trim()}
        className="rounded-2xl bg-accent py-4 text-lg font-bold text-accent-ink disabled:opacity-40"
      >
        保存
      </button>
    </form>
  )
}
