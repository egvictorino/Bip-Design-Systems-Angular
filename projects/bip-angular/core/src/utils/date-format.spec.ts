import { describe, expect, it } from 'vitest';
import { formatDate } from './date-format';

describe('formatDate', () => {
  const fmt = (d: Date) => new Intl.DateTimeFormat('es-MX').format(d);

  it('formats a mid-year date', () => {
    const date = new Date(2026, 5, 15); // June 15 2026
    expect(formatDate(date)).toBe(fmt(date));
  });

  it('formats the first day of the year', () => {
    const date = new Date(2026, 0, 1);
    expect(formatDate(date)).toBe(fmt(date));
  });

  it('formats the last day of the year', () => {
    const date = new Date(2026, 11, 31);
    expect(formatDate(date)).toBe(fmt(date));
  });

  it('formats a leap day', () => {
    const date = new Date(2024, 1, 29); // Feb 29 2024 (leap year)
    expect(formatDate(date)).toBe(fmt(date));
  });

  it('accepts an optional locale override', () => {
    const date = new Date(2026, 5, 15);
    expect(formatDate(date, { locale: 'en-US' })).toBe(
      new Intl.DateTimeFormat('en-US').format(date)
    );
  });

  it('accepts Intl.DateTimeFormatOptions alongside locale', () => {
    const date = new Date(2026, 5, 15);
    expect(formatDate(date, { locale: 'en-US', month: 'long', day: 'numeric' })).toBe(
      new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date)
    );
  });
});
