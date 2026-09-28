import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChartLine, Trophy } from 'lucide-react'
import { CATEGORIES, db, type Category } from '../db/db'
import { formatDate } from '../lib/date'
import { categoryDailyStats, dailyStats, fmtVolume, fmtWeight, personalBest } from '../lib/stats'
import { getSettings } from '../lib/settings'
import { displayWeight, toUnit } from '../lib/units'
import PageHeader from '../components/PageHeader'
import TrendChart from '../components/TrendChart'
import Chip from '../components/Chip'

type MetricKey = 'maxWeight' | 'est1RM' | 'maxReps' | 'totalReps'
interface Metric {
  key: MetricKey
  label: string
  /** 'weight' は設定中の単位 (kg / lb) で表示 */
  unit: 'weight' | '回'
}

// ボリュームは部位別の画面で見る
const WEIGHTED_METRICS: Metric[] = [
  { key: 'maxWeight', label: '最大重量', unit: 'weight' },
  { key: 'est1RM', label: '推定1RM', unit: 'weight' },
]

/** 自重種目は回数が主な指標 */
const BODYWEIGHT_METRICS: Metric[] = [
  { key: 'maxReps', label: '最大回数', unit: '回' },
  { key: 'totalReps', label: '合計回数', unit: '回' },
  { key: 'maxWeight', label: '最大加重', unit: 'weight' },
]

type View = 'exercise' | 'category'

