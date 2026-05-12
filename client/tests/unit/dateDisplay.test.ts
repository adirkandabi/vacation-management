import { describe, expect, it } from 'vitest'
import { formatTimestampToDdMmYyyy, formatYmdToDdMmYyyy } from '../../src/utils/dateDisplay'

describe('dateDisplay', () => {
  it('formats YYYY-MM-DD to dd/MM/yyyy', () => {
    expect(formatYmdToDdMmYyyy('2026-05-01')).toBe('01/05/2026')
  })

  it('formats ISO timestamp to dd/MM/yyyy pattern', () => {
    const out = formatTimestampToDdMmYyyy('2026-05-12T15:30:00.000Z')
    expect(out).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })
})
