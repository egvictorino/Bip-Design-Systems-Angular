import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findFocusFindings, formatFinding, lastValue, parseRules } from './focus-ring-rules';

const DROPDOWN_DIR = resolve(__dirname, '../dropdown');
const read = (file: string) => readFileSync(resolve(DROPDOWN_DIR, file), 'utf-8');
const norm = (value: string | undefined) => value?.replace(/\s+/g, ' ').trim();

/** Foco de los items: anillo inset (van a ancho completo y pegados entre sí y al borde del menú). */
const ITEM_RING = 'inset 0 0 0 var(--focus-ring-width) var(--focus-ring-color)';

/** Selector sin pseudo-clase de foco → motivo. Los items no usan `var(--focus-ring)` exterior. */
const ALLOWLIST: Record<string, string> = {
  // `:host(:focus-visible)` normalizado sin la pseudo-clase de foco queda como `:host()`.
  ':host()': 'item/checkbox: anillo inset (ver ITEM_RING)',
  ':host(.bip-dropdown-item--danger)': 'item danger: anillo inset en --color-danger',
  '.bip-dropdown-item': 'trigger del submenú: anillo inset (ver ITEM_RING)',
};

describe('dropdown — foco de teclado', () => {
  it.each([
    'dropdown-search.component.css',
    'dropdown-item.component.css',
    'dropdown-item-checkbox.component.css',
    'dropdown-submenu.component.css',
    'dropdown-menu.component.css',
  ])('%s: sin reglas de foco fuera de var(--focus-ring) o del anillo inset', (file) => {
    expect(findFocusFindings(read(file), ALLOWLIST).map((f) => formatFinding(file, f))).toEqual([]);
  });

  it('el buscador usa var(--focus-ring) (un anillo propio de primary no se distingue)', () => {
    const rule = parseRules(read('dropdown-search.component.css')).find((r) =>
      r.selectors.includes('.bip-dropdown-search-input:focus-visible')
    );
    expect(rule, 'regla .bip-dropdown-search-input:focus-visible').toBeDefined();
    expect(norm(lastValue(rule!, 'box-shadow'))).toBe('var(--focus-ring)');
  });

  describe.each([
    ['dropdown-item.component.css', ':host(:focus-visible)'],
    ['dropdown-item-checkbox.component.css', ':host(:focus-visible)'],
    ['dropdown-submenu.component.css', '.bip-dropdown-item:focus-visible'],
  ])('%s', (file, selector) => {
    it('el foco suma un anillo inset al fondo (el fondo solo da 1.24:1, WCAG 1.4.11)', () => {
      const rule = parseRules(read(file)).find((r) => r.selectors.includes(selector));
      expect(rule, `regla ${selector}`).toBeDefined();
      expect(norm(lastValue(rule!, 'box-shadow'))).toBe(ITEM_RING);
      expect(lastValue(rule!, 'background-color')).toBe('var(--color-surface-3)');
    });
  });

  it('el item danger enfoca con el anillo en --color-danger', () => {
    const rule = parseRules(read('dropdown-item.component.css')).find((r) =>
      r.selectors.includes(':host(.bip-dropdown-item--danger:focus-visible)')
    );
    expect(rule, 'regla :host(.bip-dropdown-item--danger:focus-visible)').toBeDefined();
    expect(lastValue(rule!, '--focus-ring-color')).toBe('var(--color-danger)');
  });

  /**
   * Bajo ViewEncapsulation.Emulated un selector plano (`.bip-dropdown-item`) nunca coincide con
   * el propio elemento host: item y checkbox se pintaban como botones nativos sin estilo. Los
   * estilos del botón van con `:host` (el submenú sí usa clases: su trigger está en su template).
   */
  it.each(['dropdown-item.component.css', 'dropdown-item-checkbox.component.css'])(
    '%s: los estilos del host van con :host, no con la clase del host',
    (file) => {
      const flat = parseRules(read(file)).flatMap((r) =>
        r.selectors.filter((s) => /^\.bip-dropdown-item(-checkbox|--[\w-]+)?([.:][\w-]+)*$/.test(s))
      );
      expect(flat).toEqual([]);
      expect(parseRules(read(file)).some((r) => r.selectors.includes(':host'))).toBe(true);
    }
  );
});
