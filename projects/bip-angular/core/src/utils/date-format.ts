export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}

/** Puerto de shared-utils (React) src/index.ts#formatDate. */
export function formatDate(
  date: Date,
  { locale = 'es-MX', ...options }: FormatDateOptions = {}
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}
