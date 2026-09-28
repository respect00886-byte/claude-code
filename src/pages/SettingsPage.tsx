import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Download, Eye, EyeOff, Pencil, Plus, Upload } from 'lucide-react'
import { CATEGORIES, db, type Category, type Exercise } from '../db/db'
import { downloadJson, exportData, importData, parseBackup } from '../lib/backup'
import { toDateKey } from '../lib/date'
import PageHeader from '../components/PageHeader'
import Sheet from '../components/Sheet'
import Chip from '../components/Chip'

type Editing = { kind: 'closed' } | { kind: 'new' } | { kind: 'edit'; exercise: Exercise }

export default function SettingsPage() {
  const exercises = useLiveQuery(() => db.exercises.toArray(), [])
  const counts = useLiveQuery(async () => ({
    sets: await db.workoutSets.count(),
    weights: await db.bodyWeights.count(),
  }))
  const [editing, setEditing] = useState<Editing>({ kind: 'closed' })
  const [message, setMessage] = useState<string>()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    downloadJson(await exportData(), `gymlog-backup-${toDateKey()}.json`)
  }

  const handleImport = async (file: File) => {
    try {
      const data = parseBackup(await file.text())
      if (!confirm('現在のデータはすべて置き換えられます。復元しますか？')) return
      await importData(data)
      setMessage(
        `復元しました（${data.workoutSets.length}セット / 体重${data.bodyWeights.length}件）`,
      )
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '復元に失敗しました')
    }
  }

  return (
    <>
      <PageHeader title="設定" />
      <main className="flex flex-col gap-4 px-4">
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="font-bold">バックアップ</h2>
          <p className="mt-1 mb-3 text-sm text-muted">
            データはこの端末のブラウザ内に保存されています。機種変更やブラウザのデータ削除に備えて、定期的にバックアップしてください。
          </p>
          {counts && (
            <p className="mb-3 text-sm text-ink-2">
              保存中：筋トレ {counts.sets} セット / 体重 {counts.weights} 件
            </p>
          )}
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
          {message && <p className="mt-3 text-sm text-accent">{message}</p>}
        </section>

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
                    <li key={e.id} className="flex items-center gap-1 py-1.5">
                      <span className={`flex-1 ${e.archived ? 'text-muted line-through' : ''}`}>
                        {e.name}
                      </span>
                      <button
                        aria-label={`${e.name}を編集`}
                        onClick={() => setEditing({ kind: 'edit', exercise: e })}
                        className="rounded-full p-2 text-muted active:bg-surface-2"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        aria-label={e.archived ? `${e.name}を表示` : `${e.name}を非表示`}
                        onClick={() => db.exercises.update(e.id, { archived: !e.archived })}
                        className="rounded-full p-2 text-muted active:bg-surface-2"
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
            onSave={async (name, category) => {
              if (editing.kind === 'edit') {
                await db.exercises.update(editing.exercise.id, { name, category })
              } else {
                await db.exercises.add({
                  name,
                  category,
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

function ExerciseForm({
  initial,
  onSave,
}: {
  initial?: Exercise
  onSave: (name: string, category: Category) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? '胸')
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onSave(name.trim(), category)
      }}
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="種目名（例：ケーブルクロスオーバー）"
        className="rounded-xl bg-surface-2 px-3 py-3 outline-none placeholder:text-muted"
      />
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Chip>
        ))}
      </div>
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
