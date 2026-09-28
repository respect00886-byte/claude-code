import { beforeEach, describe, expect, it } from 'vitest'
import {
  GymDB,
  addSets,
  deleteBodyWeight,
  deleteSets,
  lastSetOf,
  saveBodyWeight,
  updateSetGroup,
} from './db'
import { exportData, importData, parseBackup } from '../lib/backup'
import { groupSets } from '../lib/stats'

let db: GymDB
beforeEach(async () => {
  db = new GymDB(`test-${Math.random()}`)
  await db.open()
})

const summary = async () =>
  groupSets(await db.workoutSets.toArray()).map((g) => [g.weight, g.reps, g.count])

describe('db', () => {
  it('seeds default exercises', async () => {
    expect(await db.exercises.count()).toBeGreaterThan(10)
  })

  it('addSets creates one row per set and returns their ids', async () => {
    const ids = await addSets('2026-09-01', 1, 60, 10, 3, db)
    expect(ids).toHaveLength(3)
    expect(await db.workoutSets.bulkGet(ids)).not.toContain(undefined)
  })

  it('lastSetOf returns the latest entry', async () => {
    await addSets('2026-09-01', 1, 60, 10, 3, db)
    await addSets('2026-09-05', 1, 62.5, 8, 2, db)
    expect(await lastSetOf(1, undefined, db)).toEqual({
      weight: 62.5,
      reps: 8,
      sets: 2,
      date: '2026-09-05',
    })
    expect(await lastSetOf(2, undefined, db)).toBeUndefined()
  })

  it('lastSetOf with beforeDate skips that day and later, even if entered later', async () => {
    await addSets('2026-09-05', 1, 62.5, 8, 2, db)
    // 過去の日付に後から追加しても「前回」は日付順で決まる
    await addSets('2026-09-01', 1, 60, 10, 3, db)
    expect((await lastSetOf(1, '2026-09-05', db))?.date).toBe('2026-09-01')
    expect((await lastSetOf(1, '2026-09-10', db))?.date).toBe('2026-09-05')
    expect(await lastSetOf(1, '2026-09-01', db)).toBeUndefined()
  })

  it('migrates v1 exercises to have kind and step', async () => {
    const name = `migrate-${Math.random()}`
    const { default: Dexie } = await import('dexie')
    const v1 = new Dexie(name)
    v1.version(1).stores({
      exercises: '++id, name, category',
      workoutSets: '++id, date, exerciseId, [exerciseId+date], createdAt',
      bodyWeights: '++id, &date',
    })
    await v1.table('exercises').bulkAdd([
      { name: '懸垂', category: '背中', isCustom: false, archived: false },
      { name: 'マイ種目', category: 'その他', isCustom: true, archived: false },
    ])
    v1.close()
    const v2 = new GymDB(name)
    const rows = await v2.exercises.toArray()
    expect(rows.map((e) => [e.name, e.kind, e.step])).toEqual([
      ['懸垂', 'bodyweight', 2.5],
      ['マイ種目', 'weighted', 2.5],
    ])
  })

  it('deleteSets can be undone', async () => {
    const ids = await addSets('2026-09-01', 1, 60, 10, 3, db)
    const undo = await deleteSets(ids.slice(0, 2), db)
    expect(await db.workoutSets.count()).toBe(1)
    await undo()
    expect(await summary()).toEqual([[60, 10, 3]])
  })

  describe('updateSetGroup', () => {
    it('changes weight/reps and adds sets in the same position', async () => {
      const ids = await addSets('2026-09-01', 1, 60, 10, 2, db, 1000)
      await addSets('2026-09-01', 1, 70, 5, 1, db, 2000)
      await updateSetGroup(ids, { weight: 65, reps: 8, sets: 4 }, db)
      expect(await summary()).toEqual([
        [65, 8, 4],
        [70, 5, 1],
      ])
    })

    it('removes surplus sets', async () => {
      const ids = await addSets('2026-09-01', 1, 60, 10, 4, db)
      await updateSetGroup(ids, { weight: 60, reps: 10, sets: 1 }, db)
      expect(await summary()).toEqual([[60, 10, 1]])
    })

    it('can be undone after adding sets', async () => {
      const ids = await addSets('2026-09-01', 1, 60, 10, 2, db)
      const undo = await updateSetGroup(ids, { weight: 80, reps: 3, sets: 5 }, db)
      await undo()
      expect(await summary()).toEqual([[60, 10, 2]])
    })

    it('can be undone after removing sets', async () => {
      const ids = await addSets('2026-09-01', 1, 60, 10, 3, db)
      const undo = await updateSetGroup(ids, { weight: 60, reps: 10, sets: 1 }, db)
      await undo()
      expect(await summary()).toEqual([[60, 10, 3]])
    })
  })

  it('saveBodyWeight overwrites same date', async () => {
    await saveBodyWeight('2026-09-01', 70, undefined, db)
    await saveBodyWeight('2026-09-01', 69.5, undefined, db)
    const all = await db.bodyWeights.toArray()
    expect(all).toHaveLength(1)
    expect(all[0].weight).toBe(69.5)
  })

  it('deleteBodyWeight can be undone', async () => {
    await saveBodyWeight('2026-09-01', 70, 18.5, db)
    const [rec] = await db.bodyWeights.toArray()
    const undo = await deleteBodyWeight(rec.id, db)
    expect(await db.bodyWeights.count()).toBe(0)
    await undo()
    expect(await db.bodyWeights.toArray()).toEqual([rec])
  })
})

