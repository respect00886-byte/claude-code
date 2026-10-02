import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Download, Eye, EyeOff, Pencil, Plus, ShieldAlert, ShieldCheck, Upload } from 'lucide-react'
import {
  CATEGORIES,
  WEIGHT_STEPS,
  db,
  type Category,
  type Exercise,
  type ExerciseKind,
} from '../db/db'
import { fmt } from '../lib/stats'
import { updateSettings, useSettings, type WeightUnit } from '../lib/settings'
import RoutineManager from '../components/RoutineManager'
import { stepInUnit } from '../lib/units'

import { exportData, importData, parseBackup, saveJsonFile } from '../lib/backup'
import { formatDate, toDateKey } from '../lib/date'
import {
  getLastBackupAt,
  isIOS,
  isStandalone,
  requestPersistentStorage,
  setLastBackupAt,
} from '../lib/storage'
import PageHeader from '../components/PageHeader'
import Sheet from '../components/Sheet'
import Chip from '../components/Chip'

type Editing = { kind: 'closed' } | { kind: 'new' } | { kind: 'edit'; exercise: Exercise }
type Message = { kind: 'ok' | 'error'; text: string }

export default function SettingsPage() {
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const counts = useLiveQuery(async () => ({
    sets: await db.workoutSets.count(),
    weights: await db.bodyWeights.count(),
  }))
  const { unit } = useSettings()
  const [editing, setEditing] = useState<Editing>({ kind: 'closed' })
  const [message, setMessage] = useState<Message>()
  const [lastBackup, setLastBackup] = useState(getLastBackupAt)
  const [persisted, setPersisted] = useState<boolean>()
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    requestPersistentStorage().then(setPersisted)
  }, [])

  const handleExport = async () => {
    try {
      const saved = await saveJsonFile(await exportData(), `gymlog-backup-${toDateKey()}.json`)
      if (!saved) return
      setLastBackupAt()
      setLastBackup(getLastBackupAt())
      setMessage({ kind: 'ok', text: 'バックアップを書き出しました' })
    } catch {
      setMessage({ kind: 'error', text: '書き出しに失敗しました' })
    }
  }

  const handleImport = async (file: File) => {
    try {
      const data = parseBackup(await file.text())
      if (!confirm('現在のデータはすべて置き換えられます。復元しますか？')) return
      await importData(data)
      setMessage({
        kind: 'ok',
        text: `復元しました（${data.workoutSets.length}セット / 体重${data.bodyWeights.length}件）`,
      })
    } catch (e) {
      setMessage({ kind: 'error', text: e instanceof Error ? e.message : '復元に失敗しました' })
    }
  }

  const needsInstallHint = isIOS() && !isStandalone()

  return (
    <>
      <PageHeader title="設定" />
      <main className="flex flex-col gap-4 px-4">
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="font-bold">データの保護</h2>
          {persisted ? (
            <p className="mt-2 flex items-start gap-2 text-sm text-ink-2">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" />
              ブラウザがデータを自動で消さないように設定されています。
            </p>
          ) : (
            <p className="mt-2 flex items-start gap-2 text-sm text-ink-2">
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-danger" />
              {needsInstallHint
                ? 'Safari で開いたままだと、しばらく使わないとデータが消えることがあります。共有ボタン →「ホーム画面に追加」から開いてください。'
                : 'ブラウザの判断でデータが消える可能性があります。こまめにバックアップしてください。'}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="font-bold">バックアップ</h2>
          <p className="mt-1 mb-3 text-sm text-muted">
            データはこの端末のブラウザ内に保存されています。機種変更やブラウザのデータ削除に備えて、定期的にバックアップしてください。
          </p>
          <dl className="mb-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            {counts && (
              <>
                <dt className="text-muted">保存中</dt>
                <dd className="text-ink-2">
                  筋トレ {counts.sets} セット / 体重 {counts.weights} 件
                </dd>
              </>
            )}
            <dt className="text-muted">前回の書き出し</dt>
            <dd className="text-ink-2">
              {lastBackup ? formatDate(toDateKey(lastBackup)) : 'まだありません'}
            </dd>
          </dl>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 rounded-xl bg-surface-2 py-3 font-medium active:opacity-70"
            >
              <Download size={18} /> 書き出し
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl bg-surface-2 py-3 font-medium active:opacity-70"
            >
              <Upload size={18} /> 復元
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImport(f)
              e.target.value = ''
            }}
          />
          {message && (
            <p
              role={message.kind === 'error' ? 'alert' : 'status'}
              className={`mt-3 text-sm ${message.kind === 'error' ? 'text-danger' : 'text-accent'}`}
            >
              {message.text}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="font-bold">重量の単位</h2>
          <p className="mt-1 mb-3 text-sm text-muted">
            記録は kg で保存しているので、切り替えても記録そのものは変わりません。
          </p>
          <div className="flex gap-2">
            {(['kg', 'lb'] as const).map((u) => (
              <Chip key={u} active={unit === u} onClick={() => updateSettings({ unit: u })}>
                {u === 'kg' ? 'kg（キログラム）' : 'lb（ポンド）'}
              </Chip>
            ))}
          </div>
        </section>

        <RoutineManager />

        <section className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-bold">種目の管理</h2>
            <button
              onClick={() => setEditing({ kind: 'new' })}
              className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-accent-ink"
            >
              <Plus size={16} /> 追加
            </button>
          </div>
          {CATEGORIES.map((cat) => {
            const list = exercises?.filter((e) => e.category === cat) ?? []
            if (list.length === 0) return null
            return (
              <div key={cat} className="mt-3">
                <h3 className="mb-1 text-xs font-semibold text-muted">{cat}</h3>
                <ul className="divide-y divide-line">
                  {list.map((e) => (
                    <li key={e.id} className="flex items-center gap-1 py-0.5">
                      <span
                        className={`min-w-0 flex-1 ${e.archived ? 'text-muted line-through' : ''}`}
                      >
                        {e.name}
                        <span className="block text-xs text-muted">
                          {e.kind === 'bodyweight'
                            ? '自重'
                            : `${fmtStep(e.step, e.inputUnit ?? unit)}刻み`}
                          {e.inputUnit === 'lb' && '・lb で入力'}
                        </span>
                      </span>
                      <button
                        aria-label={`${e.name}を編集`}
                        onClick={() => setEditing({ kind: 'edit', exercise: e })}
                        className="flex size-11 items-center justify-center rounded-full text-muted active:bg-surface-2"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        aria-label={e.archived ? `${e.name}を表示` : `${e.name}を非表示`}
                        onClick={() => db.exercises.update(e.id, { archived: !e.archived })}
                        className="flex size-11 items-center justify-center rounded-full text-muted active:bg-surface-2"
                      >
                        {e.archived ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>

        <p className="pb-4 text-center text-xs text-muted">GymLog v0.1.0</p>
      </main>

      <Sheet
        open={editing.kind !== 'closed'}
        onClose={() => setEditing({ kind: 'closed' })}
        title={editing.kind === 'new' ? '種目を追加' : '種目を編集'}
      >
        {editing.kind !== 'closed' && (
          <ExerciseForm
            key={editing.kind === 'edit' ? editing.exercise.id : 'new'}
            initial={editing.kind === 'edit' ? editing.exercise : undefined}
            onSave={async (values) => {
              if (editing.kind === 'edit') {
                await db.exercises.update(editing.exercise.id, values)
              } else {
                await db.exercises.add({
                  ...values,
                  isCustom: true,
                  archived: false,
                } as Exercise)
              }
              setEditing({ kind: 'closed' })
            }}
          />
        )}
      </Sheet>
    </>
  )
}

/** 重量の刻み (kg で保存) を入力単位で表示 */
const fmtStep = (kgStep: number, unit: WeightUnit) => `${fmt(stepInUnit(kgStep, unit))}${unit}`

/** lb 入力では同じ lb の刻みになる候補を除く (1.25kg と 2.5kg はどちらも 5lb になるため) */
const stepsFor = (unit: WeightUnit) =>
  unit === 'kg' ? WEIGHT_STEPS : WEIGHT_STEPS.filter((v) => v !== 1.25 && v !== 2)

type ExerciseValues = Pick<Exercise, 'name' | 'category' | 'kind' | 'step' | 'inputUnit'>

function ExerciseForm({
  initial,
  onSave,
}: {
  initial?: Exercise
  onSave: (values: ExerciseValues) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? '胸')
  const [kind, setKind] = useState<ExerciseKind>(initial?.kind ?? 'weighted')
  const [step, setStep] = useState(initial?.step ?? 2.5)
  const displayUnit = useSettings().unit
  const [inputUnit, setInputUnit] = useState<WeightUnit>(initial?.inputUnit ?? displayUnit)
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim()) return
        // 未設定のまま表示の単位を選んだ場合は未設定のまま (表示の単位に合わせて変わる)
        const keepDefault = initial?.inputUnit === undefined && inputUnit === displayUnit
        onSave({
          name: name.trim(),
          category,
          kind,
          step,
          inputUnit: keepDefault ? undefined : inputUnit,
        })
      }}
    >
      <input
        autoFocus={!initial}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="種目名（例：ケーブルクロスオーバー）"
        aria-label="種目名"
        className="rounded-xl bg-surface-2 px-3 py-3 outline-none placeholder:text-muted"
      />
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted">部位</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted">種類</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={kind === 'weighted'} onClick={() => setKind('weighted')}>
            重量を使う
          </Chip>
          <Chip active={kind === 'bodyweight'} onClick={() => setKind('bodyweight')}>
            自重（加重は任意）
          </Chip>
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted">重量の入力単位</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={inputUnit === 'kg'} onClick={() => setInputUnit('kg')}>
            kg
          </Chip>
          <Chip active={inputUnit === 'lb'} onClick={() => setInputUnit('lb')}>
            lb（ポンド）
          </Chip>
        </div>
        <p className="mt-1.5 text-xs text-muted">
          マシンやダンベルが lb 表記のときは lb にすると、lb で入力して kg に換算して記録できます。
        </p>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted">
          ±ボタンで変わる重量{kind === 'bodyweight' && '（加重）'}
        </legend>
        <div className="flex flex-wrap gap-2">
          {stepsFor(inputUnit).map((v) => (
            <Chip
              key={v}
              active={stepInUnit(step, inputUnit) === stepInUnit(v, inputUnit)}
              onClick={() => setStep(v)}
            >
              {fmtStep(v, inputUnit)}
            </Chip>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted">
          目安：バーベル {fmtStep(2.5, inputUnit)} / ダンベル {fmtStep(1, inputUnit)}
          {inputUnit === 'kg' && `〜${fmtStep(2, inputUnit)}`} / マシン {fmtStep(5, inputUnit)}
        </p>
      </fieldset>
      <button
        type="submit"
        disabled={!name.trim()}
        className="rounded-2xl bg-accent py-4 text-lg font-bold text-accent-ink disabled:opacity-40"
      >
        保存
      </button>
    </form>
  )
}
