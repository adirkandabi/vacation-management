/**
 * API vacation dates are `YYYY-MM-DD` (calendar, no timezone).
 * Display as `dd/MM/yyyy`.
 */
export function formatYmdToDdMmYyyy(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim())
  if (!m) {
    return ymd
  }
  return `${m[3]}/${m[2]}/${m[1]}`
}

/** ISO timestamp (e.g. `createdAt`) → `dd/MM/yyyy` in local calendar. */
export function formatTimestampToDdMmYyyy(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim())
    if (m) {
      return `${m[3]}/${m[2]}/${m[1]}`
    }
    return iso
  }
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}
