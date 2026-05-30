/**
 * Parse a quit date string into a Date object.
 *
 * Two formats are supported:
 *  - ISO 8601 (e.g. "2026-05-29T15:42:00.000Z") — used when the user quits today,
 *    preserving the exact time so the counter starts from the right moment.
 *  - YYYY-MM-DD (e.g. "2026-05-01") — used for past dates where only the day is known;
 *    midnight local time is assumed.
 */
export function parseQuitDate(str: string): Date {
  if (str.includes('T')) return new Date(str);
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0);
}

/**
 * Serialize a Date to the appropriate quit-date string format:
 *  - If the date is today → full ISO string (preserves current time)
 *  - Otherwise → YYYY-MM-DD (midnight assumed for past dates)
 */
export function serializeQuitDate(date: Date): string {
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth()    === today.getMonth()    &&
    date.getDate()     === today.getDate();

  if (isToday) return new Date().toISOString();

  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const dd   = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
