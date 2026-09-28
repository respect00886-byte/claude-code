import { DAY_NOTE, db as defaultDb, type GymDB, type MenuItem, type Undo } from './db'
import { byInputOrder } from '../lib/stats'

/** その日の記録から、種目ごとのメニュー (最後に入力した重量・回数とセット数) を作る */
export async function menuOfDay(date: string, database: GymDB = defaultDb): Promise<MenuItem[]> {
  const sets = (await database.workoutSets.where('date').equals(date).toArray()).sort(byInputOrder)
  const plans = await database.plans.where('date').equals(date).sortBy('order')
  const items = new Map<number, MenuItem>()
  // 予定の順番を優先し、予定だけで未実施の種目も残す
  for (const p of plans) {
    items.set(p.exerciseId, {
      exerciseId: p.exerciseId,
      weight: p.weight,
      reps: p.reps,
      sets: p.sets,
    })
  }
  for (const s of sets) {
    const done = sets.filter((x) => x.exerciseId === s.exerciseId)
    const last = done.reduce((a, b) => (b.id > a.id ? b : a))
    items.set(s.exerciseId, {
      exerciseId: s.exerciseId,
      weight: last.weight,
      reps: last.reps,
      sets: done.length,
    })
  }
  return [...items.values()]
}

/** 指定日より前で記録がある直近の日 */
export async function previousWorkoutDate(date: string, database: GymDB = defaultDb) {
  const row = await database.workoutSets.where('date').below(date).last()
  return row?.date
}

/** メニューをその日の予定に追加する。すでに予定か記録がある種目は追加しない */
export async function addPlan(
  date: string,
  items: MenuItem[],
  database: GymDB = defaultDb,
): Promise<Undo> {
  return database.transaction('rw', database.plans, database.workoutSets, async () => {
    const existing = await database.plans.where('date').equals(date).toArray()
    const done = new Set(
      (await database.workoutSets.where('date').equals(date).toArray()).map((s) => s.exerciseId),
    )
    const planned = new Set(existing.map((p) => p.exerciseId))
    let order = existing.reduce((m, p) => Math.max(m, p.order), 0)
    const rows = items
      .filter((it) => !planned.has(it.exerciseId) && !done.has(it.exerciseId))
      .map((it) => ({ ...it, date, order: ++order }))
    const ids = await database.plans.bulkAdd(rows, { allKeys: true })
    return async () => {
      await database.plans.bulkDelete(ids)
    }
  })
}

/** 予定から外す */
export async function removePlan(
  date: string,
  exerciseId: number,
  database: GymDB = defaultDb,
): Promise<Undo> {
  const row = await database.plans.where('[date+exerciseId]').equals([date, exerciseId]).first()
  if (!row) return async () => {}
  await database.plans.delete(row.id)
  return async () => {
    await database.plans.put(row)
  }
}

/** ルーティンとして保存 (同じ名前があれば上書き) */
export async function saveRoutine(name: string, items: MenuItem[], database: GymDB = defaultDb) {
  const existing = await database.routines.where('name').equals(name).first()
  if (existing) {
    await database.routines.update(existing.id, { items })
    return existing.id
  }
  return database.routines.add({ name, items, createdAt: Date.now() })
}

/** メモを保存。空なら削除する */
export async function saveNote(
  date: string,
  exerciseId: number,
  text: string,
  database: GymDB = defaultDb,
) {
  const trimmed = text.trim()
  await database.transaction('rw', database.notes, async () => {
    const row = await database.notes.where('[date+exerciseId]').equals([date, exerciseId]).first()
    if (!trimmed) {
      if (row) await database.notes.delete(row.id)
    } else if (row) {
      await database.notes.update(row.id, { text: trimmed })
    } else {
      await database.notes.add({ date, exerciseId, text: trimmed })
    }
  })
}

/** 指定種目の、指定日より前の直近のメモ */
export async function previousNote(exerciseId: number, date: string, database: GymDB = defaultDb) {
  if (exerciseId === DAY_NOTE) return undefined
  const notes = await database.notes
    .where('date')
    .below(date)
    .filter((n) => n.exerciseId === exerciseId)
    .sortBy('date')
  return notes.at(-1)
}
