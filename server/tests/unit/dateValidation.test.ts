import { describe, expect, it } from 'vitest';
import { AppError } from '../../src/errors/AppError';
import {
  assertEndOnOrAfterStart,
  parseIsoDateOnly,
} from '../../src/utils/dateValidation';

describe('parseIsoDateOnly', () => {
  it('accepts valid YYYY-MM-DD', () => {
    expect(parseIsoDateOnly('2026-05-01')).toBe('2026-05-01');
  });

  it('rejects wrong shapes', () => {
    expect(parseIsoDateOnly('2026/05/01')).toBeNull();
    expect(parseIsoDateOnly('26-05-01')).toBeNull();
    expect(parseIsoDateOnly(null)).toBeNull();
    expect(parseIsoDateOnly('')).toBeNull();
  });
});

describe('assertEndOnOrAfterStart', () => {
  it('allows same day', () => {
    expect(() =>
      assertEndOnOrAfterStart('2026-01-01', '2026-01-01'),
    ).not.toThrow();
  });

  it('throws AppError when end is before start', () => {
    expect(() =>
      assertEndOnOrAfterStart('2026-02-01', '2026-01-01'),
    ).toThrow(AppError);
  });
});
