/** Local calendar today as `YYYY-MM-dd` (for `<input type="date" min>` and client-side checks). */
export function getTodayYmdLocal(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function rangeNotInPastMessage(start: string, end: string, d: Date = new Date()): string | null {
  const t = getTodayYmdLocal(d)
  if (start < t) {
    return 'Start date cannot be in the past'
  }
  if (end < t) {
    return 'End date cannot be in the past'
  }
  if (end < start) {
    return 'End date must be on or after start date'
  }
  return null
}
