import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, Dumbbell, History, Plus, SlidersHorizontal } from 'lucide-react'
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
import {
  byInputOrder,
  describeSets,
  fmt,
  formatLoad,
  groupSets,
  volume,
  type SetGroup,
} from '../lib/stats'
import PageHeader from '../components/PageHeader'
import Sheet from '../components/Sheet'
import ExercisePicker from '../components/ExercisePicker'
import EntryForm, { type EntryValues } from '../components/EntryForm'
import Chip from '../components/Chip'

type SheetState =
  | { kind: 'closed' }
  | { kind: 'pick' }
  | {
      kind: 'add'
      exercise: Exercise
      initial: EntryValues
      previous?: EntryValues & { date: string }
      /** 種目選択から開いた場合は「戻る」で選び直せる */
      fromPicker: boolean
    }
  | {
      kind: 'edit'
      exercise: Exercise
      group: SetGroup
      /** null = まとめて編集 / 数値 = そのセットだけ編集 */
      index: number | null
    }

const UNKNOWN_EXERCISE = (id: number): Exercise => ({
  id,
  name: '(削除された種目)',
  category: 'その他',
  kind: 'weighted',
  step: 2.5,
  isCustom: true,
  archived: true,
})

/** その日の最後に入力したセット */
const lastEntered = (sets: WorkoutSet[]) =>
  sets.reduce<WorkoutSet | undefined>((a, b) => (!a || b.id > a.id ? b : a), undefined)

/** 軽い振動で記録できたことを伝える (対応端末のみ) */
const haptic = () => navigator.vibrate?.(10)

