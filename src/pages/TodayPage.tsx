import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Copy,
  Dumbbell,
  History,
  ListChecks,
  NotebookPen,
  Plus,
} from 'lucide-react'
import {
  DAY_NOTE,
  addSets,
  db,
  deleteSets,
  lastSetOf,
  updateSetGroup,
  type Exercise,
  type MenuItem,
  type Routine,
  type WorkoutSet,
} from '../db/db'
import {
  addPlan,
  menuOfDay,
  previousNote,
  previousWorkoutDate,
  removePlan,
  saveNote,
  saveRoutine,
} from '../db/menu'
import { addDays, formatDate, isDateKey } from '../lib/date'
import { useToday } from '../lib/useToday'
import { showToast, showUndoToast } from '../lib/toast'
import { byInputOrder, describeSets, fmtVolume, volume, type SetGroup } from '../lib/stats'
import PageHeader from '../components/PageHeader'
import Sheet from '../components/Sheet'
import ExercisePicker from '../components/ExercisePicker'
import EntryForm, { type EntryValues } from '../components/EntryForm'
import ExerciseCard from '../components/ExerciseCard'
import NoteForm from '../components/NoteForm'
import RoutinePicker from '../components/RoutinePicker'
import SaveRoutineForm from '../components/SaveRoutineForm'
import Chip from '../components/Chip'

