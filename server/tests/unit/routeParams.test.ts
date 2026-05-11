import { describe, expect, it } from 'vitest';
import { routeIdString } from '../../src/utils/routeParams';

describe('routeIdString', () => {
  it('returns string for plain string param', () => {
    expect(routeIdString('42')).toBe('42');
  });

  it('uses first element when param is an array', () => {
    expect(routeIdString(['7', '8'])).toBe('7');
  });

  it('returns null for empty or missing', () => {
    expect(routeIdString(undefined)).toBeNull();
    expect(routeIdString('')).toBeNull();
    expect(routeIdString([])).toBeNull();
  });
});
