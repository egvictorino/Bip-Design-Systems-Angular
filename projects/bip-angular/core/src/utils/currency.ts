export interface FormatCurrencyOptions {
  locale?: string;
  currency?: string;
}

/** Puerto de shared-utils (React) src/index.ts#formatCurrency. */
export function formatCurrency(
  amount: number,
  { locale = 'es-MX', currency = 'MXN' }: FormatCurrencyOptions = {}
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
