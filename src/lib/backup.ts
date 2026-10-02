import {
  CATEGORIES,
  EXERCISE_KINDS,
  db as defaultDb,
  type BodyWeight,
  type Exercise,
  type GymDB,
  type MenuItem,
  type Note,
  type PlanItem,
  type Routine,
  type WorkoutSet,
} from '../db/db'
import { seedDefaults } from '../db/seed'
import { isDateKey } from './date'
import { getSettings, sanitizeSettings, updateSettings, type Settings } from './settings'

/**
 * v2: 種目に kind (自重種目) と step (重量の刻み) を追加
 * v3: ルーティン・予定・メモ・設定 (単位) を追加
 * 古いバージョンのファイルも読み込める
 */
export const BACKUP_VERSION = 3

export interface BackupData {
  app: 'gymlog'
  version: typeof BACKUP_VERSION
  exportedAt: string
  exercises: Exercise[]
  workoutSets: WorkoutSet[]
  bodyWeights: BodyWeight[]
  routines: Routine[]
  plans: PlanItem[]
  notes: Note[]
  settings: Settings
}

export async function exportData(database: GymDB = defaultDb): Promise<BackupData> {
  return {
    app: 'gymlog',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    exercises: await database.exercises.toArray(),
    workoutSets: await database.workoutSets.toArray(),
    bodyWeights: await database.bodyWeights.toArray(),
    routines: await database.routines.toArray(),
    plans: await database.plans.toArray(),
    notes: await database.notes.toArray(),
    settings: getSettings(),
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
    typeof v.archived === 'boolean' &&
    (EXERCISE_KINDS as readonly unknown[]).includes(v.kind) &&
    isNum(v.step, 0.01, 100) &&
    (v.inputUnit === undefined || v.inputUnit === 'kg' || v.inputUnit === 'lb')
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

function isMenuItem(v: unknown): v is MenuItem {
  return (
    isObj(v) &&
    isId(v.exerciseId) &&
    isNum(v.weight, 0, 10000) &&
    Number.isInteger(v.reps) &&
    isNum(v.reps, 0, 10000) &&
    Number.isInteger(v.sets) &&
    isNum(v.sets, 1, 100)
  )
}

function isRoutine(v: unknown): v is Routine {
  return (
    isObj(v) &&
    isId(v.id) &&
    typeof v.name === 'string' &&
    v.name.length > 0 &&
    Array.isArray(v.items) &&
    v.items.every(isMenuItem) &&
    isNum(v.createdAt)
  )
}

function isPlanItem(v: unknown): v is PlanItem {
  return isMenuItem(v) && isObj(v) && isId(v.id) && isDate(v.date) && isNum(v.order)
}

function isNote(v: unknown): v is Note {
  return (
    isObj(v) &&
    isId(v.id) &&
    isDate(v.date) &&
    Number.isInteger(v.exerciseId) &&
    isNum(v.exerciseId) &&
    typeof v.text === 'string'
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
  if (data.version !== 1 && data.version !== 2 && data.version !== BACKUP_VERSION) {
    throw new Error('このバージョンのバックアップファイルには対応していません')
  }
  if (data.version === 1 && Array.isArray(data.exercises)) {
    // v1 には kind / step がないので初期種目の設定で補う
    data.exercises = data.exercises.map((e) =>
      isObj(e) && typeof e.name === 'string' ? { ...seedDefaults(e.name), ...e } : e,
    )
  }
  if (data.version !== BACKUP_VERSION) {
    // v2 以前にはルーティン・予定・メモがない
    data.routines ??= []
    data.plans ??= []
    data.notes ??= []
  }
  if (
    !Array.isArray(data.exercises) ||
    !Array.isArray(data.workoutSets) ||
    !Array.isArray(data.bodyWeights) ||
    !Array.isArray(data.routines) ||
    !Array.isArray(data.plans) ||
    !Array.isArray(data.notes)
  ) {
    throw new Error('バックアップファイルの形式が正しくありません')
  }

  const exercises = checkRows(data.exercises, isExercise, '種目')
  const workoutSets = checkRows(data.workoutSets, isWorkoutSet, '筋トレ記録')
  const bodyWeights = checkRows(data.bodyWeights, isBodyWeight, '体重記録')
  const routines = checkRows(data.routines, isRoutine, 'ルーティン')
  const plans = checkRows(data.plans, isPlanItem, '予定')
  const notes = checkRows(data.notes, isNote, 'メモ')

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
  checkUnique(
    routines.map((r) => r.id),
    'ルーティン',
  )
  checkUnique(
    plans.map((p) => `${p.date}/${p.exerciseId}`),
    '予定',
  )
  checkUnique(
    notes.map((n) => `${n.date}/${n.exerciseId}`),
    'メモ',
  )
  const exerciseIds = new Set(exercises.map((e) => e.id))
  if (workoutSets.some((s) => !exerciseIds.has(s.exerciseId))) {
    throw new Error('存在しない種目を参照している筋トレ記録があります')
  }
  if (
    routines.some((r) => r.items.some((it) => !exerciseIds.has(it.exerciseId))) ||
    plans.some((p) => !exerciseIds.has(p.exerciseId))
  ) {
    throw new Error('存在しない種目を参照しているルーティンまたは予定があります')
  }

  return {
    app: 'gymlog',
    version: BACKUP_VERSION,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '',
    exercises,
    workoutSets,
    bodyWeights,
    routines,
    plans,
    notes,
    settings: sanitizeSettings(data.settings ?? getSettings()),
  }
}

/** 既存データをすべて置き換えて復元する */
export async function importData(data: BackupData, database: GymDB = defaultDb) {
  const tables = [
    database.exercises,
    database.workoutSets,
    database.bodyWeights,
    database.routines,
    database.plans,
    database.notes,
  ]
  await database.transaction('rw', tables, async () => {
    await Promise.all(tables.map((t) => t.clear()))
    await database.exercises.bulkAdd(data.exercises)
    await database.workoutSets.bulkAdd(data.workoutSets)
    await database.bodyWeights.bulkAdd(data.bodyWeights)
    await database.routines.bulkAdd(data.routines)
    await database.plans.bulkAdd(data.plans)
    await database.notes.bulkAdd(data.notes)
  })
  updateSettings(data.settings)
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
