/** Puerto de los helpers puros de módulo de TimePicker.tsx (React). */

const TEXT_TIME_RE = /^([0-1]?\d|2[0-3]):([0-5]\d)$/;

export interface ParsedTime {
  hour: number | null;
  minute: number | null;
}

export function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

export function parseTime(time: string | undefined): ParsedTime {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return { hour: null, minute: null };
  const [hourStr, minuteStr] = time.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return { hour: null, minute: null };
  return { hour, minute };
}

export function to12h(hour24: number): number {
  const hour = hour24 % 12;
  return hour === 0 ? 12 : hour;
}

export function to24h(hour12: number, period: 'AM' | 'PM'): number {
  const base = hour12 % 12;
  return period === 'PM' ? base + 12 : base;
}

export function isValidTextTime(text: string): boolean {
  return TEXT_TIME_RE.test(text);
}

export function normalizeTextTime(text: string): string {
  const [hourStr, minuteStr] = text.split(':');
  return `${pad2(Number(hourStr))}:${minuteStr}`;
}

export function snapToStep(minute: number, step: number): number {
  return Math.floor(minute / step) * step;
}

export function snapToStepUp(minute: number, step: number): number {
  return Math.min(Math.ceil(minute / step) * step, 60 - step);
}

export function getMinutes(step: number): number[] {
  const minutes: number[] = [];
  for (let m = 0; m < 60; m += step) minutes.push(m);
  return minutes;
}
