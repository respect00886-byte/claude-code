import { beforeEach, describe, expect, it } from 'vitest'
import { DAY_NOTE, GymDB, addSets } from './db'
import {
  addPlan,
  menuOfDay,
  previousNote,
  previousWorkoutDate,
  removePlan,
  saveNote,
  saveRoutine,
} from './menu'

let db: GymDB
beforeEach(async () => {
  db = new GymDB(`test-${Math.random()}`)
  await db.open()
})

describe('menu', () => {
  it('menuOfDay summarises each exercise by its last set and set count', async () => {
    await addSets('2026-09-01', 1, 60, 10, 2, db)
    await addSets('2026-09-01', 11, 80, 5, 3, db)
    await addSets('2026-09-01', 1, 62.5, 8, 1, db)
    expect(await menuOfDay('2026-09-01', db)).toEqual([
      { exerciseId: 1, weight: 62.5, reps: 8, sets: 3 },
      { exerciseId: 11, weight: 80, reps: 5, sets: 3 },
    ])
  })

  it('menuOfDay keeps planned exercises that were not done yet', async () => {
    await addPlan('2026-09-02', [{ exerciseId: 6, weight: 100, reps: 5, sets: 3 }], db)
    await addSets('2026-09-02', 1, 60, 10, 1, db)
    expect((await menuOfDay('2026-09-02', db)).map((m) => m.exerciseId)).toEqual([6, 1])
  })

  it('previousWorkoutDate finds the latest earlier day with sets', async () => {
    await addSets('2026-09-01', 1, 60, 10, 1, db)
    await addSets('2026-09-05', 1, 60, 10, 1, db)
    expect(await previousWorkoutDate('2026-09-05', db)).toBe('2026-09-01')
    expect(await previousWorkoutDate('2026-09-10', db)).toBe('2026-09-05')
    expect(await previousWorkoutDate('2026-09-01', db)).toBeUndefined()
  })

  it('addPlan skips exercises already planned or done, and can be undone', async () => {
    await addSets('2026-09-03', 1, 60, 10, 1, db)
    await addPlan('2026-09-03', [{ exerciseId: 6, weight: 100, reps: 5, sets: 3 }], db)
    const undo = await addPlan(
      '2026-09-03',
      [
        { exerciseId: 1, weight: 60, reps: 10, sets: 3 },
        { exerciseId: 6, weight: 100, reps: 5, sets: 3 },
        { exerciseId: 11, weight: 80, reps: 5, sets: 3 },
      ],
      db,
    )
    const plans = await db.plans.where('date').equals('2026-09-03').sortBy('order')
    expect(plans.map((p) => [p.exerciseId, p.order])).toEqual([
      [6, 1],
      [11, 2],
    ])
    await undo()
    expect(await db.plans.count()).toBe(1)
  })

  it('removePlan can be undone', async () => {
    await addPlan('2026-09-03', [{ exerciseId: 6, weight: 100, reps: 5, sets: 3 }], db)
    const undo = await removePlan('2026-09-03', 6, db)
    expect(await db.plans.count()).toBe(0)
    await undo()
    expect(await db.plans.count()).toBe(1)
  })

  it('saveRoutine overwrites a routine with the same name', async () => {
    await saveRoutine('胸の日', [{ exerciseId: 1, weight: 60, reps: 10, sets: 3 }], db)
    await saveRoutine('胸の日', [{ exerciseId: 2, weight: 40, reps: 10, sets: 3 }], db)
    const all = await db.routines.toArray()
    expect(all).toHaveLength(1)
    expect(all[0].items[0].exerciseId).toBe(2)
  })

  it('saveNote upserts and deletes empty notes; previousNote finds the latest earlier one', async () => {
    await saveNote('2026-09-01', 1, 'フォーム意識', db)
    await saveNote('2026-09-03', 1, '肩が痛い', db)
    await saveNote('2026-09-03', 1, '  肩が少し痛い ', db)
    await saveNote('2026-09-03', DAY_NOTE, '寝不足', db)
    expect(await db.notes.count()).toBe(3)
    expect((await previousNote(1, '2026-09-05', db))?.text).toBe('肩が少し痛い')
    expect((await previousNote(1, '2026-09-03', db))?.text).toBe('フォーム意識')
    await saveNote('2026-09-03', DAY_NOTE, '   ', db)
    expect(await db.notes.count()).toBe(2)
  })
})