describe('backup', () => {
  it('round-trips', async () => {
    await addSets('2026-09-01', 1, 60, 10, 3, db)
    await saveBodyWeight('2026-09-01', 70, undefined, db)
    const json = JSON.stringify(await exportData(db))

    const other = new GymDB(`test-${Math.random()}`)
    await importData(parseBackup(json), other)
    expect(await other.workoutSets.count()).toBe(3)
    expect(await other.bodyWeights.count()).toBe(1)
    expect(await other.exercises.count()).toBe(await db.exercises.count())
  })

  const valid = async () => {
    await addSets('2026-09-01', 1, 60, 10, 1, db)
    await saveBodyWeight('2026-09-01', 70, undefined, db)
    return JSON.parse(JSON.stringify(await exportData(db)))
  }

  it('rejects non-backup files', () => {
    expect(() => parseBackup('nope')).toThrow('JSON')
    expect(() => parseBackup('{"app":"other"}')).toThrow('GymLog')
  })

  it('reads v1 files by filling in kind and step', async () => {
    const data = await valid()
    data.version = 1
    for (const e of data.exercises) {
      delete e.kind
      delete e.step
    }
    delete data.routines
    delete data.plans
    delete data.notes
    delete data.settings
    const parsed = parseBackup(JSON.stringify(data))
    expect(parsed.version).toBe(3)
    expect(parsed.routines).toEqual([])
    expect(parsed.exercises.find((e) => e.name === '懸垂')).toMatchObject({
      kind: 'bodyweight',
      step: 2.5,
    })
    expect(parsed.exercises.find((e) => e.name === 'ダンベルカール')?.step).toBe(1)
  })

  it('rejects unsupported versions', async () => {
    const data = await valid()
    data.version = 4
    expect(() => parseBackup(JSON.stringify(data))).toThrow('バージョン')
  })

  it('rejects rows with missing or wrong-typed fields', async () => {
    const noDate = await valid()
    delete noDate.workoutSets[0].date
    expect(() => parseBackup(JSON.stringify(noDate))).toThrow('筋トレ記録の1件目')

    const stringWeight = await valid()
    stringWeight.workoutSets[0].weight = '60'
    expect(() => parseBackup(JSON.stringify(stringWeight))).toThrow('筋トレ記録の1件目')

    const badDate = await valid()
    badDate.bodyWeights[0].date = '2026-02-30'
    expect(() => parseBackup(JSON.stringify(badDate))).toThrow('体重記録の1件目')
  })

  it('rejects duplicate ids and dates', async () => {
    const dupId = await valid()
    dupId.workoutSets.push({ ...dupId.workoutSets[0] })
    expect(() => parseBackup(JSON.stringify(dupId))).toThrow('重複')

    const dupDate = await valid()
    dupDate.bodyWeights.push({ ...dupDate.bodyWeights[0], id: 99 })
    expect(() => parseBackup(JSON.stringify(dupDate))).toThrow('重複')
  })

  it('round-trips routines, plans and notes', async () => {
    const { addPlan, saveNote, saveRoutine } = await import('./menu')
    await saveRoutine('胸の日', [{ exerciseId: 1, weight: 60, reps: 10, sets: 3 }], db)
    await addPlan('2026-09-02', [{ exerciseId: 1, weight: 60, reps: 10, sets: 3 }], db)
    await saveNote('2026-09-02', 0, '寝不足', db)
    const json = JSON.stringify(await exportData(db))
    const other = new GymDB(`test-${Math.random()}`)
    await importData(parseBackup(json), other)
    expect(await other.routines.count()).toBe(1)
    expect(await other.plans.count()).toBe(1)
    expect((await other.notes.toArray())[0].text).toBe('寝不足')
  })

  it('rejects routines that reference unknown exercises', async () => {
    const data = await valid()
    data.routines = [
      {
        id: 1,
        name: 'x',
        createdAt: 1,
        items: [{ exerciseId: 9999, weight: 1, reps: 1, sets: 1 }],
      },
    ]
    expect(() => parseBackup(JSON.stringify(data))).toThrow('存在しない種目')
  })

  it('rejects sets that reference unknown exercises', async () => {
    const data = await valid()
    data.workoutSets[0].exerciseId = 9999
    expect(() => parseBackup(JSON.stringify(data))).toThrow('存在しない種目')
  })
})
