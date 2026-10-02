import { describe, expect, it } from 'vitest';
import {
  getMinutes,
  isValidTextTime,
  normalizeTextTime,
  parseTime,
  pad2,
  snapToStep,
  snapToStepUp,
  to12h,
  to24h,
} from './time-picker-helpers';

describe('parseTime', () => {
  it('parsea una hora válida', () => {
    expect(parseTime('14:30')).toEqual({ hour: 14, minute: 30 });
  });

  it('devuelve nulls para undefined', () => {
    expect(parseTime(undefined)).toEqual({ hour: null, minute: null });
  });

  it('devuelve nulls para una hora fuera de rango', () => {
    expect(parseTime('25:00')).toEqual({ hour: null, minute: null });
  });

  it('devuelve nulls para un formato inválido', () => {
    expect(parseTime('14:')).toEqual({ hour: null, minute: null });
  });
});

describe('to12h / to24h', () => {
  it('convierte medianoche a 12 AM', () => {
    expect(to12h(0)).toBe(12);
  });

  it('convierte mediodía a 12 PM', () => {
    expect(to12h(12)).toBe(12);
  });

  it('to24h(12, AM) es medianoche', () => {
    expect(to24h(12, 'AM')).toBe(0);
  });

  it('to24h(12, PM) es mediodía', () => {
    expect(to24h(12, 'PM')).toBe(12);
  });

  it('to24h(2, PM) es 14', () => {
    expect(to24h(2, 'PM')).toBe(14);
  });
});

describe('isValidTextTime / normalizeTextTime', () => {
  it('acepta "9:30" como válido', () => {
    expect(isValidTextTime('9:30')).toBe(true);
  });

  it('rechaza "25:00"', () => {
    expect(isValidTextTime('25:00')).toBe(false);
  });

  it('rechaza entrada parcial "14:"', () => {
    expect(isValidTextTime('14:')).toBe(false);
  });

  it('normaliza "9:30" a "09:30"', () => {
    expect(normalizeTextTime('9:30')).toBe('09:30');
  });
});

describe('snapToStep / snapToStepUp', () => {
  it('redondea hacia abajo al step', () => {
    expect(snapToStep(37, 15)).toBe(30);
  });

  it('redondea hacia arriba al step', () => {
    expect(snapToStepUp(31, 15)).toBe(45);
  });
});

describe('getMinutes', () => {
  it('genera 12 opciones para step=5', () => {
    expect(getMinutes(5)).toHaveLength(12);
  });

  it('genera 4 opciones para step=15', () => {
    expect(getMinutes(15)).toEqual([0, 15, 30, 45]);
  });

  it('genera 2 opciones para step=30', () => {
    expect(getMinutes(30)).toEqual([0, 30]);
  });
});

describe('pad2', () => {
  it('rellena con cero a la izquierda', () => {
    expect(pad2(9)).toBe('09');
  });

  it('no altera números de dos dígitos', () => {
    expect(pad2(14)).toBe('14');
  });
});
