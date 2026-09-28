import { describe, expect, it } from 'vitest'
import { fromUnit, stepInUnit, toUnit } from './units'
import { fmt } from './stats'

describe('units', () => {
  it('converts kg <-> lb', () => {
    expect(toUnit(100, 'kg')).toBe(100)
    expect(fmt(toUnit(100, 'lb'))).toBe('220.46')
    expect(fromUnit(135, 'lb')).toBeCloseTo(61.235, 3)
  })

  it('round-trips lb input without visible drift', () => {
    for (const lb of [45, 95, 135, 225, 317.5]) {
      expect(fmt(toUnit(fromUnit(lb, 'lb'), 'lb'))).toBe(fmt(lb))
    }
  })

  it('maps kg steps to plate-friendly lb steps', () => {
    expect(stepInUnit(2.5, 'lb')).toBe(5)
    expect(stepInUnit(1, 'lb')).toBe(2.5)
    expect(stepInUnit(5, 'lb')).toBe(10)
    expect(stepInUnit(2.5, 'kg')).toBe(2.5)
  })
})
