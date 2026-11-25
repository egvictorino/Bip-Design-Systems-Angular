import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { parseRules } from './focus-ring-rules';

const SRC_DIR = resolve(__dirname, '..');

/**
 * Campos de formulario: el hover no puede pisar el estado de error. `:hover:not(:disabled)` pesa
 * (0,3,0), más que la regla de error (`.x--outlined.x--error` es (0,2,0)), así que un campo con
 * error perdía el borde danger (o el fondo danger-light del select `filled`) al pasar el puntero y,
 * en `bare` enfocado, mostraba el anillo danger con el subrayado azul. Toda regla de hover de un
 * campo que pinte borde o fondo excluye el error con `:not(.…error…)`. La referencia React tiene el
 * mismo problema.
 *
 * Archivo → clases base del campo (el botón de limpiar, el de pasos, etc. tienen otro nombre).
 * Fuera de la tabla, a propósito: number-input y search-input sustituyen la clase de variante por
 * una de error (`--outlined-error`), así que su `--outlined:hover` nunca coincide con un campo en
 * error; multi-select declara la regla de error con la misma especificidad y después del hover.
 */
const FIELDS: Record<string, string[]> = {
  'input/input.component.css': ['bip-input'],
  'textarea/textarea.component.css': ['bip-textarea'],
  'select/select.component.css': ['bip-select'],
  'date-picker/date-picker.component.css': ['bip-date-picker-trigger'],
  'date-range-picker/date-range-picker.component.css': ['bip-date-range-picker-trigger'],
  'time-picker/time-picker.component.css': ['bip-time-picker-trigger'],
};

const PAINTS = /^(border(-[\w-]+)?|background(-color)?)$/;

/** `.bip-x`, `.bip-x--variante`, y con pseudo-clases/`:not()` detrás; no `.bip-x-clear`. */
const startsWithField = (selector: string, field: string) =>
  new RegExp(`^\\.${field}(--[\\w-]+)?(?![\\w-])`).test(selector);

describe('el hover no pisa el estado de error', () => {
  it.each(Object.entries(FIELDS))('%s', (rel, fields) => {
    const rules = parseRules(readFileSync(resolve(SRC_DIR, rel), 'utf-8'));
    const hovers = rules.flatMap((rule) =>
      rule.selectors
        .filter((s) => /:hover\b/.test(s) && fields.some((f) => startsWithField(s, f)))
        .filter(() => rule.declarations.some((d) => PAINTS.test(d.prop)))
    );
    expect(hovers.length, 'reglas de hover del campo').toBeGreaterThan(0);
    // La exclusión va como `:not(.…error…)`; una regla de error con hover propia también vale.
    expect(
      hovers.filter((s) => !/:not\(\.[\w-]*error[\w-]*\)/.test(s) && !/--error/.test(s))
    ).toEqual([]);
  });

  it('el hover de un campo sin error sigue pintando el borde (la exclusión no lo quita)', () => {
    const css = readFileSync(resolve(SRC_DIR, 'input/input.component.css'), 'utf-8');
    const hover = parseRules(css).find((r) =>
      r.selectors.includes('.bip-input--outlined:not(.bip-input--error):hover:not(:disabled)')
    );
    expect(hover?.declarations.map((d) => d.prop)).toContain('border-color');
  });
});
