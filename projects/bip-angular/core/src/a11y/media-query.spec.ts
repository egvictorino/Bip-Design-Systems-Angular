import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mediaQuery } from './media-query';

type MatchMediaMock = { fireChange: (matches: boolean) => void };

/**
 * `BreakpointObserver` (CDK) escucha vía la API legacy `MediaQueryList.addListener()` (no
 * `addEventListener`) y debouncea los cambios posteriores al primero con `debounceTime(0)` —
 * de ahí el `flush()` tras `fireChange()` en el segundo test.
 */
function mockMatchMedia(initialMatches: boolean): MatchMediaMock {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mql = {
    matches: initialMatches,
    media: '',
    addListener: (cb: (event: MediaQueryListEvent) => void) => listeners.add(cb),
    removeListener: (cb: (event: MediaQueryListEvent) => void) => listeners.delete(cb),
    addEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) =>
      listeners.add(cb),
    removeEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) =>
      listeners.delete(cb),
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia);
  return {
    fireChange: (matches: boolean) => {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    },
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('mediaQuery()', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('refleja el valor inicial de matchMedia', () => {
    mockMatchMedia(true);
    TestBed.configureTestingModule({});
    const matches = TestBed.runInInjectionContext(() => mediaQuery('(min-width: 768px)'));
    expect(matches()).toBe(true);
  });

  it('se actualiza cuando la media query cambia', async () => {
    const mock = mockMatchMedia(false);
    TestBed.configureTestingModule({});
    const matches = TestBed.runInInjectionContext(() => mediaQuery('(min-width: 768px)'));
    expect(matches()).toBe(false);
    mock.fireChange(true);
    await flush();
    expect(matches()).toBe(true);
  });
});
