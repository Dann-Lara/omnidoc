/**
 * Date utilities for timezone-aware operations in the backend.
 * 
 * All dates are stored as UTC in PostgreSQL.
 * These helpers compute "today", "this week", etc. in the user's timezone.
 */

/**
 * Get the start and end of "today" in a given timezone, returned as UTC Date objects.
 */
export function getTodayRangeUTC(timezone: string): { start: Date; end: Date } {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(now)
  const month = parseInt(parts.find(p => p.type === 'month')!.value, 10)
  const day = parseInt(parts.find(p => p.type === 'day')!.value, 10)
  const year = parseInt(parts.find(p => p.type === 'year')!.value, 10)

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0))

  return { start, end }
}

/**
 * Get the start of the current week (Monday) in a given timezone, returned as UTC Date.
 */
export function getWeekStartUTC(timezone: string): Date {
  const { start: todayStart } = getTodayRangeUTC(timezone)
  const dayOfWeek = todayStart.getDay()
  const monday = new Date(todayStart)
  monday.setDate(todayStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setUTCHours(0, 0, 0, 0)
  return monday
}

/**
 * Format a UTC Date for display in a given timezone.
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  locale: string = 'es-ES',
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
): string {
  return date.toLocaleDateString(locale, { ...options, timeZone: timezone })
}

/**
 * Format a UTC time for display in a given timezone.
 */
export function formatTimeInTimezone(
  date: Date,
  timezone: string,
  locale: string = 'es-ES',
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }
): string {
  return date.toLocaleTimeString(locale, { ...options, timeZone: timezone })
}
