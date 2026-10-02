import { useState, type ReactNode } from 'react'
import type { ExerciseKind } from '../db/db'
import { describeSets, fmtVolume, fmtWeight } from '../lib/stats'
import { getSettings, type WeightUnit } from '../lib/settings'
import { displayWeight, fromUnit, stepInUnit } from '../lib/units'
import { formatDate } from '../lib/date'
import Stepper from './Stepper'

export interface EntryValues {
  weight: number
  reps: number
  sets: number
}

interface Props {
  initial: EntryValues
  kind: ExerciseKind
  /** 重量の刻み (kg) */
  step: number
  /** 重量を入力する単位 (種目ごとの設定)。未設定なら表示の単位。表示は設定画面の単位 */
  inputUnit?: WeightUnit
  /** 入力単位を切り替えたとき (種目の設定として保存する) */
  onInputUnitChange?: (unit: WeightUnit) => void
  /** 前回の記録 (表示用) */
  previous?: EntryValues & { date: string }
  /** true のときセット数は 1 に固定 (1セットだけ編集する場合) */
  singleSet?: boolean
  /** フォームの上に表示する内容 (セットの選択など) */
  header?: ReactNode
  submitLabel: string
  onSubmit: (v: EntryValues) => Promise<void>
  onDelete?: () => Promise<void>
  /** 初期値から変更されたかを通知する (シートの誤クローズ防止用) */
  onDirtyChange?: (dirty: boolean) => void
}

/** 重量・回数・セット数の入力フォーム */
export default function EntryForm({
  initial,
  kind,
  step,
  inputUnit,
  onInputUnitChange,
  previous,
  singleSet,
  header,
  submitLabel,
  onSubmit,
  onDelete,
  onDirtyChange,
}: Props) {
  const [weight, setWeight] = useState(initial.weight)
  const [reps, setReps] = useState(initial.reps)
  const [sets, setSets] = useState(singleSet ? 1 : initial.sets)
  // 保存中は二重タップで同じセットが重複登録されないようボタンを無効にする
  const [busy, setBusy] = useState(false)

  // 変更をすぐ親に伝える (effect 経由だと、素早い背景タップで入力が消えることがある)
  const change = (next: EntryValues) => {
    setWeight(next.weight)
    setReps(next.reps)
    setSets(next.sets)
    onDirtyChange?.(
      next.weight !== initial.weight || next.reps !== initial.reps || next.sets !== initial.sets,
    )
  }
  const values = { weight, reps, sets }

  const run = async (action: () => Promise<void>) => {
    if (busy) return
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  const bodyweight = kind === 'bodyweight'
  // 表示は設定画面の単位、入力は種目ごとの単位 (lb 表記のマシン用)。保存は常に kg
  const unit = getSettings().unit
  // 種目で決めていなければ表示と同じ単位で入力する
  const [inUnit, setInUnit] = useState<WeightUnit>(inputUnit ?? unit)

  return (
    <div className="flex flex-col gap-5">
      {header}
      {previous && (
        <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink-2">
          前回 {formatDate(previous.date)}：
          <span className="font-semibold text-ink">{describeSets(previous, kind)}</span>
        </p>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-muted">入力単位</span>
          <div
            role="radiogroup"
            aria-label="重量の入力単位"
            className="flex rounded-lg bg-surface-2 p-0.5"
          >
            {(['kg', 'lb'] as const).map((u) => (
              <button
                key={u}
                type="button"
                role="radio"
                aria-checked={inUnit === u}
                onClick={() => {
                  setInUnit(u)
                  onInputUnitChange?.(u)
                }}
                className={`min-h-11 min-w-14 rounded-md px-3 text-sm font-semibold ${
                  inUnit === u ? 'bg-surface text-ink shadow-sm' : 'text-muted'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <Stepper
          key={inUnit}
          label={bodyweight ? '加重（自重のみは0）' : '重量'}
          unit={inUnit}
          value={displayWeight(weight, inUnit)}
          onChange={(v) => change({ ...values, weight: fromUnit(v, inUnit) })}
          step={stepInUnit(step, inUnit)}
          decimals={2}
        />
        {inUnit !== unit && (
          <p aria-live="polite" className="text-center text-sm text-muted tabular-nums">
            ＝ <span className="font-semibold text-ink">{fmtWeight(weight, unit)}</span>
          </p>
        )}
      </div>
      <Stepper
        label="回数"
        unit="回"
        value={reps}
        onChange={(v) => change({ ...values, reps: v })}
        step={1}
        min={1}
        max={999}
      />
      {!singleSet && (
        <Stepper
          label="セット数"
          value={sets}
          onChange={(v) => change({ ...values, sets: v })}
          step={1}
          min={1}
          max={50}
        />
      )}
      <p className="text-center text-sm text-muted">
        {bodyweight ? (
          <>
            合計 <span className="font-semibold text-ink tabular-nums">{reps * sets} 回</span>
          </>
        ) : (
          <>
            合計ボリューム{' '}
            <span className="font-semibold text-ink tabular-nums">
              {fmtVolume(weight * reps * sets, unit)}
            </span>
          </>
        )}
      </p>
      <div className="flex gap-2">
        {onDelete && (
          <button
            onClick={() => run(onDelete)}
            disabled={busy}
            className="rounded-2xl border border-line px-5 py-4 font-semibold text-danger active:bg-surface-2 disabled:opacity-50"
          >
            削除
          </button>
        )}
        <button
          onClick={() => run(() => onSubmit({ weight, reps, sets }))}
          disabled={busy}
          className="flex-1 rounded-2xl bg-accent py-4 text-lg font-bold text-accent-ink active:opacity-80 disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
