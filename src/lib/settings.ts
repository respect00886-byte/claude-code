import { useSyncExternalStore } from 'react'

export type WeightUnit = 'kg' | 'lb'

export interface Settings {
  /** 重量の表示・入力の単位 (保存は常に kg) */
  unit: WeightUnit
}

export const DEFAULT_SETTINGS: Settings = { unit: 'kg' }

const KEY = 'gymlog:settings'

/** 保存されていた値のうち正しいものだけを採用する */
export function sanitizeSettings(v: unknown): Settings {
  const s = { ...DEFAULT_SETTINGS }
  if (typeof v !== 'object' || v === null) return s
  const o = v as Record<string, unknown>
  if (o.unit === 'kg' || o.unit === 'lb') s.unit = o.unit
  return s
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    return sanitizeSettings(raw ? JSON.parse(raw) : undefined)
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

let current: Settings = load()
const listeners = new Set<() => void>()

export function getSettings(): Settings {
  return current
}

export function updateSettings(patch: Partial<Settings>) {
  current = sanitizeSettings({ ...current, ...patch })
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    // 保存できなくてもこのセッション中は有効
  }
  listeners.forEach((l) => l())
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}
