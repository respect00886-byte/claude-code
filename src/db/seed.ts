import type { Category, ExerciseKind } from './db'

interface SeedExercise {
  name: string
  category: Category
  /** bodyweight = 自重種目 (重量は加重分) */
  kind: ExerciseKind
  /** ステッパーの重量の刻み (kg) */
  step: number
}

const BARBELL = { kind: 'weighted', step: 2.5 } as const
const DUMBBELL = { kind: 'weighted', step: 1 } as const
const MACHINE = { kind: 'weighted', step: 5 } as const
const BODYWEIGHT = { kind: 'bodyweight', step: 2.5 } as const

export const SEED_EXERCISES: SeedExercise[] = [
  { name: 'ベンチプレス', category: '胸', ...BARBELL },
  { name: 'インクラインベンチプレス', category: '胸', ...BARBELL },
  { name: 'ダンベルフライ', category: '胸', ...DUMBBELL },
  { name: 'チェストプレス', category: '胸', ...MACHINE },
  { name: 'ディップス', category: '胸', ...BODYWEIGHT },
  { name: 'デッドリフト', category: '背中', ...BARBELL },
  { name: 'ラットプルダウン', category: '背中', ...MACHINE },
  { name: '懸垂', category: '背中', ...BODYWEIGHT },
  { name: 'ベントオーバーロウ', category: '背中', ...BARBELL },
  { name: 'シーテッドロウ', category: '背中', ...MACHINE },
  { name: 'スクワット', category: '脚', ...BARBELL },
  { name: 'レッグプレス', category: '脚', ...MACHINE },
  { name: 'レッグエクステンション', category: '脚', ...MACHINE },
  { name: 'レッグカール', category: '脚', ...MACHINE },
  { name: 'ブルガリアンスクワット', category: '脚', ...DUMBBELL },
  { name: 'ショルダープレス', category: '肩', ...BARBELL },
  { name: 'サイドレイズ', category: '肩', ...DUMBBELL },
  { name: 'リアレイズ', category: '肩', ...DUMBBELL },
  { name: 'バーベルカール', category: '腕', ...BARBELL },
  { name: 'ダンベルカール', category: '腕', ...DUMBBELL },
  { name: 'トライセプスエクステンション', category: '腕', ...DUMBBELL },
  { name: 'ケーブルプッシュダウン', category: '腕', ...MACHINE },
  { name: 'クランチ', category: '腹', ...BODYWEIGHT },
  { name: 'アブローラー', category: '腹', ...BODYWEIGHT },
]

/** 名前から初期種目の設定を探す (旧データの移行用)。見つからなければ一般的なバーベル設定 */
export function seedDefaults(name: string): { kind: ExerciseKind; step: number } {
  const seed = SEED_EXERCISES.find((e) => e.name === name)
  return seed ? { kind: seed.kind, step: seed.step } : { ...BARBELL }
}