type SheetState =
  | { kind: 'closed' }
  | { kind: 'pick' }
  | {
      kind: 'add'
      exercise: Exercise
      initial: EntryValues
      previous?: EntryValues & { date: string }
      previousNote?: string
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
  | { kind: 'note'; exerciseId: number; title: string; initial: string; hint?: string }
  | { kind: 'routines' }
  | { kind: 'saveRoutine' }

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
  const open = (s: SheetState) => {
    setDirty(false)
    setSheet(s)
  }

  const data = useLiveQuery(async () => {
    const [sets, plans, notes] = await Promise.all([
      db.workoutSets.where('date').equals(date).toArray(),
      db.plans.where('date').equals(date).sortBy('order'),
      db.notes.where('date').equals(date).toArray(),
    ])
    sets.sort(byInputOrder)
    // 予定の順番を優先し、予定にない種目は記録した順に後ろへ並べる
    const exIds = [
      ...new Set([...plans.map((p) => p.exerciseId), ...sets.map((s) => s.exerciseId)]),
    ]
    const exercises = await db.exercises.bulkGet(exIds)
    const noteOf = new Map(notes.map((n) => [n.exerciseId, n.text]))
    return {
      date,
      dayNote: noteOf.get(DAY_NOTE),
      items: exIds.map((id, i) => ({
        exercise: exercises[i] ?? UNKNOWN_EXERCISE(id),
        sets: sets.filter((s) => s.exerciseId === id),
        plan: plans.find((p) => p.exerciseId === id),
        note: noteOf.get(id),
      })),
    }
  }, [date])
  // 日付を切り替えた直後に前の日のデータを表示しないようにする
  const current = data?.date === date ? data : undefined
  const items = current?.items

  // 何も記録していない日は「前回のメニューをコピー」を出す
  const previous = useLiveQuery(async () => {
    const prevDate = await previousWorkoutDate(date)
    if (!prevDate) return null
    const menu = await menuOfDay(prevDate)
    const exercises = await db.exercises.bulkGet(menu.map((m) => m.exerciseId))
    return { date: prevDate, menu, names: exercises.map((e) => e?.name ?? '?') }
  }, [date])
  const routineCount = useLiveQuery(() => db.routines.count(), [])

  const openAdd = async (exercise: Exercise, todaysSets: WorkoutSet[], fromPicker: boolean) => {
    const [prev, prevNote] = await Promise.all([
      lastSetOf(exercise.id, date),
      previousNote(exercise.id, date),
    ])
    const plan = items?.find((it) => it.exercise.id === exercise.id)?.plan
    const last = lastEntered(todaysSets) ?? plan ?? prev
    const initial = last
      ? { weight: last.weight, reps: last.reps, sets: 1 }
      : { weight: exercise.kind === 'bodyweight' ? 0 : 20, reps: 10, sets: 1 }
    open({
      kind: 'add',
      exercise,
      initial,
      previous: prev,
      previousNote: prevNote && `前回のメモ（${formatDate(prevNote.date)}）：${prevNote.text}`,
      fromPicker,
    })
  }

  const handleAdd = async (exercise: Exercise, v: EntryValues) => {
    const ids = await addSets(date, exercise.id, v.weight, v.reps, v.sets)
    haptic()
    close()
    showUndoToast(`${exercise.name} ${describeSets(v, exercise.kind)}を記録しました`, async () => {
      await db.workoutSets.bulkDelete(ids)
    })
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

  const applyMenu = async (menu: MenuItem[], label: string) => {
    const undo = await addPlan(date, menu)
    close()
    showUndoToast(`${label}を予定に追加しました`, undo)
  }

  const openNote = async (exerciseId: number, title: string, initial = '') => {
    const prev = await previousNote(exerciseId, date)
    open({
      kind: 'note',
      exerciseId,
      title,
      initial,
      hint: prev && `前回のメモ（${formatDate(prev.date)}）：${prev.text}`,
    })
  }

  const allSets = items?.flatMap((d) => d.sets) ?? []
  const totalVolume = volume(allSets)
  const hasItems = !!items && items.length > 0

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
              <span className="tabular-nums">{fmtVolume(totalVolume)}</span>
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
        {current?.dayNote && (
          <button
            onClick={() => openNote(DAY_NOTE, 'この日のメモ', current.dayNote)}
            className="flex items-start gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-left"
          >
            <NotebookPen size={18} className="mt-0.5 shrink-0 text-accent" />
            <span className="text-sm whitespace-pre-wrap">{current.dayNote}</span>
          </button>
        )}

        {items?.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-10 pb-4 text-center text-muted">
            <Dumbbell size={48} strokeWidth={1.5} />
            <p>
              {isToday ? '今日' : formatDate(date)}のトレーニングはまだありません
              <br />
              下のボタンから種目を追加しましょう
            </p>
          </div>
        )}

        {items?.length === 0 && (previous || !!routineCount) && (
          <div className="flex flex-col gap-2">
            {previous && (
              <button
                onClick={() =>
                  applyMenu(previous.menu, `前回（${formatDate(previous.date)}）のメニュー`)
                }
                className="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-left active:bg-surface-2"
              >
                <Copy size={20} className="mt-0.5 shrink-0 text-accent" />
                <span className="min-w-0">
                  <span className="block font-semibold">
                    前回（{formatDate(previous.date)}）のメニューをコピー
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {previous.names.join('・')}
                  </span>
                </span>
              </button>
            )}
            {!!routineCount && (
              <button
                onClick={() => open({ kind: 'routines' })}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-left font-semibold active:bg-surface-2"
              >
                <ListChecks size={20} className="shrink-0 text-accent" />
                ルーティンから始める
              </button>
            )}
          </div>
        )}

        {items?.map(({ exercise, sets, plan, note }) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            sets={sets}
            plan={plan}
            note={note}
            onQuickAdd={(v) => handleAdd(exercise, { ...v, sets: 1 })}
            onAdd={() => openAdd(exercise, sets, false)}
            onEdit={(group) => open({ kind: 'edit', exercise, group, index: null })}
            onNote={() => openNote(exercise.id, `${exercise.name}のメモ`, note)}
            onRemovePlan={async () => {
              const undo = await removePlan(date, exercise.id)
              showUndoToast(`${exercise.name}を予定から外しました`, undo)
            }}
          />
        ))}

        {items && (
          <div className="flex flex-wrap gap-2">
            {!current?.dayNote && (
              <Chip onClick={() => openNote(DAY_NOTE, 'この日のメモ')}>
                <span className="flex items-center gap-1.5">
                  <NotebookPen size={16} /> この日のメモ
                </span>
              </Chip>
            )}
            {hasItems && !!routineCount && (
              <Chip onClick={() => open({ kind: 'routines' })}>
                <span className="flex items-center gap-1.5">
                  <ListChecks size={16} /> ルーティンを追加
                </span>
              </Chip>
            )}
            {hasItems && (
              <Chip onClick={() => open({ kind: 'saveRoutine' })}>
                <span className="flex items-center gap-1.5">
                  <BookmarkPlus size={16} /> ルーティンとして保存
                </span>
              </Chip>
            )}
          </div>
        )}
      </main>

      <button
        onClick={() => open({ kind: 'pick' })}
        className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 flex items-center gap-2 rounded-full bg-accent px-6 py-4 font-bold text-accent-ink shadow-lg shadow-black/20 transition-transform active:scale-95 min-[32rem]:right-[calc(50%-15rem)]"
      >
        <Plus size={22} strokeWidth={2.5} /> 種目を追加
      </button>

      <Sheet
        open={sheet.kind !== 'closed'}
        onClose={close}
        dismissible={!dirty}
        onBack={sheet.kind === 'add' && sheet.fromPicker ? () => open({ kind: 'pick' }) : undefined}
        title={
          sheet.kind === 'pick'
            ? '種目を選択'
            : sheet.kind === 'add' || sheet.kind === 'edit'
              ? sheet.exercise.name
              : sheet.kind === 'note'
                ? sheet.title
                : sheet.kind === 'routines'
                  ? 'ルーティンを選択'
                  : sheet.kind === 'saveRoutine'
                    ? 'ルーティンとして保存'
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
            header={
              sheet.previousNote && (
                <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm whitespace-pre-wrap text-ink-2">
                  {sheet.previousNote}
                </p>
              )
            }
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
        {sheet.kind === 'note' && (
          <NoteForm
            initial={sheet.initial}
            hint={sheet.hint}
            placeholder={
              sheet.exerciseId === DAY_NOTE
                ? '体調やトレーニング全体の感想など'
                : 'フォームの注意点、次回の目標など'
            }
            onDirtyChange={setDirty}
            onSave={async (text) => {
              await saveNote(date, sheet.exerciseId, text)
              close()
              showToast(text.trim() ? 'メモを保存しました' : 'メモを削除しました', {
                duration: 2000,
              })
            }}
          />
        )}
        {sheet.kind === 'routines' && (
          <RoutinePicker onSelect={(r: Routine) => applyMenu(r.items, `ルーティン「${r.name}」`)} />
        )}
        {sheet.kind === 'saveRoutine' && items && <SaveRoutineSheet date={date} onDone={close} />}
      </Sheet>
    </>
  )
}

