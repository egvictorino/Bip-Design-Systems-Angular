import { render } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BipToastItem } from './toast-item.component';

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
    await expect(
      render(BipToastItem, { inputs: { message: 'Hola' } })
    ).resolves.toBeDefined();
  });

  it('desconecta el observer al destruirse sin lanzar', async () => {
    const { fixture } = await render(BipToastItem, { inputs: { message: 'Hola' } });
    expect(() => fixture.destroy()).not.toThrow();
  });
});
