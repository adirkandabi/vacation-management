import { describe, expect, it } from 'vitest';
import { AppError } from '../../src/errors/AppError';
import {
  assertValidStatus,
} from '../../src/services/vacationRequestService';

describe('assertValidStatus', () => {
  it('accepts Pending', () => {
    expect(assertValidStatus('Pending')).toBe('Pending');
  });

  it('throws AppError for invalid status', () => {
    expect(() => assertValidStatus('Maybe')).toThrow(AppError);
  });
});
