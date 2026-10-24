import { describe, expect, it } from 'vitest'
import { formatMoney } from './money'

describe('formatMoney', () => {
  it('uses Indian digit grouping', () => {
    expect(formatMoney('100000000.00', { paise: true })).toBe('₹10,00,00,000.00')
  })

  it('shows paise when asked', () => {
    expect(formatMoney('112682.50', { paise: true })).toBe('₹1,12,682.50')
  })

  it('rounds to whole rupees by default', () => {
    expect(formatMoney('112682.50')).toBe('₹1,12,683')
  })

  it('formats zero', () => {
    expect(formatMoney('0')).toBe('₹0')
  })

  it('does not lose precision on large values', () => {
    expect(formatMoney('9007199254740993.00', { paise: true })).toBe('₹9,00,71,99,25,47,40,993.00')
  })

  it('rejects non-decimal input', () => {
    expect(() => formatMoney('12abc')).toThrow()
    expect(() => formatMoney('1e5')).toThrow()
  })
})
