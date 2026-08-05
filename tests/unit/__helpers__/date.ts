/**
 * Relative date utilities that prevent flaky tests when the calendar month changes.
 */

/**
 * Returns a `Date` that is `days` in the past (from now).
 */
export function pastDate(days = 1): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Returns a `Date` that is `days` in the future (from now).
 */
export function futureDate(days = 1): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Returns an ISO date string (YYYY-MM-DD) that is `days` in the future.
 */
export function futureDateStr(days = 1): string {
  return futureDate(days).toISOString().split('T')[0]!;
}

/**
 * Returns an ISO date string (YYYY-MM-DD) that is `days` in the past.
 */
export function pastDateStr(days = 1): string {
  return pastDate(days).toISOString().split('T')[0]!;
}
