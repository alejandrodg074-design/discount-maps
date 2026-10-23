/** Long es-CO date in Bogotá time, e.g. "22 de octubre de 2026". */
const longDate = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Bogota',
});

export function formatDate(value: string | Date | null | undefined): string {
  if (value == null) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return longDate.format(date);
}

/**
 * Colombia's UTC offset. Bogotá has no daylight saving time, so a fixed offset
 * is exact. Mirrored nowhere in SQL: Postgres receives full timestamps.
 */
const BOGOTA_OFFSET = '-05:00';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Turns a coupon date picked in `<input type="date">` (YYYY-MM-DD, meant as a
 * Bogotá calendar day) into the timestamp stored in `valid_from` /
 * `valid_until`: the start of that day, or its last millisecond for the end of
 * a validity window. Full timestamps pass through; empty values become null.
 * Saving the bare date would make Postgres read it as midnight UTC, i.e. 7 p.m.
 * of the previous day in Bogotá.
 */
export function couponDateToTimestamp(
  value: string | null | undefined,
  edge: 'start' | 'end',
): string | null {
  if (!value) return null;
  if (!DATE_ONLY.test(value)) return value;
  const time = edge === 'start' ? '00:00:00.000' : '23:59:59.999';
  return `${value}T${time}${BOGOTA_OFFSET}`;
}

/** YYYY-MM-DD in Bogotá time (en-CA formats dates that way). */
const isoDay = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'America/Bogota',
});

/** The Bogotá calendar day of a stored timestamp, for `<input type="date">`. */
export function timestampToCouponDate(
  value: string | Date | null | undefined,
): string {
  if (value == null || value === '') return '';
  if (typeof value === 'string' && DATE_ONLY.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return isoDay.format(date);
}