export default function StatsPage() {
  const [view, setView] = useState<View>('exercise')
  return (
    <>
      <PageHeader title="グラフ" />
      <main className="flex flex-col gap-4 px-4">
        <div
          role="tablist"
          aria-label="表示の切り替え"
          className="grid grid-cols-2 rounded-xl bg-surface-2 p-1"
        >
          {(
            [
              ['exercise', '種目別'],
              ['category', '部位別'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={view === key}
              onClick={() => setView(key)}
              className={`min-h-11 rounded-lg text-sm font-semibold transition-colors ${
                view === key ? 'bg-surface text-ink shadow-sm' : 'text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {view === 'exercise' ? <ExerciseStats /> : <CategoryStats />}
      </main>
    </>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center text-muted">
      <ChartLine size={48} strokeWidth={1.5} />
      <p>筋トレを記録するとグラフが表示されます</p>
    </div>
  )
}

/** 種目ごとの最大重量・推定1RM (自重種目は回数) */
function ExerciseStats() {
  const [selected, setSelected] = useState<number | undefined>()
  const [metric, setMetric] = useState<MetricKey>('maxWeight')

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
  const exercise = options?.find((e) => e.id === exerciseId)
  const bodyweight = exercise?.kind === 'bodyweight'
  const metrics = bodyweight ? BODYWEIGHT_METRICS : WEIGHTED_METRICS
  const sets = useLiveQuery(
    () => (exerciseId ? db.workoutSets.where('exerciseId').equals(exerciseId).toArray() : []),
    [exerciseId],
  )

  const stats = sets ? dailyStats(sets) : []
  const pb = sets ? personalBest(sets) : undefined
  // 種目を切り替えて選んでいた指標がなくなったら先頭の指標を使う
  const m = metrics.find((x) => x.key === metric) ?? metrics[0]

  return (
    <>
      {options?.length === 0 ? (
        <EmptyState />
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
              {bodyweight ? (
                <>
                  <Tile
                    label="最大回数"
                    value={`${pb.maxReps}回`}
                    sub={formatDate(pb.maxRepsDate)}
                  />
                  <Tile
                    label="最大加重"
                    value={pb.maxWeight > 0 ? `+${fmtWeight(pb.maxWeight)}` : '自重のみ'}
                    sub={pb.maxWeight > 0 ? formatDate(pb.maxWeightDate) : '—'}
                  />
                </>
              ) : (
                <>
                  <Tile
                    label="最大重量"
                    value={fmtWeight(pb.maxWeight)}
                    sub={formatDate(pb.maxWeightDate)}
                  />
                  <Tile
                    label="推定1RM"
                    value={fmtWeight(pb.best1RM)}
                    sub={formatDate(pb.best1RMDate)}
                  />
                </>
              )}
              <Tile
                label="記録日数"
                value={`${stats.length}日`}
                sub={`${sets?.length ?? 0}セット`}
              />
            </div>
          )}

          <section className="rounded-2xl border border-line bg-surface p-4">
            <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1">
              {metrics.map((x) => (
                <Chip key={x.key} active={m.key === x.key} onClick={() => setMetric(x.key)}>
                  {x.label}
                </Chip>
              ))}
            </div>
            <TrendChart
              data={stats.map((s) => ({
                date: s.date,
                value: m.unit === 'weight' ? displayWeight(s[m.key]) : s[m.key],
              }))}
              unit={m.unit === 'weight' ? getSettings().unit : m.unit}
              label={m.label}
            />
          </section>
        </>
      )}
    </>
  )
}

/** 部位ごとのボリューム (重量×回数の合計) とセット数の推移 */
function CategoryStats() {
  const [selected, setSelected] = useState<Category>()
  const [metric, setMetric] = useState<'volume' | 'sets'>('volume')

  const data = useLiveQuery(async () => {
    const [sets, exercises] = await Promise.all([db.workoutSets.toArray(), db.exercises.toArray()])
    return { sets, exercises: new Map(exercises.map((e) => [e.id, e])) }
  }, [])
  if (!data) return null
  if (data.sets.length === 0) return <EmptyState />

  // 記録のある部位だけを選べるようにする
  const used = new Set(data.sets.map((s) => data.exercises.get(s.exerciseId)?.category ?? 'その他'))
  const categories = CATEGORIES.filter((c) => used.has(c))
  const category = selected && used.has(selected) ? selected : categories[0]
  const stats = categoryDailyStats(data.sets, data.exercises, category)
  const best = stats.reduce<(typeof stats)[number] | undefined>(
    (a, b) => (!a || b.volume > a.volume ? b : a),
    undefined,
  )
  const totalSets = stats.reduce((n, s) => n + s.sets, 0)
  const unit = getSettings().unit

  return (
    <>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {categories.map((c) => (
          <Chip key={c} active={c === category} onClick={() => setSelected(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Tile
          label="ベスト"
          value={best && best.volume > 0 ? fmtVolume(best.volume) : '—'}
          sub={best && best.volume > 0 ? formatDate(best.date) : '自重のみ'}
        />
        <Tile label="記録日数" value={`${stats.length}日`} sub={`${totalSets}セット`} />
        <Tile
          label="1日平均"
          value={`${Math.round((totalSets / Math.max(stats.length, 1)) * 10) / 10}セット`}
          sub={category}
        />
      </div>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1">
          <Chip active={metric === 'volume'} onClick={() => setMetric('volume')}>
            ボリューム
          </Chip>
          <Chip active={metric === 'sets'} onClick={() => setMetric('sets')}>
            セット数
          </Chip>
        </div>
        <TrendChart
          data={stats.map((s) => ({
            date: s.date,
            value: metric === 'volume' ? Math.round(toUnit(s.volume)) : s.sets,
          }))}
          unit={metric === 'volume' ? unit : 'セット'}
          label={`${category}の${metric === 'volume' ? 'ボリューム' : 'セット数'}`}
        />
        {metric === 'volume' && (
          <p className="mt-2 text-xs text-muted">
            ボリューム＝重量×回数の合計（自重のみのセットは0として計算）
          </p>
        )}
      </section>
    </>
  )
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3">
      <div className="flex items-center gap-1 text-[11px] text-muted">
        {label !== '記録日数' && label !== '1日平均' && <Trophy size={12} />}
        {label}
      </div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted">{sub}</div>
    </div>
  )
}
