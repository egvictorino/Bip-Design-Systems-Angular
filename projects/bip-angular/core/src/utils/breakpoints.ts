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

/** `mediaQuery('md')` → `'(min-width: 768px)'`, igual que escribirlo a mano. */
export function mediaQuery(breakpoint: BreakpointKey): string {
  return `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
}
