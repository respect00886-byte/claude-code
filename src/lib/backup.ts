import {
  db as defaultDb,
  type BodyWeight,
  type Exercise,
  type GymDB,
  type WorkoutSet,
} from '../db/db'

export interface BackupData {
  app: 'gymlog'
  version: 1
  exportedAt: string
  exercises: Exercise[]
  workoutSets: WorkoutSet[]
  bodyWeights: BodyWeight[]
}

export async function exportData(database: GymDB = defaultDb): Promise<BackupData> {
  return {
    app: 'gymlog',
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises: await database.exercises.toArray(),
    workoutSets: await database.workoutSets.toArray(),
    bodyWeights: await database.bodyWeights.toArray(),
  }
}

export function parseBackup(text: string): BackupData {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('JSON として読み込めませんでした')
  }
  const d = data as Partial<BackupData>
  if (
    d?.app !== 'gymlog' ||
    !Array.isArray(d.exercises) ||
    !Array.isArray(d.workoutSets) ||
    !Array.isArray(d.bodyWeights)
  ) {
    throw new Error('GymLog のバックアップファイルではありません')
  }
  return d as BackupData
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

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
