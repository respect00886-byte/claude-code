import { describe, expect, it } from 'vitest'
import { addDays, isDateKey } from './date'

describe('date', () => {
  it('isDateKey accepts only real YYYY-MM-DD dates', () => {
    expect(isDateKey('2026-09-28')).toBe(true)
    expect(isDateKey('2024-02-29')).toBe(true)
    expect(isDateKey('2026-02-30')).toBe(false)
    expect(isDateKey('2026-9-28')).toBe(false)
    expect(isDateKey('abc')).toBe(false)
  })

  it('addDays crosses month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
})
