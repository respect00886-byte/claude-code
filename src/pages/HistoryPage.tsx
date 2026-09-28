import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { db } from '../db/db'
import { formatDate } from '../lib/date'
import { byInputOrder, fmt, formatLoad, groupSets, volume } from '../lib/stats'
import PageHeader from '../components/PageHeader'

export default function HistoryPage() {
  const days = useLiveQuery(async () => {
    const [sets, exercises, weights] = await Promise.all([
      db.workoutSets.toArray(),
      db.exercises.toArray(),
      db.bodyWeights.toArray(),
    ])
    const byId = new Map(exercises.map((e) => [e.id, e]))
    const weightByDate = new Map(weights.map((w) => [w.date, w.weight]))
    const dates = [...new Set(sets.map((s) => s.date))].sort().reverse()
    return dates.map((date) => {
      const daySets = sets.filter((s) => s.date === date).sort(byInputOrder)
      const exIds = [...new Set(daySets.map((s) => s.exerciseId))]
      return {
        date,
        bodyWeight: weightByDate.get(date),
        volume: volume(daySets),
        items: exIds.map((id) => {
          const list = daySets.filter((s) => s.exerciseId === id)
          return {
            id,
            name: byId.get(id)?.name ?? '(削除された種目)',
            summary: groupSets(list)
              .map((g) => `${formatLoad(g.weight, byId.get(id)?.kind)}×${g.reps}×${g.count}`)
              .join(', '),
          }
        }),
      }
    })
  }, [])

  return (
    <>
      <PageHeader title="履歴" />
      <main className="flex flex-col gap-3 px-4">
        {days?.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted">
            <CalendarDays size={48} strokeWidth={1.5} />
            <p>まだ記録がありません</p>
          </div>
        )}
        {days?.map((d) => (
          <Link
            key={d.date}
            to={`/?date=${d.date}`}
            className="block rounded-2xl border border-line bg-surface p-4 active:bg-surface-2"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="font-bold">{formatDate(d.date)}</h2>
              <span className="flex items-center gap-2 text-xs text-muted tabular-nums">
                {d.bodyWeight !== undefined && <span>体重 {fmt(d.bodyWeight)}kg</span>}
                <span>{fmt(d.volume)}kg</span>
                <ChevronRight size={16} />
              </span>
            </div>
            <ul className="flex flex-col gap-1 text-sm">
              {d.items.map((it) => (
                <li key={it.id} className="flex gap-2">
                  <span className="shrink-0 font-medium">{it.name}</span>
                  <span className="truncate text-muted tabular-nums">{it.summary}</span>
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </main>
    </>
  )
}
