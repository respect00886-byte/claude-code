import { useState } from 'react'
import { fmt } from '../lib/stats'
import { formatDate } from '../lib/date'
import Stepper from './Stepper'

export interface EntryValues {
  weight: number
  reps: number
  sets: number
}

interface Props {
  initial: EntryValues
  /** 前回の記録 (表示用) */
  previous?: EntryValues & { date: string }
  submitLabel: string
  onSubmit: (v: EntryValues) => void
  onDelete?: () => void
}

/** 重量・回数・セット数の入力フォーム */
export default function EntryForm({ initial, previous, submitLabel, onSubmit, onDelete }: Props) {
  const [weight, setWeight] = useState(initial.weight)
  const [reps, setReps] = useState(initial.reps)
  const [sets, setSets] = useState(initial.sets)

  return (
    <div className="flex flex-col gap-5">
      {previous && (
        <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink-2">
          前回 {formatDate(previous.date)}：
          <span className="font-semibold text-ink">
            {fmt(previous.weight)}kg × {previous.reps}回 × {previous.sets}セット
          </span>
        </p>
      )}
      <Stepper label="重量" unit="kg" value={weight} onChange={setWeight} step={2.5} decimals={2} />
      <Stepper label="回数" unit="回" value={reps} onChange={setReps} step={1} min={1} max={999} />
      <Stepper label="セット数" value={sets} onChange={setSets} step={1} min={1} max={50} />
      <p className="text-center text-sm text-muted">
        合計ボリューム{' '}
        <span className="font-semibold text-ink tabular-nums">{fmt(weight * reps * sets)} kg</span>
      </p>
      <div className="flex gap-2">
        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded-2xl border border-line px-5 py-4 font-semibold text-danger active:bg-surface-2"
          >
            削除
          </button>
        )}
        <button
          onClick={() => onSubmit({ weight, reps, sets })}
          className="flex-1 rounded-2xl bg-accent py-4 text-lg font-bold text-accent-ink active:opacity-80"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