export default function TodayPage() {
  const [params, setParams] = useSearchParams()
  // 日付をまたいでも「今日」が自動で切り替わる
  const today = useToday()
  const param = params.get('date')
  // 不正な日付や未来の日付は今日として扱う
  const date = param && isDateKey(param) && param <= today ? param : today
  const isToday = date === today
  const setDate = (d: string) => setParams(d === today ? {} : { date: d }, { replace: true })

  const [sheet, setSheet] = useState<SheetState>({ kind: 'closed' })
  const [dirty, setDirty] = useState(false)
  const close = useCallback(() => {
    setSheet({ kind: 'closed' })
    setDirty(false)
  }, [])

  const data = useLiveQuery(async () => {
    const sets = await db.workoutSets.where('date').equals(date).toArray()
    sets.sort(byInputOrder)
    const exIds = [...new Set(sets.map((s) => s.exerciseId))]
    const exercises = await db.exercises.bulkGet(exIds)
    return {
      date,
      items: exIds.map((id, i) => ({
        exercise: exercises[i] ?? UNKNOWN_EXERCISE(id),
        sets: sets.filter((s) => s.exerciseId === id),
      })),
    }
  }, [date])
  // 日付を切り替えた直後に前の日のデータを表示しないようにする
  const items = data?.date === date ? data.items : undefined

  const openAdd = async (exercise: Exercise, todaysSets: WorkoutSet[], fromPicker: boolean) => {
    const previous = await lastSetOf(exercise.id, date)
    const last = lastEntered(todaysSets) ?? previous
    const initial = last
      ? { weight: last.weight, reps: last.reps, sets: 1 }
      : { weight: exercise.kind === 'bodyweight' ? 0 : 20, reps: 10, sets: 1 }
    setDirty(false)
    setSheet({ kind: 'add', exercise, initial, previous, fromPicker })
  }

  const handleAdd = async (exercise: Exercise, v: EntryValues) => {
    const ids = await addSets(date, exercise.id, v.weight, v.reps, v.sets)
    haptic()
    close()
    showUndoToast(`${exercise.name} ${describeSets(v, exercise.kind)}を記録しました`, async () => {
      await db.workoutSets.bulkDelete(ids)
    })
  }

  /** 直前と同じ内容で1セットを1タップで記録 */
  const quickAdd = async (exercise: Exercise, last: WorkoutSet) => {
    const v = { weight: last.weight, reps: last.reps, sets: 1 }
    await handleAdd(exercise, v)
  }

  const handleEdit = async (exercise: Exercise, ids: number[], v: EntryValues) => {
    const undo = await updateSetGroup(ids, v)
    close()
    showUndoToast(`${exercise.name}を${describeSets(v, exercise.kind)}に変更しました`, undo)
  }

  const handleDelete = async (exercise: Exercise, ids: number[], v: EntryValues) => {
    const undo = await deleteSets(ids)
    close()
    showUndoToast(`${exercise.name} ${describeSets(v, exercise.kind)}を削除しました`, undo)
  }

  const allSets = items?.flatMap((d) => d.sets) ?? []
  const totalVolume = volume(allSets)

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center">
            <button
              aria-label="前の日"
              onClick={() => setDate(addDays(date, -1))}
              className="-ml-3 flex size-11 items-center justify-center rounded-full text-muted active:bg-surface-2"
            >
              <ChevronLeft size={24} />
            </button>
            <label className="relative cursor-pointer px-1">
              {isToday ? '今日' : formatDate(date)}
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
              disabled={isToday}
              onClick={() => setDate(addDays(date, 1))}
              className="flex size-11 items-center justify-center rounded-full text-muted active:bg-surface-2 disabled:opacity-30"
            >
              <ChevronRight size={24} />
            </button>
          </span>
        }
        right={
          allSets.length > 0 && (
            <span className="text-right text-xs leading-tight text-muted">
              {allSets.length}セット
              <br />
              <span className="tabular-nums">{fmt(totalVolume)}kg</span>
            </span>
          )
        }
      />

      {!isToday && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-2xl border border-accent/40 bg-accent/10 py-1 pr-1 pl-3">
          <History size={18} className="shrink-0 text-accent" />
          <p className="min-w-0 flex-1 text-sm">
            <span className="font-bold">{formatDate(date)}</span> の記録を表示中
          </p>
          <button
            onClick={() => setDate(today)}
            className="min-h-11 shrink-0 rounded-xl bg-accent px-3 text-sm font-bold text-accent-ink active:opacity-80"
          >
            今日に戻る
          </button>
        </div>
      )}

      {/* 下部の「種目を追加」ボタンや通知に最後のカードが隠れないよう余白をとる */}
      <main className="flex flex-col gap-3 px-4 pb-40">
        {items?.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted">
            <Dumbbell size={48} strokeWidth={1.5} />
            <p>
              {isToday ? '今日' : formatDate(date)}のトレーニングはまだありません
              <br />
              下のボタンから種目を追加しましょう
            </p>
          </div>
        )}

        {items?.map(({ exercise, sets }) => {
          const last = lastEntered(sets)!
          const bodyweight = exercise.kind === 'bodyweight'
          return (
            <section key={exercise.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <h2 className="font-bold">{exercise.name}</h2>
                <span className="text-xs text-muted tabular-nums">
                  {bodyweight
                    ? `合計${sets.reduce((n, s) => n + s.reps, 0)}回`
                    : `${fmt(volume(sets))}kg`}
                </span>
              </div>
              <ul className="flex flex-col">
                {groupSets(sets).map((g) => (
                  <li key={g.ids[0]}>
                    <button
                      onClick={() => {
                        setDirty(false)
                        setSheet({ kind: 'edit', exercise, group: g, index: null })
                      }}
                      aria-label={`${describeSets({ weight: g.weight, reps: g.reps, sets: g.count }, exercise.kind)}を編集`}
                      className="flex min-h-11 w-full items-baseline gap-1.5 rounded-lg px-2 py-1.5 text-left tabular-nums active:bg-surface-2"
                    >
                      {bodyweight ? (
                        <span className="text-lg font-semibold">
                          {formatLoad(g.weight, exercise.kind)}
                        </span>
                      ) : (
                        <>
                          <span className="text-lg font-semibold">{fmt(g.weight)}</span>
                          <span className="text-sm text-muted">kg</span>
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
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => quickAdd(exercise, last)}
                  aria-label={`${formatLoad(last.weight, exercise.kind)}×${last.reps}回をもう1セット記録`}
                  className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent/15 px-3 font-bold text-ink active:bg-accent/30"
                >
                  <Plus size={18} strokeWidth={2.5} className="text-accent" />
                  1セット
                  <span className="text-sm font-medium text-ink-2 tabular-nums">
                    {formatLoad(last.weight, exercise.kind)}×{last.reps}回
                  </span>
                </button>
                <button
                  onClick={() => openAdd(exercise, sets, false)}
                  aria-label={`${exercise.name}の重量や回数を変えて追加`}
                  className="flex min-h-12 shrink-0 items-center gap-1 rounded-xl bg-surface-2 px-3 text-sm font-medium text-ink-2 active:opacity-70"
                >
                  <SlidersHorizontal size={16} /> 変更
                </button>
              </div>
            </section>
          )
        })}
      </main>

      <button
        onClick={() => setSheet({ kind: 'pick' })}
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 flex items-center gap-2 rounded-full bg-accent px-6 py-4 font-bold text-accent-ink shadow-lg shadow-black/20 transition-transform active:scale-95 min-[32rem]:right-[calc(50%-15rem)]"
      >
        <Plus size={22} strokeWidth={2.5} /> 種目を追加
      </button>

      <Sheet
        open={sheet.kind !== 'closed'}
        onClose={close}
        dismissible={!dirty}
        onBack={
          sheet.kind === 'add' && sheet.fromPicker
            ? () => {
                setDirty(false)
                setSheet({ kind: 'pick' })
              }
            : undefined
        }
        title={
          sheet.kind === 'pick'
            ? '種目を選択'
            : sheet.kind === 'add' || sheet.kind === 'edit'
              ? sheet.exercise.name
              : ''
        }
      >
        {sheet.kind === 'pick' && (
          <ExercisePicker
            onSelect={(e) =>
              openAdd(e, items?.find((it) => it.exercise.id === e.id)?.sets ?? [], true)
            }
          />
        )}
        {sheet.kind === 'add' && (
          <EntryForm
            key={`add-${sheet.exercise.id}`}
            kind={sheet.exercise.kind}
            step={sheet.exercise.step}
            initial={sheet.initial}
            previous={sheet.previous}
            submitLabel="記録する"
            onDirtyChange={setDirty}
            onSubmit={(v) => handleAdd(sheet.exercise, v)}
          />
        )}
        {sheet.kind === 'edit' && (
          <EditGroup
            sheet={sheet}
            onChange={setSheet}
            onDirtyChange={setDirty}
            onSubmit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Sheet>
    </>
  )
}

interface EditGroupProps {
  sheet: Extract<SheetState, { kind: 'edit' }>
  onChange: (s: SheetState) => void
  onDirtyChange: (dirty: boolean) => void
  onSubmit: (exercise: Exercise, ids: number[], v: EntryValues) => Promise<void>
  onDelete: (exercise: Exercise, ids: number[], v: EntryValues) => Promise<void>
}

/** まとめたセットの編集。複数セットの場合は1セットだけを選んで直せる */
function EditGroup({ sheet, onChange, onDirtyChange, onSubmit, onDelete }: EditGroupProps) {
  const { exercise, group, index } = sheet
  const ids = index === null ? group.ids : [group.ids[index]]
  const initial = { weight: group.weight, reps: group.reps, sets: ids.length }

  const header =
    group.count > 1 ? (
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">編集するセット（何セット目か）</p>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          <Chip
            active={index === null}
            onClick={() => {
              onDirtyChange(false)
              onChange({ ...sheet, index: null })
            }}
          >
            まとめて
          </Chip>
          {group.ids.map((id, i) => (
            <Chip
              key={id}
              label={`${i + 1}セット目`}
              active={index === i}
              onClick={() => {
                onDirtyChange(false)
                onChange({ ...sheet, index: i })
              }}
            >
              {i + 1}
            </Chip>
          ))}
        </div>
      </div>
    ) : undefined

  return (
    <EntryForm
      key={`edit-${group.ids[0]}-${index}`}
      kind={exercise.kind}
      step={exercise.step}
      initial={initial}
      singleSet={index !== null}
      header={header}
      submitLabel="更新する"
      onDirtyChange={onDirtyChange}
      onSubmit={(v) => onSubmit(exercise, ids, v)}
      onDelete={() => onDelete(exercise, ids, initial)}
    />
  )
}
