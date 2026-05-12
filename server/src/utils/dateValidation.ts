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

/** Calendar "today" in the server process local timezone, as `YYYY-MM-DD`. */
export function todayYmdLocal(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Vacation ranges must not start or end before "today" (local calendar).
 * `todayYmd` is optional for tests.
 */
export function assertStartEndNotInPast(
  startDate: string,
  endDate: string,
  todayYmd: string = todayYmdLocal(),
): void {
  if (startDate < todayYmd) {
    throw new AppError(400, 'startDate cannot be in the past');
  }
  if (endDate < todayYmd) {
    throw new AppError(400, 'endDate cannot be in the past');
  }
}
