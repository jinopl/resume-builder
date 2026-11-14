const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** JSON Resume dates are ISO 8601: YYYY, YYYY-MM or YYYY-MM-DD. */
export const DATE_PATTERN = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;

export function isValidDate(value?: string): boolean {
  return !value || DATE_PATTERN.test(value.trim());
}

/** "2021-03" → "Mar 2021", "2021" → "2021". Unknown formats are shown as typed. */
export function formatDate(value?: string): string {
  if (!value) return '';
  const v = value.trim();
  const m = /^(\d{4})(?:-(\d{2}))?/.exec(v);
  if (!m || !DATE_PATTERN.test(v)) return v;
  const [, year, month] = m;
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
}

/** "Mar 2021 – Present", "2018 – 2022", or a single date. */
export function formatRange(start?: string, end?: string, ongoingLabel = 'Present'): string {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s} – ${e}`;
  if (s) return `${s} – ${ongoingLabel}`;
  return e;
}
