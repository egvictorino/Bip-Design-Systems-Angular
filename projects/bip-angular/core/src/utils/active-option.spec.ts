import { describe, expect, it } from 'vitest';
import { firstEnabledIndex, nextEnabledIndex } from './active-option';

const e = (...flags: boolean[]) => flags.map((disabled) => ({ disabled }));

describe('active-option', () => {
  it('firstEnabledIndex salta las deshabilitadas y devuelve -1 si no hay', () => {
    expect(firstEnabledIndex(e(true, false, false))).toBe(1);
    expect(firstEnabledIndex(e(true, true))).toBe(-1);
    expect(firstEnabledIndex([])).toBe(-1);
  });

  it('nextEnabledIndex avanza saltando deshabilitadas', () => {
    expect(nextEnabledIndex(e(false, true, false), 0, 1)).toBe(2);
    expect(nextEnabledIndex(e(false, true, false), 2, -1)).toBe(0);
  });

  it('nextEnabledIndex no hace wrap: se queda en el borde', () => {
    expect(nextEnabledIndex(e(false, false), 1, 1)).toBe(1);
    expect(nextEnabledIndex(e(false, false), 0, -1)).toBe(0);
    expect(nextEnabledIndex(e(false, true), 0, 1)).toBe(0);
  });

  it('nextEnabledIndex desde -1 baja a la primera habilitada', () => {
    expect(nextEnabledIndex(e(true, false), -1, 1)).toBe(1);
  });
});
