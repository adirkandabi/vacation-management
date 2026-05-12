import { describe, expect, it } from 'vitest'
import { getTodayYmdLocal, rangeNotInPastMessage } from '../../src/utils/dateMin'

describe('dateMin', () => {
  it('rangeNotInPastMessage returns null for future range', () => {
    const ref = new Date('2026-01-10T12:00:00')
    expect(rangeNotInPastMessage('2026-02-01', '2026-02-05', ref)).toBeNull()
  })

  it('rangeNotInPastMessage rejects past start', () => {
    const ref = new Date('2026-06-15T12:00:00')
    expect(rangeNotInPastMessage('2026-06-14', '2026-06-20', ref)).toMatch(/Start date/)
  })
})

describe('getTodayYmdLocal', () => {
  it('formats fixed date', () => {
    expect(getTodayYmdLocal(new Date('2026-03-09T15:00:00'))).toBe('2026-03-09')
  })
})
