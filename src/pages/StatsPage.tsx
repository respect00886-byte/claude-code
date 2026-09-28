import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChartLine, Trophy } from 'lucide-react'
import { db } from '../db/db'
import { formatDate } from '../lib/date'
import { dailyStats, fmt, personalBest } from '../lib/stats'
import PageHeader from '../components/PageHeader'
import TrendChart from '../components/TrendChart'
import Chip from '../components/Chip'

const METRICS = [
  { key: 'maxWeight', label: '最大重量', unit: 'kg' },
  { key: 'est1RM', label: '推定1RM', unit: 'kg' },
  { key: 'volume', label: 'ボリューム', unit: 'kg' },
] as const

export default function StatsPage() {
  const [selected, setSelected] = useState<number | undefined>()
  const [metric, setMetric] = useState<(typeof METRICS)[number]['key']>('maxWeight')

  // 記録のある種目を記録回数の多い順に
  const options = useLiveQuery(async () => {
    const [sets, exercises] = await Promise.all([db.workoutSets.toArray(), db.exercises.toArray()])
    const counts = new Map<number, number>()
    for (const s of sets) counts.set(s.exerciseId, (counts.get(s.exerciseId) ?? 0) + 1)
    return exercises
      .filter((e) => counts.has(e.id))
      .sort((a, b) => counts.get(b.id)! - counts.get(a.id)!)
  }, [])

  const exerciseId = selected ?? options?.[0]?.id
  const sets = useLiveQuery(
    () => (exerciseId ? db.workoutSets.where('exerciseId').equals(exerciseId).toArray() : []),
    [exerciseId],
  )

  const stats = sets ? dailyStats(sets) : []
  const pb = sets ? personalBest(sets) : undefined
  const m = METRICS.find((x) => x.key === metric)!

  return (
    <>
      <PageHeader title="グラフ" />
      <main className="flex flex-col gap-4 px-4">
        {options?.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted">
            <ChartLine size={48} strokeWidth={1.5} />
            <p>筋トレを記録するとグラフが表示されます</p>
          </div>
        ) : (
          <>
            <select
              aria-label="種目"
              value={exerciseId ?? ''}
              onChange={(e) => setSelected(Number(e.target.value))}
              className="w-full rounded-xl border border-line bg-surface px-3 py-3 font-semibold"
            >
              {options?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>

            {pb && (
              <div className="grid grid-cols-3 gap-2">
                <Tile
                  label="最大重量"
                  value={`${fmt(pb.maxWeight)}kg`}
                  sub={formatDate(pb.maxWeightDate)}
                />
                <Tile
                  label="推定1RM"
                  value={`${fmt(pb.best1RM)}kg`}
                  sub={formatDate(pb.best1RMDate)}
                />
                <Tile
                  label="トレーニング日数"
                  value={`${stats.length}日`}
                  sub={`${sets?.length ?? 0}セット`}
                />
              </div>
            )}

            <section className="rounded-2xl border border-line bg-surface p-4">
              <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1">
                {METRICS.map((x) => (
                  <Chip key={x.key} active={metric === x.key} onClick={() => setMetric(x.key)}>
                    {x.label}
                  </Chip>
                ))}
              </div>
              <TrendChart
                data={stats.map((s) => ({ date: s.date, value: s[metric] }))}
                unit={m.unit}
                label={m.label}
              />
            </section>
          </>
        )}
      </main>
    </>
  )
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <div className="flex items-center gap-1 text-[11px] text-muted">
        {label !== 'トレーニング日数' && <Trophy size={12} />}
        {label}
      </div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted">{sub}</div>
    </div>
  )
}
