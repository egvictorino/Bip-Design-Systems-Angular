import { describe, expect, it } from 'vitest';
import {
  addDays,
  dateKey,
  getDaysInMonth,
  getMondayOffset,
  isoDateKey,
  isSameDay,
  monthIndex,
} from './date-helpers';

describe('isSameDay', () => {
  it('es true para el mismo año/mes/día aunque difiera la hora', () => {
    expect(isSameDay(new Date(2026, 0, 15, 8, 0), new Date(2026, 0, 15, 23, 59))).toBe(true);
  });

  it('es false si cambia el día', () => {
    expect(isSameDay(new Date(2026, 0, 15), new Date(2026, 0, 16))).toBe(false);
  });
});

describe('addDays', () => {
  it('suma días sin mutar la fecha original', () => {
    const original = new Date(2026, 0, 30);
    const result = addDays(original, 3);
    expect(original.getDate()).toBe(30);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(2);
  });

  it('resta días cruzando el límite de mes hacia atrás', () => {
    const result = addDays(new Date(2026, 1, 1), -1);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(31);
  });
});

describe('getDaysInMonth', () => {
  it('calcula febrero bisiesto', () => {
    expect(getDaysInMonth(2028, 1)).toBe(29);
  });

  it('calcula febrero no bisiesto', () => {
    expect(getDaysInMonth(2026, 1)).toBe(28);
  });

  it('calcula meses de 31 días', () => {
    expect(getDaysInMonth(2026, 0)).toBe(31);
  });
});

describe('getMondayOffset', () => {
  it('devuelve 0 cuando el mes empieza en lunes', () => {
    // 2026-06-01 es lunes
    expect(getMondayOffset(2026, 5)).toBe(0);
  });

  it('devuelve 6 cuando el mes empieza en domingo', () => {
    // 2026-11-01 es domingo
    expect(getMondayOffset(2026, 10)).toBe(6);
  });
});

describe('monthIndex', () => {
  it('es comparable entre meses de distinto año', () => {
    expect(monthIndex(new Date(2027, 0, 1))).toBeGreaterThan(monthIndex(new Date(2026, 11, 1)));
  });

  it('calcula year*12+month', () => {
    expect(monthIndex(new Date(2026, 5, 1))).toBe(2026 * 12 + 5);
  });
});

describe('dateKey', () => {
  it('genera una clave "Y-M-D" sin padding', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-0-5');
  });

  it('produce la misma clave para fechas con distinta hora', () => {
    expect(dateKey(new Date(2026, 5, 15, 3))).toBe(dateKey(new Date(2026, 5, 15, 21)));
  });
});

describe('isoDateKey', () => {
  it('genera "YYYY-MM-DD" con mes base 1 y padding (31-dic no es "2025-11-31")', () => {
    expect(isoDateKey(new Date(2025, 11, 31))).toBe('2025-12-31');
    expect(isoDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('produce la misma clave para fechas con distinta hora', () => {
    expect(isoDateKey(new Date(2026, 5, 15, 3))).toBe(isoDateKey(new Date(2026, 5, 15, 21)));
  });
});
