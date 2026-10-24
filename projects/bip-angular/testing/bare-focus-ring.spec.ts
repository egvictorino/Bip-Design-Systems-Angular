import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findFocusFindings, formatFinding, lastValue, parseRules } from './focus-ring-rules';

const SRC_DIR = resolve(__dirname, '..');
const read = (rel: string) => readFileSync(resolve(SRC_DIR, rel), 'utf-8');

/**
 * Variantes `bare` (solo subrayado): el foco usa el anillo completo, como `search-input--bare`.
 * Antes el subrayado pasaba de primary a primary-hover (igual que el hover, 1.37:1) y con error
 * no cambiaba nada (WCAG 1.4.11 / 2.4.7).
 */
const FILES = [
  'input/input.component.css',
  'select/select.component.css',
  'textarea/textarea.component.css',
  'number-input/number-input.component.css',
  'search-input/search-input.component.css',
  'multi-select/multi-select.component.css',
];

/** Regla de foco de una variante bare con error → debe pintar el anillo en --color-danger. */
const ERROR_RULES: [string, string][] = [
  ['input/input.component.css', '.bip-input--bare.bip-input--error:focus-visible'],
  ['select/select.component.css', '.bip-select--bare.bip-select--error:focus-visible'],
  ['textarea/textarea.component.css', '.bip-textarea--bare.bip-textarea--error:focus-visible'],
  ['number-input/number-input.component.css', '.bip-number-input--bare-error:focus-visible'],
  ['search-input/search-input.component.css', '.bip-search-input--bare-error:focus-visible'],
  ['multi-select/multi-select.component.css', '.bip-multi-select--error:focus-visible'],
  [
    'multi-select/multi-select.component.css',
    '.bip-multi-select--error.bip-multi-select--inline:focus-within',
  ],
];

/** Selector sin pseudo-clase de foco → motivo. */
const ALLOWLIST: Record<string, string> = {
  '.bip-multi-select-listbox':
    'listbox: el foco real va a cada opción, que lleva var(--focus-ring) (tabindex="-1")',
};

describe('variantes bare — foco con var(--focus-ring)', () => {
  it.each(FILES)('%s: ninguna regla de foco anula o sustituye el anillo', (file) => {
    const findings = findFocusFindings(read(file), ALLOWLIST).map((f) => formatFinding(file, f));
    expect(findings).toEqual([]);
  });

  it.each(FILES.filter((f) => !f.startsWith('multi-select')))(
    '%s: la variante bare enfoca con var(--focus-ring)',
    (file) => {
      const rule = parseRules(read(file)).find((r) =>
        r.selectors.some((s) => /--bare:focus-visible$/.test(s))
      );
      expect(rule, 'regla --bare:focus-visible').toBeDefined();
      expect(lastValue(rule!, 'box-shadow')).toBe('var(--focus-ring)');
    }
  );

  it('multi-select bare inline hereda el anillo de --inline:focus-within', () => {
    const rules = parseRules(read('multi-select/multi-select.component.css'));
    const inline = rules.find((r) =>
      r.selectors.includes('.bip-multi-select--inline:focus-within')
    );
    expect(inline, 'regla .bip-multi-select--inline:focus-within').toBeDefined();
    expect(lastValue(inline!, 'box-shadow')).toBe('var(--focus-ring)');
    const bareInline = rules.filter((r) =>
      r.selectors.some((s) => s.includes('--bare') && s.includes(':focus-within'))
    );
    for (const r of bareInline) expect(lastValue(r, 'box-shadow')).toBeUndefined();
  });

  it.each(ERROR_RULES)('%s %s: el anillo de error va en --color-danger', (file, selector) => {
    const rule = parseRules(read(file)).find((r) => r.selectors.includes(selector));
    expect(rule, `regla ${selector}`).toBeDefined();
    expect(lastValue(rule!, '--focus-ring-color')).toBe('var(--color-danger)');
  });
});
