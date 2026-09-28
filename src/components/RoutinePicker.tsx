import { useLiveQuery } from 'dexie-react-hooks'
import { ListChecks } from 'lucide-react'
import { db, type Routine } from '../db/db'

/** 保存済みのルーティンを選ぶ */
export default function RoutinePicker({ onSelect }: { onSelect: (r: Routine) => void }) {
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

  if (data?.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        まだルーティンがありません。記録した日の「ルーティンとして保存」から作れます。
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {data?.map(({ routine, names }) => (
        <li key={routine.id}>
          <button
            onClick={() => onSelect(routine)}
            className="flex w-full items-start gap-3 rounded-xl border border-line bg-surface px-3 py-3 text-left active:bg-surface-2"
          >
            <ListChecks size={20} className="mt-0.5 shrink-0 text-accent" />
            <span className="min-w-0">
              <span className="block font-semibold">{routine.name}</span>
              <span className="block text-xs text-muted">{names.join('・')}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
