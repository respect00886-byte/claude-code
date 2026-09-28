import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search } from 'lucide-react'
import { CATEGORIES, db, type Category, type Exercise } from '../db/db'
import Chip from './Chip'

type Tab = Category | 'recent'

/** 最後に開いていたタブ (「戻る」で選び直すときに同じ部位から探せるように) */
let lastTab: Tab = 'recent'

/** カテゴリで絞り込んで種目を選ぶ。最近使った種目を先頭に表示 */
export default function ExercisePicker({ onSelect }: { onSelect: (e: Exercise) => void }) {
  const [category, setCategoryState] = useState<Tab>(lastTab)
  const setCategory = (c: Tab) => {
    lastTab = c
    setCategoryState(c)
  }
  const [query, setQuery] = useState('')

  const exercises = useLiveQuery(() => db.exercises.filter((e) => !e.archived).toArray(), [])
  const recentIds = useLiveQuery(async () => {
    const sets = await db.workoutSets.orderBy('createdAt').reverse().limit(300).toArray()
    return [...new Set(sets.map((s) => s.exerciseId))].slice(0, 12)
  }, [])

  const list = useMemo(() => {
    if (!exercises) return []
    const q = query.trim()
    if (q) return exercises.filter((e) => e.name.includes(q))
    if (category === 'recent') {
      const byId = new Map(exercises.map((e) => [e.id, e]))
      return (recentIds ?? []).map((id) => byId.get(id)).filter((e): e is Exercise => !!e)
    }
    return exercises.filter((e) => e.category === category)
  }, [exercises, recentIds, category, query])

  const showRecentEmpty = !query && category === 'recent' && recentIds && list.length === 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3">
        <Search size={18} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="種目を検索"
          className="w-full bg-transparent py-2.5 outline-none placeholder:text-muted"
        />
      </div>
      {!query && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          <Chip active={category === 'recent'} onClick={() => setCategory('recent')}>
            最近
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>
      )}
      {showRecentEmpty ? (
        <p className="py-6 text-center text-sm text-muted">
          まだ記録がありません。部位を選んで種目を探してください。
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {list.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => onSelect(e)}
                className="flex h-full min-h-14 w-full flex-col items-start justify-center rounded-xl border border-line bg-surface px-3 py-2 text-left active:bg-surface-2"
              >
                <span className="text-sm leading-tight font-semibold">{e.name}</span>
                <span className="text-[11px] text-muted">{e.category}</span>
              </button>
            </li>
          ))}
          {query && list.length === 0 && (
            <li className="col-span-2 py-6 text-center text-sm text-muted">
              見つかりません。設定から種目を追加できます。
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
