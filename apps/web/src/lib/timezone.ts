/**
 * Timezone utilities for OmniDoc
 * 
 * All dates are stored in UTC in the database.
 * These utilities ensure consistent display in the user's local timezone.
 */

/**
 * Get the browser's timezone offset in minutes (e.g. -360 for UTC-6)
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset()
}

/**
 * Get the IANA timezone identifier (e.g. 'America/Mexico_City')
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Convert a UTC date string to a formatted date string in the user's timezone
 * Example: '2026-05-06T14:00:00Z' → '06/05/2026'
 */
export function formatDateLocal(
  date: string | Date,
  locale: string = 'es-MX',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString(locale, options)
}

/**
 * Convert a UTC date string to a formatted time string in the user's timezone
 * Example: '2026-05-06T14:00:00Z' → '14:00'
 */
export function formatTimeLocal(
  date: string | Date,
  locale: string = 'es-MX',
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleTimeString(locale, options)
}

/**
 * Convert a UTC date string to a formatted date+time string in the user's timezone
 */
export function formatDateTimeLocal(
  date: string | Date,
  locale: string = 'es-MX'
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Convert a local date string (YYYY-MM-DD) to a UTC Date object
 * This avoids timezone shift when sending dates to the backend.
 */
export function parseDateUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * Create a date in UTC from components, avoiding timezone shift
 */
export function createUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day))
}

/**
 * Get the date part (YYYY-MM-DD) from a Date object in the user's timezone
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if a UTC date is "today" in the user's timezone
 */
export function isTodayUTC(dateUTC: string | Date): boolean {
  const d = typeof dateUTC === 'string' ? new Date(dateUTC) : dateUTC
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

/**
 * Check if a UTC date is within the current week (Monday-Sunday) in user's timezone
 */
export function isThisWeekUTC(dateUTC: string | Date): boolean {
  const d = typeof dateUTC === 'string' ? new Date(dateUTC) : dateUTC
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 7)
  return d >= monday && d < sunday
}
