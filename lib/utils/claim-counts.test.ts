import { describe, it, expect } from 'vitest'
import { competingLabel, isOversubscribed } from '@/lib/utils/claim-counts'

describe('competingLabel', () => {
  // Phrased, never a bare number or a ratio: "50" next to a progress bar reads
  // as the bar's own quantity, and "50/3" reads as a fraction.
  it('phrases the competition so it cannot be read as a bar quantity', () => {
    expect(competingLabel(50, 3)).toBe('50 competing for 3 spots')
    expect(competingLabel(50, 3)).not.toContain('/')
  })

  it('says so plainly when nobody has submitted yet', () => {
    expect(competingLabel(0, 3)).toBe('No submissions yet · 3 spots')
    expect(competingLabel(undefined, 3)).toBe('No submissions yet · 3 spots')
  })

  it('gets the plural right', () => {
    expect(competingLabel(4, 1)).toBe('4 competing for 1 spot')
    expect(competingLabel(1, 2)).toBe('1 competing for 2 spots')
  })
})

describe('isOversubscribed', () => {
  it('flags three or more contenders per spot', () => {
    expect(isOversubscribed(9, 3)).toBe(true)
    expect(isOversubscribed(50, 3)).toBe(true)
    expect(isOversubscribed(3, 1)).toBe(true)
  })

  it('stays quiet while the odds are reasonable', () => {
    expect(isOversubscribed(8, 3)).toBe(false)
    expect(isOversubscribed(2, 1)).toBe(false)
    expect(isOversubscribed(0, 3)).toBe(false)
    expect(isOversubscribed(undefined, 3)).toBe(false)
  })
})
