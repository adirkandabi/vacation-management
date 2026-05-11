import { AppError } from '../errors/AppError';

/** Accepts YYYY-MM-DD calendar dates in UTC noon to avoid DST issues. */
export function parseIsoDateOnly(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const t = Date.parse(`${value}T12:00:00.000Z`);
  if (Number.isNaN(t)) {
    return null;
  }
  return value;
}

export function assertEndOnOrAfterStart(
  startDate: string,
  endDate: string,
): void {
  if (endDate < startDate) {
    throw new AppError(400, 'endDate must be on or after startDate');
  }
}
