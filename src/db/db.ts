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
  await database.workoutSets.bulkAdd(rows as WorkoutSet[])
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
  const existing = await database.bodyWeights.where('date').equals(date).first()
  if (existing) {
    await database.bodyWeights.update(existing.id, { weight, bodyFat })
  } else {
    await database.bodyWeights.add({ date, weight, bodyFat } as BodyWeight)
  }
}
