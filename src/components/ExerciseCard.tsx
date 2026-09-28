import { Check, NotebookPen, Plus, SlidersHorizontal, X } from 'lucide-react'
import type { Exercise, MenuItem, WorkoutSet } from '../db/db'
import { describeSets, fmt, formatLoad, groupSets, type SetGroup } from '../lib/stats'
import { getSettings } from '../lib/settings'
import { displayWeight } from '../lib/units'

interface Props {
  exercise: Exercise
  sets: WorkoutSet[]
  /** 予定 (目標) */
  plan?: MenuItem
  note?: string
  /** 直前と同じ内容 (記録がなければ目標の内容) で1セット記録 */
  onQuickAdd: (v: { weight: number; reps: number }) => void
  onAdd: () => void
  onEdit: (group: SetGroup) => void
  onNote: () => void
  onRemovePlan: () => void
}

/** 記録画面の種目カード */
export default function ExerciseCard({
  exercise,
  sets,
  plan,
  note,
  onQuickAdd,
  onAdd,
  onEdit,
  onNote,
  onRemovePlan,
}: Props) {
  const bodyweight = exercise.kind === 'bodyweight'
  const last = sets.reduce<WorkoutSet | undefined>((a, b) => (!a || b.id > a.id ? b : a), undefined)
  const next = last ?? plan
  const done = sets.length
  const planned = plan && done === 0
  const reached = plan && done >= plan.sets
  const unit = getSettings().unit

  return (
    <section
      className={`rounded-2xl border bg-surface p-4 ${planned ? 'border-dashed border-line' : 'border-line'}`}
    >
      <div className="flex items-start gap-2">
        <h2 className="min-w-0 flex-1 pt-2 font-bold">{exercise.name}</h2>
        <button
          onClick={onNote}
          aria-label={`${exercise.name}のメモ`}
          className={`-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full active:bg-surface-2 ${note ? 'text-accent' : 'text-muted'}`}
        >
          <NotebookPen size={18} />
        </button>
        {planned && (
          <button
            onClick={onRemovePlan}
            aria-label={`${exercise.name}を予定から外す`}
            className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-2"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {note && (
        <button
          onClick={onNote}
          className="mb-1 block w-full rounded-lg bg-surface-2 px-3 py-2 text-left text-sm whitespace-pre-wrap text-ink-2"
        >
          {note}
        </button>
      )}

      {plan && (
        <p
          className={`flex items-center gap-1.5 px-2 py-1 text-sm ${reached ? 'text-accent' : 'text-muted'}`}
        >
          {reached && <Check size={16} strokeWidth={3} />}
          目標 {describeSets(plan, exercise.kind)}
          <span className="ml-auto font-semibold tabular-nums">
            {done}/{plan.sets}
          </span>
        </p>
      )}

      {done > 0 && (
        <ul className="flex flex-col">
          {groupSets(sets).map((g) => (
            <li key={g.ids[0]}>
              <button
                onClick={() => onEdit(g)}
                aria-label={`${describeSets({ weight: g.weight, reps: g.reps, sets: g.count }, exercise.kind)}を編集`}
                className="flex min-h-11 w-full items-baseline gap-1.5 rounded-lg px-2 py-1.5 text-left tabular-nums active:bg-surface-2"
              >
                {bodyweight ? (
                  <span className="text-lg font-semibold">
                    {formatLoad(g.weight, exercise.kind)}
                  </span>
                ) : (
                  <>
                    <span className="text-lg font-semibold">
                      {fmt(displayWeight(g.weight, unit))}
                    </span>
                    <span className="text-sm text-muted">{unit}</span>
                  </>
                )}
                <span className="text-sm text-muted">×</span>
                <span className="text-lg font-semibold">{g.reps}</span>
                <span className="text-sm text-muted">回 ×</span>
                <span className="text-lg font-semibold">{g.count}</span>
                <span className="text-sm text-muted">セット</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex gap-2">
        {next && (
          <button
            onClick={() => onQuickAdd({ weight: next.weight, reps: next.reps })}
            aria-label={`${formatLoad(next.weight, exercise.kind)}×${next.reps}回を${done > 0 ? 'もう' : ''}1セット記録`}
            className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent/15 px-3 font-bold text-ink active:bg-accent/30"
          >
            <Plus size={18} strokeWidth={2.5} className="text-accent" />
            1セット
            <span className="text-sm font-medium text-ink-2 tabular-nums">
              {formatLoad(next.weight, exercise.kind)}×{next.reps}回
            </span>
          </button>
        )}
        <button
          onClick={onAdd}
          aria-label={`${exercise.name}の重量や回数を変えて追加`}
          className="flex min-h-12 shrink-0 items-center gap-1 rounded-xl bg-surface-2 px-3 text-sm font-medium text-ink-2 active:opacity-70"
        >
          <SlidersHorizontal size={16} /> 変更
        </button>
      </div>
    </section>
  )
}
