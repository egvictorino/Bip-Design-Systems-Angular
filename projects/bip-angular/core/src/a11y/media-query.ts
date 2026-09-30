import { BreakpointObserver } from '@angular/cdk/layout';
import { type Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/**
 * Puerto de `useMediaQuery()` (React), sobre `BreakpointObserver` del CDK en vez de
 * `matchMedia` directo — SSR-safe y ya deduplicado por consulta. Llamar dentro de un campo de
 * clase o `constructor` (contexto de inyección), como `injectThemeControls()`.
 *
 * Toma un string de media query crudo; `breakpointQuery()` (core/utils/breakpoints.ts) genera
 * ese string a partir de la escala `--space-*`-style de breakpoints: `mediaQuery(breakpointQuery('md'))`.
 */
export function mediaQuery(query: string): Signal<boolean> {
  const breakpointObserver = inject(BreakpointObserver);
  return toSignal(breakpointObserver.observe(query).pipe(map((state) => state.matches)), {
    initialValue: false,
  });
}
