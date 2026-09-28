import {
  CATEGORIES,
  db as defaultDb,
  type BodyWeight,
  type Exercise,
  type GymDB,
  type WorkoutSet,
} from '../db/db'
import { isDateKey } from './date'

export const BACKUP_VERSION = 1

export interface BackupData {
  app: 'gymlog'
  version: typeof BACKUP_VERSION
  exportedAt: string
  exercises: Exercise[]
  workoutSets: WorkoutSet[]
  bodyWeights: BodyWeight[]
}

export async function exportData(database: GymDB = defaultDb): Promise<BackupData> {
  return {
    app: 'gymlog',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    exercises: await database.exercises.toArray(),
    workoutSets: await database.workoutSets.toArray(),
    bodyWeights: await database.bodyWeights.toArray(),
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const isId = (v: unknown): v is number => Number.isInteger(v) && (v as number) > 0
const isNum = (v: unknown, min = 0, max = Infinity): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max
const isDate = (v: unknown): v is string => typeof v === 'string' && isDateKey(v)

function isExercise(v: unknown): v is Exercise {
  return (
    isObj(v) &&
    isId(v.id) &&
    typeof v.name === 'string' &&
    v.name.length > 0 &&
    (CATEGORIES as readonly unknown[]).includes(v.category) &&
    typeof v.isCustom === 'boolean' &&
    typeof v.archived === 'boolean'
  )
}

function isWorkoutSet(v: unknown): v is WorkoutSet {
  return (
    isObj(v) &&
    isId(v.id) &&
    isDate(v.date) &&
    isId(v.exerciseId) &&
    isNum(v.weight, 0, 10000) &&
    Number.isInteger(v.reps) &&
    isNum(v.reps, 0, 10000) &&
    isNum(v.createdAt)
  )
}

function isBodyWeight(v: unknown): v is BodyWeight {
  return (
    isObj(v) &&
    isId(v.id) &&
    isDate(v.date) &&
    isNum(v.weight, 0, 1000) &&
    (v.bodyFat === undefined || isNum(v.bodyFat, 0, 100))
  )
}

function checkRows<T>(rows: unknown[], guard: (v: unknown) => v is T, label: string): T[] {
  const bad = rows.findIndex((r) => !guard(r))
  if (bad !== -1) throw new Error(`${label}の${bad + 1}件目のデータが壊れています`)
  return rows as T[]
}

function checkUnique(values: (string | number)[], label: string) {
  if (new Set(values).size !== values.length) throw new Error(`${label}に重複したデータがあります`)
}

/** バックアップファイルの中身を検証して返す。問題があれば日本語のエラーを投げる */
export function parseBackup(text: string): BackupData {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('JSON として読み込めませんでした')
  }
  if (!isObj(data) || data.app !== 'gymlog') {
    throw new Error('GymLog のバックアップファイルではありません')
  }
  if (data.version !== BACKUP_VERSION) {
    throw new Error('このバージョンのバックアップファイルには対応していません')
  }
  if (
    !Array.isArray(data.exercises) ||
    !Array.isArray(data.workoutSets) ||
    !Array.isArray(data.bodyWeights)
  ) {
    throw new Error('バックアップファイルの形式が正しくありません')
  }

  const exercises = checkRows(data.exercises, isExercise, '種目')
  const workoutSets = checkRows(data.workoutSets, isWorkoutSet, '筋トレ記録')
  const bodyWeights = checkRows(data.bodyWeights, isBodyWeight, '体重記録')

  checkUnique(
    exercises.map((e) => e.id),
    '種目',
  )
  checkUnique(
    workoutSets.map((s) => s.id),
    '筋トレ記録',
  )
  checkUnique(
    bodyWeights.map((w) => w.id),
    '体重記録',
  )
  checkUnique(
    bodyWeights.map((w) => w.date),
    '体重記録の日付',
  )
  const exerciseIds = new Set(exercises.map((e) => e.id))
  if (workoutSets.some((s) => !exerciseIds.has(s.exerciseId))) {
    throw new Error('存在しない種目を参照している筋トレ記録があります')
  }

  return {
    app: 'gymlog',
    version: BACKUP_VERSION,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '',
    exercises,
    workoutSets,
    bodyWeights,
  }
}

/** 既存データをすべて置き換えて復元する */
export async function importData(data: BackupData, database: GymDB = defaultDb) {
  await database.transaction(
    'rw',
    [database.exercises, database.workoutSets, database.bodyWeights],
    async () => {
      await Promise.all([
        database.exercises.clear(),
        database.workoutSets.clear(),
        database.bodyWeights.clear(),
      ])
      await database.exercises.bulkAdd(data.exercises)
      await database.workoutSets.bulkAdd(data.workoutSets)
      await database.bodyWeights.bulkAdd(data.bodyWeights)
    },
  )
}

/**
 * JSON をファイルとして保存する。
 * iPhone のホーム画面アプリではダウンロードが動かないことがあるため、
 * スマホでは共有シート (「ファイルに保存」など) が使える場合はそちらを優先する。
 * @returns 保存できたら true、ユーザーがキャンセルしたら false
 */
export async function saveJsonFile(data: unknown, filename: string): Promise<boolean> {
  const json = JSON.stringify(data, null, 2)
  const file = new File([json], filename, { type: 'application/json' })

  const isTouch = window.matchMedia('(pointer: coarse)').matches
  if (isTouch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return true
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return false
      // 共有に失敗した場合は通常のダウンロードにフォールバック
    }
  }

  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // すぐに解放すると Safari でダウンロードが始まらないことがあるため少し待つ
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return true
}
