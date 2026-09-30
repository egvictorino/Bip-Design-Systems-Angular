import { describe, expect, it } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  it('formats a positive amount', () => {
    expect(formatCurrency(1500)).toBe(fmt(1500));
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe(fmt(0));
  });

  it('formats a negative amount', () => {
    expect(formatCurrency(-500)).toBe(fmt(-500));
  });

  it('formats large amounts with thousands separator', () => {
    expect(formatCurrency(1_000_000)).toBe(fmt(1_000_000));
  });

  it('formats decimal amounts', () => {
    expect(formatCurrency(99.99)).toBe(fmt(99.99));
  });

  it('accepts an optional locale/currency override', () => {
    expect(formatCurrency(1500, { locale: 'en-US', currency: 'USD' })).toBe(
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1500)
    );
  });
});
