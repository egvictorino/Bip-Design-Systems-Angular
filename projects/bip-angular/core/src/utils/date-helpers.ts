/**
 * Puerto 1:1 de bip-design-system (React) src/lib/dateHelpers.ts. Funciones puras, sin
 * dependencia de ninguna librería de fechas externa (regla del Bloque 8). Compartidas por
 * MultiSelect-adjacentes no aplica; las usan Calendar, DatePicker, DateRangePicker y la
 * cuadrícula de días/años interna de los pickers.
 */

/** Mismo día de calendario, ignorando la hora. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Nueva `Date` a medianoche del mismo día (inmutable, clona antes de mutar). */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Nueva `Date` desplazada `delta` días (inmutable, clona antes de mutar). */
export function addDays(date: Date, delta: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + delta);
  return result;
}

/** Cantidad de días del mes (0-indexed, como `Date.getMonth()`). */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Offset lunes-primero del día 1 del mes: 0 = lunes ... 6 = domingo. */
export function getMondayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

/** Índice comparable de mes (`year*12+month`), para navegación con límites min/max. */
export function monthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

/** Clave `"Y-M-D"` (sin padding) — para membresía en Set (fechas deshabilitadas) y `data-date`. */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Clave ISO `"YYYY-MM-DD"` (mes base 1, con padding, hora local) — para el atributo `data-date`
 * de la cuadrícula del calendario. Distinta de `dateKey`, cuyo mes es base 0 y daba
 * `2025-11-31` para el 31 de diciembre de 2025.
 */
export function isoDateKey(date: Date): string {
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
