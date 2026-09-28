import Dexie, { type EntityTable } from 'dexie'
import { SEED_EXERCISES, seedDefaults } from './seed'

export const CATEGORIES = ['胸', '背中', '脚', '肩', '腕', '腹', 'その他'] as const
export type Category = (typeof CATEGORIES)[number]

export const EXERCISE_KINDS = ['weighted', 'bodyweight'] as const
/** weighted = 重量を扱う種目 / bodyweight = 自重種目 (重量は加重分、0 なら自重のみ) */
export type ExerciseKind = (typeof EXERCISE_KINDS)[number]

/** 重量の刻みとして選べる値 (kg) */
export const WEIGHT_STEPS = [0.5, 1, 1.25, 2, 2.5, 5] as const

export interface Exercise {
  id: number
  name: string
  category: Category
  kind: ExerciseKind
  /** ステッパーの重量の刻み (kg) */
  step: number
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

/** メニューの1種目分 (目標の重量・回数・セット数) */
export interface MenuItem {
  exerciseId: number
  weight: number
  reps: number
  sets: number
}

/** 名前を付けて保存したメニュー */
export interface Routine {
  id: number
  name: string
  items: MenuItem[]
  createdAt: number
}

/** その日にやる予定の種目 (前回のコピーやルーティンから作る)。記録とは別に持つ */
export interface PlanItem extends MenuItem {
  id: number
  date: string
  /** 表示順 */
  order: number
}

/** メモ。exerciseId が 0 ならその日全体のメモ */
export interface Note {
  id: number
  date: string
  exerciseId: number
  text: string
}

export const DAY_NOTE = 0

export class GymDB extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>
  workoutSets!: EntityTable<WorkoutSet, 'id'>
  bodyWeights!: EntityTable<BodyWeight, 'id'>
  routines!: EntityTable<Routine, 'id'>
  plans!: EntityTable<PlanItem, 'id'>
  notes!: EntityTable<Note, 'id'>

  constructor(name = 'gymlog') {
    super(name)
    this.version(1).stores({
      exercises: '++id, name, category',
      workoutSets: '++id, date, exerciseId, [exerciseId+date], createdAt',
      bodyWeights: '++id, &date',
    })
    // v2: 種目ごとの重量の刻み (step) と自重種目 (kind) を追加
    this.version(2)
      .stores({})
      .upgrade((tx) =>
        tx
          .table('exercises')
          .toCollection()
          .modify((e: Exercise) => {
            const d = seedDefaults(e.name)
            e.kind ??= d.kind
            e.step ??= d.step
          }),
      )
    // v3: ルーティン・予定・メモ
    this.version(3).stores({
      routines: '++id, name',
      plans: '++id, date, &[date+exerciseId]',
      notes: '++id, date, &[date+exerciseId]',
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

/**
 * 指定種目の前回の記録。beforeDate を渡すとその日より前の直近日から探す。
 * 直近日のうち最後に入力した重量・回数と、同じ重量・回数のセット数を返す。
 */
export async function lastSetOf(exerciseId: number, beforeDate?: string, database: GymDB = db) {
  const range = database.workoutSets
    .where('[exerciseId+date]')
    .between([exerciseId, Dexie.minKey], [exerciseId, beforeDate ?? Dexie.maxKey], true, false)
  const lastRow = await range.last()
  if (!lastRow) return undefined
  const daySets = await database.workoutSets
    .where('[exerciseId+date]')
    .equals([exerciseId, lastRow.date])
    .toArray()
  // 自動採番 id が大きいほど後に入力したセット
  const latest = daySets.reduce((a, b) => (b.id > a.id ? b : a))
  const count = daySets.filter((s) => s.weight === latest.weight && s.reps === latest.reps).length
  return { weight: latest.weight, reps: latest.reps, sets: count, date: latest.date }
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