/** その日のメニュー (記録＋予定) をルーティンとして保存する */
function SaveRoutineSheet({ date, onDone }: { date: string; onDone: () => void }) {
  const data = useLiveQuery(async () => {
    const menu = await menuOfDay(date)
    const exercises = await db.exercises.bulkGet(menu.map((m) => m.exerciseId))
    const categories = [...new Set(exercises.map((e) => e?.category).filter(Boolean))]
    return {
      items: menu.map((m, i) => ({
        ...m,
        name: exercises[i]?.name ?? '(削除された種目)',
        kind: exercises[i]?.kind ?? ('weighted' as const),
      })),
      // 部位から名前の候補を作る (例:「胸・背中の日」)
      defaultName: categories.length
        ? `${categories.join('・')}の日`
        : `${formatDate(date)}のメニュー`,
    }
  }, [date])
  if (!data) return null
  return (
    <SaveRoutineForm
      items={data.items}
      defaultName={data.defaultName}
      onSave={async (name) => {
        await saveRoutine(
          name,
          data.items.map(({ exerciseId, weight, reps, sets }) => ({
            exerciseId,
            weight,
            reps,
            sets,
          })),
        )
        onDone()
        showToast(`ルーティン「${name}」を保存しました`, { duration: 2500 })
      }}
    />
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
