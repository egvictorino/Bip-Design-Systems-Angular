import { inject } from '@angular/core';
import { BipThemeContext } from './theme-context';
import { NOOP_CONTROLS } from './theme.types';
import type { ThemeControls } from './theme.types';

/**
 * Lee/muta el tema desde cualquier descendiente sin levantar estado propio — p. ej. un
 * botón de toggle light/dark. Sin `<bip-theme-provider>`/`[bipTheme]` ancestro, los
 * setters son no-op (`NOOP_CONTROLS`) — paridad con `useThemeControls()` de React.
 *
 * Como cualquier función basada en `inject()`, solo es válida en un contexto de inyección
 * (constructor o field initializer) — llamarla dentro de un manejador de eventos lanza
 * NG0203. Captúrala una vez como campo de la clase y usa esa referencia en el template:
 *
 * ```ts
 * private readonly themeControls = injectThemeControls();
 * toggle(): void { this.themeControls.toggleColorScheme(); }
 * ```
 *
 * El objeto devuelto es una fachada "viva": `theme`/`colorScheme`/`resolvedColorScheme` son
 * getters que leen la señal del contexto en cada acceso (nunca una copia fija tomada en el
 * momento de la inyección — el provider ancestro puede no haber corrido su primer `effect()`
 * todavía), y los setters siempre operan sobre el contexto actual.
 */
export function injectThemeControls(): ThemeControls {
  const context = inject(BipThemeContext, { optional: true });
  if (!context) return NOOP_CONTROLS;
  return {
    get theme() {
      return context.controls().theme;
    },
    get colorScheme() {
      return context.controls().colorScheme;
    },
    get resolvedColorScheme() {
      return context.controls().resolvedColorScheme;
    },
    setTheme: (next) => context.controls().setTheme(next),
    setColorScheme: (next) => context.controls().setColorScheme(next),
    toggleColorScheme: () => context.controls().toggleColorScheme(),
  };
}
