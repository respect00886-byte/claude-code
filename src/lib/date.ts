/** ローカル日付を YYYY-MM-DD で返す */
export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** YYYY-MM-DD 形式の実在する日付か */
export function isDateKey(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const [y, m, d] = v.split('-').map(Number)
  return toDateKey(new Date(y, m - 1, d)) === v
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return toDateKey(new Date(y, m - 1, d + days))
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

/** 9/28(月) 形式 */
export function formatDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const w = WEEKDAYS[new Date(y, m - 1, d).getDay()]
  return `${m}/${d}(${w})`
}

/** 9/28 形式 (グラフ軸用) */
export function formatShort(key: string): string {
  const [, m, d] = key.split('-').map(Number)
  return `${m}/${d}`
}
