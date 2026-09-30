/**
 * Escala de breakpoints — fuente única para `.component.css` (donde se escriben como
 * literal, ya que CSS no permite `var()` dentro de `@media`) y para consultas de
 * BreakpointObserver en runtime. Estilo Tailwind, igual que `--space-*` en primitives.css.
 *
 * Puerto de bip-design-system (React) src/styles/breakpoints.ts.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * `breakpointQuery('md')` → `'(min-width: 768px)'`, igual que escribirlo a mano. Pensado para
 * alimentar `mediaQuery()` (core/a11y, Bloque 3): `mediaQuery(breakpointQuery('md'))`.
 */
export function breakpointQuery(breakpoint: BreakpointKey): string {
  return `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
}
