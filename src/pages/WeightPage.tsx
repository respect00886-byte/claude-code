import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Trash2 } from 'lucide-react'
import { db, deleteBodyWeight, saveBodyWeight, type BodyWeight } from '../db/db'
import { addDays, formatDate } from '../lib/date'
import { useToday } from '../lib/useToday'
import { showUndoToast } from '../lib/toast'
import { fmt, fmtWeight } from '../lib/stats'
import { getSettings } from '../lib/settings'
import { fromUnit, toUnit } from '../lib/units'
import PageHeader from '../components/PageHeader'
import Stepper from '../components/Stepper'
import TrendChart from '../components/TrendChart'
import Chip from '../components/Chip'

const RANGES = [
  { key: '1m', label: '1か月', days: 30 },
  { key: '3m', label: '3か月', days: 90 },
  { key: '1y', label: '1年', days: 365 },
  { key: 'all', label: '全期間', days: Infinity },
] as const

export default function WeightPage() {
  const records = useLiveQuery(() => db.bodyWeights.orderBy('date').toArray(), [])
  if (!records) return <PageHeader title="体重" />
  return <WeightView records={records} />
}

function WeightView({ records }: { records: BodyWeight[] }) {
  // 日付をまたいでも「今日」が自動で切り替わる
  const today = useToday()
  const unit = getSettings().unit
  const todays = records.find((r) => r.date === today)
  const latest = records.at(-1)

  // 日付を選んでいなければ常に「今日」に記録する
  const [pickedDate, setPickedDate] = useState<string>()
  const date = pickedDate ?? today
  const [weight, setWeight] = useState(todays?.weight ?? latest?.weight ?? 60)
  const [bodyFat, setBodyFat] = useState<number | undefined>(todays?.bodyFat ?? latest?.bodyFat)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [range, setRange] = useState<(typeof RANGES)[number]['key']>('1m')

  const days = RANGES.find((r) => r.key === range)!.days
  const from = Number.isFinite(days) ? addDays(today, -days) : ''
  const chartData = records
    .filter((r) => r.date >= from)
    .map((r) => ({ date: r.date, value: Math.round(toUnit(r.weight, unit) * 10) / 10 }))

  const first = chartData[0]?.value
  const last = chartData.at(-1)?.value
  const diff = first !== undefined && last !== undefined ? last - first : undefined

  const save = async () => {
    // 二重タップ防止
    if (busy) return
    setBusy(true)
    try {
      await saveBodyWeight(date, weight, bodyFat)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (r: BodyWeight) => {
    const undo = await deleteBodyWeight(r.id)
    showUndoToast(`${formatDate(r.date)}の体重記録を削除しました`, undo)
  }

  return (
    <>
      <PageHeader title="体重" />
      <main className="flex flex-col gap-4 px-4">
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">記録する</h2>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => {
                const d = e.target.value
                if (!d) return
                setPickedDate(d === today ? undefined : d)
                const rec = records.find((r) => r.date === d)
                if (rec) {
                  setWeight(rec.weight)
                  setBodyFat(rec.bodyFat)
                }
              }}
              className="rounded-lg bg-surface-2 px-2 py-1 text-sm"
            />
          </div>
          <Stepper
            label="体重"
            unit={unit}
            value={Math.round(toUnit(weight, unit) * 10) / 10}
            onChange={(v) => setWeight(fromUnit(v, unit))}
            step={unit === 'lb' ? 0.2 : 0.1}
            decimals={1}
          />
          {bodyFat === undefined ? (
            <button onClick={() => setBodyFat(20)} className="text-sm text-muted underline">
              体脂肪率も記録する
            </button>
          ) : (
            <Stepper
              label="体脂肪率 (任意)"
              unit="%"
              value={bodyFat}
              onChange={setBodyFat}
              step={0.1}
              decimals={1}
              max={80}
            />
          )}
          <button
            onClick={save}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-lg font-bold text-accent-ink active:opacity-80 disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check size={22} /> 保存しました
              </>
            ) : records.some((r) => r.date === date) ? (
              '上書き保存'
            ) : (
              '保存する'
            )}
          </button>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="font-bold">体重の推移</h2>
            {diff !== undefined && chartData.length > 1 && (
              <span className="text-sm text-muted tabular-nums">
                期間内 {diff > 0 ? '+' : ''}
                {fmt(Math.round(toUnit(diff, unit) * 10) / 10)}
                {unit}
              </span>
            )}
          </div>
          <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1">
            {RANGES.map((r) => (
              <Chip key={r.key} active={range === r.key} onClick={() => setRange(r.key)}>
                {r.label}
              </Chip>
            ))}
          </div>
          <TrendChart data={chartData} unit={unit} label="体重" />
        </section>

        {records.length > 0 && (
          <section className="rounded-2xl border border-line bg-surface p-4">
            <h2 className="mb-2 font-bold">最近の記録</h2>
            <ul className="divide-y divide-line">
              {[...records]
                .reverse()
                .slice(0, 14)
                .map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-2 tabular-nums">
                    <span className="w-24 text-sm text-muted">{formatDate(r.date)}</span>
                    <span className="flex-1 font-semibold">
                      {fmtWeight(r.weight)}
                      {r.bodyFat !== undefined && (
                        <span className="ml-2 text-sm font-normal text-muted">
                          {fmt(r.bodyFat)}%
                        </span>
                      )}
                    </span>
                    <button
                      aria-label={`${formatDate(r.date)}の記録を削除`}
                      onClick={() => remove(r)}
                      className="-mr-2 flex size-11 items-center justify-center rounded-full text-muted active:bg-surface-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        )}
      </main>
    </>
  )
}
