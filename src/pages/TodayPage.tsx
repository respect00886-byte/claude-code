import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, Dumbbell, Plus } from 'lucide-react'
import {
  addSets,
  db,
  deleteSets,
  lastSetOf,
  updateSetGroup,
  type Exercise,
  type WorkoutSet,
} from '../db/db'
import { addDays, formatDate, isDateKey } from '../lib/date'
import { useToday } from '../lib/useToday'
import { showUndoToast } from '../lib/toast'
import { fmt, groupSets, volume, type SetGroup } from '../lib/stats'
import PageHeader from '../components/PageHeader'
import Sheet from '../components/Sheet'
import ExercisePicker from '../components/ExercisePicker'
import EntryForm, { type EntryValues } from '../components/EntryForm'

type SheetState =
  | { kind: 'closed' }
  | { kind: 'pick' }
  | {
      kind: 'add'
      exercise: Exercise
      initial: EntryValues
      previous?: EntryValues & { date: string }
    }
  | { kind: 'edit'; exercise: Exercise; group: SetGroup }

const DEFAULT_ENTRY: EntryValues = { weight: 20, reps: 10, sets: 3 }

const describe = (v: EntryValues) => `${fmt(v.weight)}kg×${v.reps}回×${v.sets}セット`

export default function TodayPage() {
  const [params, setParams] = useSearchParams()
  // 日付をまたいでも「今日」が自動で切り替わる
  const today = useToday()
  const param = params.get('date')
  // 不正な日付や未来の日付は今日として扱う
  const date = param && isDateKey(param) && param <= today ? param : today
  const setDate = (d: string) => setParams(d === today ? {} : { date: d }, { replace: true })

  const [sheet, setSheet] = useState<SheetState>({ kind: 'closed' })
  const [dirty, setDirty] = useState(false)
  const close = useCallback(() => {
    setSheet({ kind: 'closed' })
    setDirty(false)
  }, [])

  const data = useLiveQuery(async () => {
    const sets = await db.workoutSets.where('date').equals(date).sortBy('createdAt')
    const exIds = [...new Set(sets.map((s) => s.exerciseId))]
    const exercises = await db.exercises.bulkGet(exIds)
    return exIds.map((id, i) => ({
      exercise: exercises[i] ?? ({ id, name: '(削除された種目)', category: 'その他' } as Exercise),
      sets: sets.filter((s) => s.exerciseId === id),
    }))
  }, [date])

  const openAdd = async (exercise: Exercise, todaysSets?: WorkoutSet[]) => {
    const last = await lastSetOf(exercise.id)
    const lastToday = todaysSets?.reduce<WorkoutSet | undefined>(
      (a, b) => (!a || b.id > a.id ? b : a),
      undefined,
    )
    const initial = lastToday
      ? { weight: lastToday.weight, reps: lastToday.reps, sets: 1 }
      : last
        ? { weight: last.weight, reps: last.reps, sets: last.sets }
        : DEFAULT_ENTRY
    setSheet({ kind: 'add', exercise, initial, previous: last })
  }

  const handleAdd = async (exercise: Exercise, v: EntryValues) => {
    const ids = await addSets(date, exercise.id, v.weight, v.reps, v.sets)
    close()
    showUndoToast(`${exercise.name} ${describe(v)}を記録しました`, async () => {
      await db.workoutSets.bulkDelete(ids)
    })
  }

  const handleEdit = async (exercise: Exercise, group: SetGroup, v: EntryValues) => {
    const undo = await updateSetGroup(group.ids, v)
    close()
    showUndoToast(`${exercise.name}を${describe(v)}に変更しました`, undo)
  }

  const handleDelete = async (exercise: Exercise, group: SetGroup) => {
    const undo = await deleteSets(group.ids)
    close()
    showUndoToast(
      `${exercise.name} ${describe({ weight: group.weight, reps: group.reps, sets: group.count })}を削除しました`,
      undo,
    )
  }

  const totalVolume = data ? volume(data.flatMap((d) => d.sets)) : 0
  const totalSets = data?.reduce((n, d) => n + d.sets.length, 0) ?? 0

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-1">
            <button
              aria-label="前の日"
              onClick={() => setDate(addDays(date, -1))}
              className="-ml-2 rounded-full p-1.5 text-muted active:bg-surface-2"
            >
              <ChevronLeft size={22} />
            </button>
            <label className="relative cursor-pointer">
              {date === today ? '今日' : formatDate(date)}
              <input
                type="date"
                aria-label="日付を選択"
                value={date}
                max={today}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="absolute inset-0 opacity-0"
              />
            </label>
            <button
              aria-label="次の日"
              disabled={date >= today}
              onClick={() => setDate(addDays(date, 1))}
              className="rounded-full p-1.5 text-muted active:bg-surface-2 disabled:opacity-30"
            >
              <ChevronRight size={22} />
            </button>
          </span>
        }
        right={
          totalSets > 0 && (
            <span className="text-right text-xs leading-tight text-muted">
              {totalSets}セット
              <br />
              <span className="tabular-nums">{fmt(totalVolume)}kg</span>
            </span>
          )
        }
      />

      <main className="flex flex-col gap-3 px-4">
        {data?.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted">
            <Dumbbell size={48} strokeWidth={1.5} />
            <p>
              {date === today ? '今日' : formatDate(date)}のトレーニングはまだありません
              <br />
              下のボタンから種目を追加しましょう
            </p>
          </div>
        )}

        {data?.map(({ exercise, sets }) => (
          <section key={exercise.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 className="font-bold">{exercise.name}</h2>
              <span className="text-xs text-muted tabular-nums">{fmt(volume(sets))}kg</span>
            </div>
            <ul className="flex flex-col gap-1">
              {groupSets(sets).map((g) => (
                <li key={g.ids[0]}>
                  <button
                    onClick={() => setSheet({ kind: 'edit', exercise, group: g })}
                    aria-label={`${fmt(g.weight)}kg × ${g.reps}回 × ${g.count}セットを編集`}
                    className="flex w-full items-baseline gap-1.5 rounded-lg px-2 py-1.5 text-left tabular-nums active:bg-surface-2"
                  >
                    <span className="text-lg font-semibold">{fmt(g.weight)}</span>
                    <span className="text-sm text-muted">kg ×</span>
                    <span className="text-lg font-semibold">{g.reps}</span>
                    <span className="text-sm text-muted">回 ×</span>
                    <span className="text-lg font-semibold">{g.count}</span>
                    <span className="text-sm text-muted">セット</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => openAdd(exercise, sets)}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl bg-surface-2 py-2 text-sm font-medium text-ink-2 active:opacity-70"
            >
              <Plus size={16} /> セットを追加
            </button>
          </section>
        ))}
      </main>

      <button
        onClick={() => setSheet({ kind: 'pick' })}
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 flex items-center gap-2 rounded-full bg-accent px-6 py-4 font-bold text-accent-ink shadow-lg shadow-black/20 active:scale-95 transition-transform min-[32rem]:right-[calc(50%-15rem)]"
      >
        <Plus size={22} strokeWidth={2.5} /> 種目を追加
      </button>

      <Sheet
        open={sheet.kind !== 'closed'}
        onClose={close}
        dismissible={!dirty}
        title={
          sheet.kind === 'pick'
            ? '種目を選択'
            : sheet.kind === 'add' || sheet.kind === 'edit'
              ? sheet.exercise.name
              : ''
        }
      >
        {sheet.kind === 'pick' && <ExercisePicker onSelect={(e) => openAdd(e)} />}
        {sheet.kind === 'add' && (
          <EntryForm
            key={`add-${sheet.exercise.id}`}
            initial={sheet.initial}
            previous={sheet.previous}
            submitLabel="記録する"
            onDirtyChange={setDirty}
            onSubmit={(v) => handleAdd(sheet.exercise, v)}
          />
        )}
        {sheet.kind === 'edit' && (
          <EntryForm
            key={`edit-${sheet.group.ids[0]}`}
            initial={{
              weight: sheet.group.weight,
              reps: sheet.group.reps,
              sets: sheet.group.count,
            }}
            submitLabel="更新する"
            onDirtyChange={setDirty}
            onSubmit={(v) => handleEdit(sheet.exercise, sheet.group, v)}
            onDelete={() => handleDelete(sheet.exercise, sheet.group)}
          />
        )}
      </Sheet>
    </>
  )
}
