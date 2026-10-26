import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findComponentCssFiles } from './find-css-files';
import { findFocusFindings, formatFinding, lastValue, parseRules } from './focus-ring-rules';

const SRC_DIR = resolve(__dirname, '..');

const DIALOG =
  'panel con role="dialog" y tabindex="-1": recibe el foco por programa al abrir y lo pasa a sus controles, que llevan var(--focus-ring)';
const COMPOSITE =
  'contenedor compuesto con tabindex="-1": el foco real va a cada celda u opción, que lleva var(--focus-ring)';
const INSET =
  'item de menú a ancho completo: anillo inset con --focus-ring-width/--focus-ring-color (uno exterior taparía al vecino; ver dropdown-focus-ring.spec.ts)';

/**
 * Excepciones por archivo (CSS relativo a projects/bip-angular → selector sin la pseudo-clase de
 * foco → motivo). Por archivo y no global: una clave como `:host()` eximiría el foco de cualquier
 * componente. Cada entrada debe seguir produciendo un hallazgo (ver el último `it`).
 */
const ALLOWLIST: Record<string, Record<string, string>> = {
  'calendar/calendar.component.css': {
    '.bip-calendar-range-popover':
      'popover de selección de rango (tabindex="-1"): se abre arrastrando con el mouse y no recibe foco por teclado',
  },
  'date-picker/date-picker.component.css': { '.bip-date-picker-panel': DIALOG },
  'date-range-picker/date-range-picker.component.css': { '.bip-date-range-picker-panel': DIALOG },
  'time-picker/time-picker.component.css': {
    '.bip-time-picker-panel': DIALOG,
    '.bip-time-picker-column-list':
      'listbox con aria-activedescendant: la opción activa lleva --focused { box-shadow: var(--focus-ring) }',
  },
  'core/src/calendar-grid/calendar-grid.component.css': {
    '.bip-calendar-grid-days': COMPOSITE,
    '.bip-calendar-grid-years': COMPOSITE,
  },
  'multi-select/multi-select.component.css': { '.bip-multi-select-listbox': COMPOSITE },
  'dropdown/dropdown-item.component.css': {
    // `:host(:focus-visible)` sin la pseudo-clase de foco queda como `:host()`.
    ':host()': INSET,
    ':host(.bip-dropdown-item--danger)':
      'item danger: solo cambia --focus-ring-color; el anillo inset viene de :host(:focus-visible)',
  },
  'dropdown/dropdown-item-checkbox.component.css': { ':host()': INSET },
  'dropdown/dropdown-submenu.component.css': { '.bip-dropdown-item': INSET },
  'odontogram/odontogram.component.css': {
    '.bip-odontogram-tooth-cell--selected':
      'banda de selección + anillo de foco desplazado (ver odontogram-focus-ring.spec.ts)',
  },
};

/**
 * Todo foco de teclado de la librería pinta `box-shadow: var(--focus-ring)` (hueco
 * `--color-surface-1` + banda `--focus-ring-color`), salvo las excepciones justificadas de arriba.
 * Parser y reglas en `focus-ring-rules.ts`; amplía el guard estricto del odontograma (#43) a los
 * 108 CSS de componente.
 */
describe('foco de teclado — toda la librería usa var(--focus-ring)', () => {
  const files = findComponentCssFiles(SRC_DIR).map(
    (file) => [relative(SRC_DIR, file), file] as const
  );

  it('encuentra los CSS de componente', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it.each(files)('%s', (rel, file) => {
    const findings = findFocusFindings(readFileSync(file, 'utf-8'), ALLOWLIST[rel] ?? {});
    expect(findings.map((f) => formatFinding(rel, f))).toEqual([]);
  });

  /**
   * Las excepciones de contenedores se justifican porque el indicador está en otro elemento:
   * se afirma que ese indicador existe (si se borra, la excepción dejaría de ser cierta).
   */
  it.each([
    ['core/src/calendar-grid/calendar-grid.component.css', '.bip-calendar-grid-day:focus-visible'],
    [
      'core/src/calendar-grid/calendar-grid.component.css',
      '.bip-calendar-grid-year-btn:focus-visible',
    ],
    ['multi-select/multi-select.component.css', '.bip-multi-select-option:focus-visible'],
    [
      'time-picker/time-picker.component.css',
      '.bip-time-picker-column-list:focus .bip-time-picker-option--focused',
    ],
    ['time-picker/time-picker.component.css', '.bip-time-picker-option:focus-visible'],
    ['time-picker/time-picker.component.css', '.bip-time-picker-now-btn:focus-visible'],
  ])('%s: %s pinta var(--focus-ring)', (rel, selector) => {
    const rule = parseRules(readFileSync(resolve(SRC_DIR, rel), 'utf-8')).find((r) =>
      r.selectors.includes(selector)
    );
    expect(rule, `regla ${selector}`).toBeDefined();
    expect(lastValue(rule!, 'box-shadow')).toBe('var(--focus-ring)');
  });

  it('la columna del time-picker reserva sitio para el anillo (overflow-y: auto también recorta en horizontal)', () => {
    const rule = parseRules(
      readFileSync(resolve(SRC_DIR, 'time-picker/time-picker.component.css'), 'utf-8')
    ).find((r) => r.selectors.includes('.bip-time-picker-column-list'));
    expect(lastValue(rule!, 'overflow-y')).toBe('auto');
    expect(lastValue(rule!, 'padding')?.replace(/\s+/g, ' ')).toBe(
      'calc(var(--focus-ring-offset) + var(--focus-ring-width))'
    );
    // `scrollIntoView({ block: 'nearest' })` deja la opción activa pegada al borde del scroll.
    expect(lastValue(rule!, 'scroll-padding-block')?.replace(/\s+/g, ' ')).toBe(
      'calc(var(--focus-ring-offset) + var(--focus-ring-width))'
    );
  });

  it('cada excepción de la allowlist sigue siendo necesaria', () => {
    const stale: string[] = [];
    for (const [rel, entries] of Object.entries(ALLOWLIST)) {
      const css = readFileSync(resolve(SRC_DIR, rel), 'utf-8');
      for (const key of Object.keys(entries)) {
        const others = Object.fromEntries(Object.entries(entries).filter(([k]) => k !== key));
        const without = findFocusFindings(css, others).length;
        const withIt = findFocusFindings(css, entries).length;
        if (without === withIt) stale.push(`${rel} :: ${key}`);
      }
    }
    expect(stale).toEqual([]);
  });
});
