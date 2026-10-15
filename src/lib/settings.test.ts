import { describe, expect, it } from 'vitest'
import { sanitizeSettings } from './settings'

describe('settings', () => {
  it('weeklyGoal defaults to 2 when missing or invalid', () => {
    expect(sanitizeSettings({ unit: 'lb' })).toEqual({ unit: 'lb', weeklyGoal: 2 })
    expect(sanitizeSettings({ weeklyGoal: 0 }).weeklyGoal).toBe(2)
    expect(sanitizeSettings({ weeklyGoal: 8 }).weeklyGoal).toBe(2)
    expect(sanitizeSettings({ weeklyGoal: 2.5 }).weeklyGoal).toBe(2)
    expect(sanitizeSettings({ weeklyGoal: '3' }).weeklyGoal).toBe(2)
  })

  it('keeps a valid weeklyGoal', () => {
    expect(sanitizeSettings({ weeklyGoal: 4 }).weeklyGoal).toBe(4)
  })
})
