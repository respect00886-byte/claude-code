import { getSettings, type WeightUnit } from './settings'

/** 1 lb = 0.45359237 kg (国際ポンド) */
export const KG_PER_LB = 0.45359237

/** 保存値 (kg) を表示単位に変換 */
export function toUnit(kg: number, unit: WeightUnit = getSettings().unit): number {
  return unit === 'lb' ? kg / KG_PER_LB : kg
}

/** 表示単位の値を保存用の kg に変換 */
export function fromUnit(value: number, unit: WeightUnit = getSettings().unit): number {
  return unit === 'lb' ? value * KG_PER_LB : value
}

/** kg の刻みに対応する lb の刻み (プレートの一般的な刻みに合わせる) */
const LB_STEPS: Record<number, number> = { 0.5: 1, 1: 2.5, 1.25: 2.5, 2: 5, 2.5: 5, 5: 10 }

export function stepInUnit(kgStep: number, unit: WeightUnit = getSettings().unit): number {
  if (unit === 'kg') return kgStep
  return LB_STEPS[kgStep] ?? Math.round((kgStep / KG_PER_LB) * 2) / 2
}

/** 画面に表示する単位の文字 */
export function unitLabel(unit: WeightUnit = getSettings().unit): string {
  return unit
}

/**
 * 表示用に丸めた重量 (設定中の単位)。
 * kg は 1.25kg プレートなどに合わせて小数2桁、lb は小数1桁 (kg からの換算で桁が増えすぎないように)
 */
export function displayWeight(kg: number, unit: WeightUnit = getSettings().unit): number {
  const digits = unit === 'lb' ? 10 : 100
  return Math.round(toUnit(kg, unit) * digits) / digits
}
