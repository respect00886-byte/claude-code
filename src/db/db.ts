import Dexie, { type EntityTable } from 'dexie'
import { SEED_EXERCISES } from './seed'

export const CATEGORIES = ['胸', '背中', '脚', '肩', '腕', '腹', 'その他'] as const
export type Category = (typeof CATEGORIES)[number]

export interface Exercise {
  id: number
  name: string
  category: Category
  isCustom: boolean
  archived: boolean
}

/** 1 行 = 1 セット */
export interface WorkoutSet {
  id: number
  /** YYYY-MM-DD (ローカル日付) */
  date: string
  exerciseId: number
  weight: number
  reps: number
  createdAt: number
}

export interface BodyWeight {
  id: number
  /** YYYY-MM-DD (1 日 1 件) */
  date: string
  weight: number
  bodyFat?: number
}

export class GymDB extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>
  workoutSets!: EntityTable<WorkoutSet, 'id'>
  bodyWeights!: EntityTable<BodyWeight, 'id'>

  constructor(name = 'gymlog') {
    super(name)
    this.version(1).stores({
      exercises: '++id, name, category',
      workoutSets: '++id, date, exerciseId, [exerciseId+date], createdAt',
      bodyWeights: '++id, &date',
    })
    this.on('populate', (tx) => {
      tx.table('exercises').bulkAdd(
        SEED_EXERCISES.map((e) => ({ ...e, isCustom: false, archived: false })),
      )
    })
  }
}

export const db = new GymDB()

/** 同じ重量・回数のセットをまとめて追加する */
export async function addSets(
  date: string,
  exerciseId: number,
  weight: number,
  reps: number,
  sets: number,
  database: GymDB = db,
  createdAt = Date.now(),
) {
  const rows = Array.from({ length: sets }, () => ({ date, exerciseId, weight, reps, createdAt }))
  return database.workoutSets.bulkAdd(rows as WorkoutSet[], { allKeys: true })
}

/** 取り消し用: 元に戻す処理 */
export type Undo = () => Promise<void>

/** 記録済みのセットを削除し、元に戻す関数を返す */
export async function deleteSets(ids: number[], database: GymDB = db): Promise<Undo> {
  const before = (await database.workoutSets.bulkGet(ids)).filter((s) => s !== undefined)
  await database.workoutSets.bulkDelete(ids)
  return async () => {
    await database.workoutSets.bulkPut(before)
  }
}

/**
 * まとめて表示しているセット (同じ重量×回数) を編集する。
 * セット数が増えた分は同じ位置に追加し、減った分は後ろから削除する。
 */
export async function updateSetGroup(
  ids: number[],
  values: { weight: number; reps: number; sets: number },
  database: GymDB = db,
): Promise<Undo> {
  return database.transaction('rw', database.workoutSets, async () => {
    const before = (await database.workoutSets.bulkGet(ids)).filter((s) => s !== undefined)
    if (before.length === 0) return async () => {}
    const first = before[0]
    const keep = ids.slice(0, values.sets)
    await database.workoutSets.bulkUpdate(
      keep.map((id) => ({ key: id, changes: { weight: values.weight, reps: values.reps } })),
    )
    await database.workoutSets.bulkDelete(ids.slice(values.sets))
    let added: number[] = []
    if (values.sets > ids.length) {
      // 元のグループと同じ位置に並ぶよう createdAt を揃える
      added = await addSets(
        first.date,
        first.exerciseId,
        values.weight,
        values.reps,
        values.sets - ids.length,
        database,
        first.createdAt,
      )
    }
    return async () => {
      await database.transaction('rw', database.workoutSets, async () => {
        await database.workoutSets.bulkDelete(added)
        await database.workoutSets.bulkPut(before)
      })
    }
  })
}

/** 指定種目の直近の記録 (最後に追加したセット) */
export async function lastSetOf(exerciseId: number, database: GymDB = db) {
  const sets = await database.workoutSets.where('exerciseId').equals(exerciseId).toArray()
  if (sets.length === 0) return undefined
  // 自動採番 id が大きいほど後に入力したセット
  const latest = sets.reduce((a, b) => (b.id > a.id ? b : a))
  // 直近日のうち最後に入力した重量・回数と、その日のセット数
  const sameDay = sets.filter(
    (s) => s.date === latest.date && s.weight === latest.weight && s.reps === latest.reps,
  )
  return { weight: latest.weight, reps: latest.reps, sets: sameDay.length, date: latest.date }
}

/** 体重を保存 (同じ日付は上書き) */
export async function saveBodyWeight(
  date: string,
  weight: number,
  bodyFat?: number,
  database: GymDB = db,
) {
  await database.transaction('rw', database.bodyWeights, async () => {
    const existing = await database.bodyWeights.where('date').equals(date).first()
    if (existing) {
      await database.bodyWeights.update(existing.id, { weight, bodyFat })
    } else {
      await database.bodyWeights.add({ date, weight, bodyFat } as BodyWeight)
    }
  })
}

/** 体重の記録を削除し、元に戻す関数を返す */
export async function deleteBodyWeight(id: number, database: GymDB = db): Promise<Undo> {
  const before = await database.bodyWeights.get(id)
  await database.bodyWeights.delete(id)
  return async () => {
    if (before) await database.bodyWeights.put(before)
  }
}
