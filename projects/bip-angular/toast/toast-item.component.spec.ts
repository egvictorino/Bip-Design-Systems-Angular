import { readFileSync } from 'fs';
import { resolve } from 'path';
import { render } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BipToastItem } from './toast-item.component';
import { lastValue, parseRules } from '../testing/focus-ring-rules';

/**
 * Regresión: `inject(DestroyRef)` se llamaba dentro del callback de `afterNextRender`,
 * fuera de contexto de inyección (NG0203) en cualquier navegador real con `ResizeObserver`.
 * jsdom no implementa `ResizeObserver`, así que el bug no se detectaba en el resto de la
 * suite (la rama retorna antes en `typeof ResizeObserver === 'undefined'`) — este spec
 * define un stub global para forzar esa ruta.
 */
describe('BipToastItem — ResizeObserver', () => {
  let ResizeObserverStub: typeof ResizeObserver;

  beforeEach(() => {
    ResizeObserverStub = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    } as unknown as typeof ResizeObserver;
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no lanza NG0203 al observar el tamaño del toast', async () => {
    await expect(render(BipToastItem, { inputs: { message: 'Hola' } })).resolves.toBeDefined();
  });

  it('desconecta el observer al destruirse sin lanzar', async () => {
    const { fixture } = await render(BipToastItem, { inputs: { message: 'Hola' } });
    expect(() => fixture.destroy()).not.toThrow();
  });
});

/**
 * Regresión: el `<bip-alert>` del toast pinta su propio fondo con `--radius-surface` en las cuatro
 * esquinas. Dentro de `.bip-toast-card` (radio + overflow hidden, sin fondo) y con un tema
 * redondeado dejaba muescas transparentes contra la barra de progreso. jsdom no aplica la
 * cascada: se lee el CSS (el radio real se midió en Chromium).
 */
describe('toast-item.component.css — esquinas del alert', () => {
  it('el alert interno no redondea sus esquinas: las recorta la tarjeta', () => {
    const rules = parseRules(readFileSync(resolve(__dirname, 'toast-item.component.css'), 'utf-8'));
    const alert = rules.find((r) => r.selectors.includes('.bip-toast-card > bip-alert'));
    expect(alert, 'regla .bip-toast-card > bip-alert').toBeDefined();
    expect(lastValue(alert!, 'border-radius')).toBe('var(--radius-none)');
    const card = rules.find((r) => r.selectors.includes('.bip-toast-card'));
    expect(lastValue(card!, 'overflow')).toBe('hidden');
  });
});
