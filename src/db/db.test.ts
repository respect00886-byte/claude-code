import { beforeEach, describe, expect, it } from 'vitest'
import { GymDB, addSets, lastSetOf, saveBodyWeight } from './db'
import { exportData, importData, parseBackup } from '../lib/backup'

let db: GymDB
beforeEach(async () => {
  db = new GymDB(`test-${Math.random()}`)
  await db.open()
})

describe('db', () => {
  it('seeds default exercises', async () => {
    expect(await db.exercises.count()).toBeGreaterThan(10)
  })

  it('addSets creates one row per set and lastSetOf returns latest', async () => {
    await addSets('2026-09-01', 1, 60, 10, 3, db)
    await addSets('2026-09-05', 1, 62.5, 8, 2, db)
    expect(await db.workoutSets.count()).toBe(5)
    expect(await lastSetOf(1, db)).toEqual({ weight: 62.5, reps: 8, sets: 2, date: '2026-09-05' })
    expect(await lastSetOf(2, db)).toBeUndefined()
  })

  it('saveBodyWeight overwrites same date', async () => {
    await saveBodyWeight('2026-09-01', 70, undefined, db)
    await saveBodyWeight('2026-09-01', 69.5, undefined, db)
    const all = await db.bodyWeights.toArray()
    expect(all).toHaveLength(1)
    expect(all[0].weight).toBe(69.5)
  })

  it('backup round-trips', async () => {
    await addSets('2026-09-01', 1, 60, 10, 3, db)
    await saveBodyWeight('2026-09-01', 70, undefined, db)
    const json = JSON.stringify(await exportData(db))

    const other = new GymDB(`test-${Math.random()}`)
    await importData(parseBackup(json), other)
    expect(await other.workoutSets.count()).toBe(3)
    expect(await other.bodyWeights.count()).toBe(1)
    expect(await other.exercises.count()).toBe(await db.exercises.count())
  })

  it('parseBackup rejects invalid files', () => {
    expect(() => parseBackup('nope')).toThrow()
    expect(() => parseBackup('{"app":"other"}')).toThrow()
  })
})
