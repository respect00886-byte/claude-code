import { describe, expect, it } from 'vitest'
import type { WorkoutSet } from '../db/db'
import { dailyStats, estimate1RM, groupSets, personalBest, volume } from './stats'

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
})
