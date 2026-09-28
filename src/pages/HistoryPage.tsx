import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'
import { CalendarDays, ChevronRight, NotebookPen } from 'lucide-react'
import { DAY_NOTE, db, type WorkoutSet } from '../db/db'
import { formatDate } from '../lib/date'
import { byInputOrder, fmtVolume, fmtWeight, formatLoad, groupSets, volume } from '../lib/stats'
import PageHeader from '../components/PageHeader'

export default function HistoryPage() {
  const days = useLiveQuery(async () => {
    const [sets, exercises, weights, notes] = await Promise.all([
      db.workoutSets.toArray(),
      db.exercises.toArray(),
      db.bodyWeights.toArray(),
      db.notes.toArray(),
    ])
    const byId = new Map(exercises.map((e) => [e.id, e]))
    const weightByDate = new Map(weights.map((w) => [w.date, w.weight]))
    const noteOf = new Map(notes.map((n) => [`${n.date}/${n.exerciseId}`, n.text]))
    // 日付ごとにまとめる (1回の走査で済ませる)
    const byDate = new Map<string, WorkoutSet[]>()
    for (const s of sets) {
      const list = byDate.get(s.date)
      if (list) list.push(s)
      else byDate.set(s.date, [s])
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, daySets]) => {
        daySets.sort(byInputOrder)
        const byExercise = new Map<number, WorkoutSet[]>()
        for (const s of daySets) {
          const list = byExercise.get(s.exerciseId)
          if (list) list.push(s)
          else byExercise.set(s.exerciseId, [s])
        }
        return {
          date,
          bodyWeight: weightByDate.get(date),
          volume: volume(daySets),
          dayNote: noteOf.get(`${date}/${DAY_NOTE}`),
          items: [...byExercise.entries()].map(([id, list]) => ({
            id,
            name: byId.get(id)?.name ?? '(削除された種目)',
            note: noteOf.get(`${date}/${id}`),
            summary: groupSets(list)
              .map((g) => `${formatLoad(g.weight, byId.get(id)?.kind)}×${g.reps}×${g.count}`)
              .join(', '),
          })),
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
                {d.bodyWeight !== undefined && <span>体重 {fmtWeight(d.bodyWeight)}</span>}
                <span>{fmtVolume(d.volume)}</span>
                <ChevronRight size={16} />
              </span>
            </div>
            {d.dayNote && (
              <p className="mb-2 flex items-start gap-1.5 text-sm text-ink-2">
                <NotebookPen size={14} className="mt-0.5 shrink-0 text-accent" />
                <span className="line-clamp-2">{d.dayNote}</span>
              </p>
            )}
            <ul className="flex flex-col gap-1 text-sm">
              {d.items.map((it) => (
                <li key={it.id}>
                  <div className="flex gap-2">
                    <span className="shrink-0 font-medium">{it.name}</span>
                    <span className="truncate text-muted tabular-nums">{it.summary}</span>
                  </div>
                  {it.note && <p className="truncate pl-3 text-xs text-muted">📝 {it.note}</p>}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </main>
    </>
  )
}
