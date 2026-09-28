import type { WorkoutSet } from '../db/db'

/** Epley 式による推定 1RM */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

export function volume(sets: Pick<WorkoutSet, 'weight' | 'reps'>[]): number {
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
}

export interface SetGroup {
  weight: number
  reps: number
  count: number
  ids: number[]
  createdAt: number
}

/** 入力順 (createdAt → id) に並べる */
export function byInputOrder(a: WorkoutSet, b: WorkoutSet): number {
  return a.createdAt - b.createdAt || a.id - b.id
}

/** 連続する同じ重量×回数のセットを「60kg × 10回 × 3セット」形式にまとめる */
export function groupSets(sets: WorkoutSet[]): SetGroup[] {
  const sorted = [...sets].sort(byInputOrder)
  const groups: SetGroup[] = []
  for (const s of sorted) {
    const last = groups.at(-1)
    if (last && last.weight === s.weight && last.reps === s.reps) {
      last.count++
      last.ids.push(s.id)
    } else {
      groups.push({ weight: s.weight, reps: s.reps, count: 1, ids: [s.id], createdAt: s.createdAt })
    }
  }
  return groups
}

export interface DailyStat {
  date: string
  maxWeight: number
  est1RM: number
  volume: number
}

/** 種目のセット一覧から日別の最大重量・推定1RM・総ボリュームを算出 */
export function dailyStats(sets: WorkoutSet[]): DailyStat[] {
  const byDate = new Map<string, WorkoutSet[]>()
  for (const s of sets) {
    const list = byDate.get(s.date) ?? []
    list.push(s)
    byDate.set(s.date, list)
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({
      date,
      maxWeight: Math.max(...list.map((s) => s.weight)),
      est1RM: Math.max(...list.map((s) => estimate1RM(s.weight, s.reps))),
      volume: volume(list),
    }))
}

export interface PersonalBest {
  maxWeight: number
  maxWeightDate: string
  best1RM: number
  best1RMDate: string
}

export function personalBest(sets: WorkoutSet[]): PersonalBest | undefined {
  if (sets.length === 0) return undefined
  let pb: PersonalBest = { maxWeight: -1, maxWeightDate: '', best1RM: -1, best1RMDate: '' }
  for (const s of sets) {
    const e = estimate1RM(s.weight, s.reps)
    if (s.weight > pb.maxWeight) pb = { ...pb, maxWeight: s.weight, maxWeightDate: s.date }
    if (e > pb.best1RM) pb = { ...pb, best1RM: e, best1RMDate: s.date }
  }
  return pb
}

/** 数値を見やすく (60, 62.5, 1,250) */
export function fmt(n: number): string {
  return n.toLocaleString('ja-JP', { maximumFractionDigits: 2 })
}
