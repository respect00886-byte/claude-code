import { describe, expect, it } from 'vitest'
import type { WorkoutSet } from '../db/db'
import {
  categoryDailyStats,
  volumeByCategory,
  dailyStats,
  describeSets,
  estimate1RM,
  formatLoad,
  groupSets,
  personalBest,
  volume,
} from './stats'

let id = 0
const set = (date: string, weight: number, reps: number): WorkoutSet => ({
  id: ++id,
  date,
  exerciseId: 1,
  weight,
  reps,
  createdAt: id,
})

describe('stats', () => {
  it('estimate1RM uses Epley formula', () => {
    expect(estimate1RM(100, 1)).toBe(100)
    expect(estimate1RM(60, 10)).toBe(80)
    expect(estimate1RM(60, 0)).toBe(0)
  })

  it('volume sums weight × reps', () => {
    expect(volume([set('2026-09-01', 60, 10), set('2026-09-01', 70, 5)])).toBe(950)
  })

  it('groupSets merges consecutive identical sets', () => {
    const g = groupSets([
      set('d', 60, 10),
      set('d', 60, 10),
      set('d', 60, 10),
      set('d', 70, 8),
      set('d', 60, 10),
    ])
    expect(g.map((x) => [x.weight, x.reps, x.count])).toEqual([
      [60, 10, 3],
      [70, 8, 1],
      [60, 10, 1],
    ])
  })

  it('groupSets orders by createdAt so inserted sets join their group', () => {
    const a = set('d', 60, 10)
    const b = set('d', 70, 8)
    const inserted = { ...set('d', 60, 10), createdAt: a.createdAt }
    expect(groupSets([a, b, inserted]).map((x) => [x.weight, x.count])).toEqual([
      [60, 2],
      [70, 1],
    ])
  })

  it('dailyStats aggregates by date in order', () => {
    const s = dailyStats([
      set('2026-09-03', 80, 5),
      set('2026-09-01', 60, 10),
      set('2026-09-01', 65, 8),
    ])
    expect(s.map((x) => x.date)).toEqual(['2026-09-01', '2026-09-03'])
    expect(s[0].maxWeight).toBe(65)
    expect(s[0].volume).toBe(600 + 520)
  })

  it('personalBest finds max weight and best 1RM', () => {
    const pb = personalBest([set('2026-09-01', 60, 12), set('2026-09-02', 70, 3)])
    expect(pb).toMatchObject({
      maxWeight: 70,
      maxWeightDate: '2026-09-02',
      best1RM: 84,
      best1RMDate: '2026-09-01',
    })
    expect(personalBest([])).toBeUndefined()
  })

  it('dailyStats and personalBest track reps', () => {
    const sets = [set('2026-09-01', 0, 8), set('2026-09-01', 0, 12), set('2026-09-02', 10, 6)]
    expect(dailyStats(sets)[0]).toMatchObject({ maxReps: 12, totalReps: 20 })
    expect(personalBest(sets)).toMatchObject({ maxReps: 12, maxRepsDate: '2026-09-01' })
  })

  it('formatLoad shows bodyweight exercises as 自重', () => {
    expect(formatLoad(62.5)).toBe('62.5kg')
    expect(formatLoad(0, 'bodyweight')).toBe('自重')
    expect(formatLoad(10, 'bodyweight')).toBe('自重+10kg')
    expect(describeSets({ weight: 0, reps: 10, sets: 3 }, 'bodyweight')).toBe('自重×10回×3セット')
  })

  it('volumeByCategory sums per body part in category order and counts bodyweight reps', () => {
    const exercises = new Map([
      [1, { category: '胸' as const, kind: 'weighted' as const }],
      [8, { category: '背中' as const, kind: 'bodyweight' as const }],
      [11, { category: '脚' as const, kind: 'weighted' as const }],
    ])
    const rows = volumeByCategory(
      [
        { ...set('d', 80, 5), exerciseId: 11 },
        { ...set('d', 60, 10), exerciseId: 1 },
        { ...set('d', 0, 8), exerciseId: 8 },
        { ...set('d', 10, 5), exerciseId: 8 },
        { ...set('d', 60, 8), exerciseId: 1 },
      ],
      exercises,
    )
    expect(rows).toEqual([
      { category: '胸', volume: 1080, bodyweightReps: 0, sets: 2 },
      { category: '背中', volume: 50, bodyweightReps: 13, sets: 2 },
      { category: '脚', volume: 400, bodyweightReps: 0, sets: 1 },
    ])
  })

  it('categoryDailyStats aggregates one body part by date', () => {
    const exercises = new Map([
      [1, { category: '胸' as const, kind: 'weighted' as const }],
      [2, { category: '胸' as const, kind: 'weighted' as const }],
      [11, { category: '脚' as const, kind: 'weighted' as const }],
    ])
    const rows = categoryDailyStats(
      [
        { ...set('2026-09-03', 60, 10), exerciseId: 1 },
        { ...set('2026-09-01', 50, 10), exerciseId: 2 },
        { ...set('2026-09-01', 60, 10), exerciseId: 1 },
        { ...set('2026-09-01', 100, 5), exerciseId: 11 },
      ],
      exercises,
      '胸',
    )
    expect(rows).toEqual([
      { date: '2026-09-01', volume: 1100, sets: 2 },
      { date: '2026-09-03', volume: 600, sets: 1 },
    ])
  })
})
