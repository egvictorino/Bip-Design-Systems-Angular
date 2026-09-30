import { describe, expect, it } from 'vitest';
import { disclosure } from './disclosure';

describe('disclosure()', () => {
  it('arranca cerrado por defecto', () => {
    expect(disclosure().isOpen()).toBe(false);
  });

  it('acepta un estado inicial abierto', () => {
    expect(disclosure(true).isOpen()).toBe(true);
  });

  it('open() pone isOpen en true', () => {
    const d = disclosure();
    d.open();
    expect(d.isOpen()).toBe(true);
  });

  it('close() pone isOpen en false', () => {
    const d = disclosure(true);
    d.close();
    expect(d.isOpen()).toBe(false);
  });

  it('toggle() invierte el estado actual', () => {
    const d = disclosure();
    d.toggle();
    expect(d.isOpen()).toBe(true);
    d.toggle();
    expect(d.isOpen()).toBe(false);
  });
});
