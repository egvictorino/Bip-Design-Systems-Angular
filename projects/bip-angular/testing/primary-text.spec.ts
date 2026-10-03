import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findComponentCssFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');

/**
 * `--color-primary` es la semilla de marca: en dark mide 3.3–4.0:1 contra las superficies
 * oscuras, bajo el 4.5:1 de AA para texto. El texto debe usar `--color-primary-text`
 * (tokens.css lo aclara en dark). `color: var(--color-primary)` solo es válido donde el
 * elemento NO es texto (iconos SVG/glifos `aria-hidden`: umbral 3:1) — cada excepción va aquí
 * con su motivo. Un uso nuevo que sea texto real debe cambiar a `--color-primary-text` (y su
 * hover/press, a `--color-primary-text-hover|press`: `--color-primary-hover` en dark queda más
 * oscuro que el reposo).
 */
const ALLOWLIST: Record<string, string> = {
  'alert/alert.component.css :: .bip-alert--info':
    'solo pinta el icono SVG; el texto usa --color-info-text',
  'alert/alert.component.css :: .bip-alert-close-btn--info': 'botón cerrar: icono SVG',
  'alert/alert.component.css :: .bip-alert-close-btn--info:hover': 'botón cerrar: icono SVG',
  'dropdown/dropdown-item-checkbox.component.css :: .bip-dropdown-item-check-indicator':
    'glifo ✓ aria-hidden',
  'select/select.component.css :: .bip-select-chevron--focused': 'chevron SVG',
  'spinner/spinner.component.css :: .bip-spinner-svg--primary': 'spinner SVG aria-hidden',
  'stepper/stepper-step.component.css :: :host(.bip-stepper-step--loading) .bip-stepper-step-marker':
    'solo contiene el spinner SVG',
  'table/table-header.component.css :: .bip-table-sort-icon--active': 'icono SVG de orden',
};

const PRIMARY_AS_TEXT = /(^|[;\s])color:\s*var\(--color-primary(-hover|-press)?\)/;

function findOffenders(css: string, relPath: string): string[] {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const offenders: string[] = [];
  for (const [, selector, body] of noComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!PRIMARY_AS_TEXT.test(body ?? '')) continue;
    const key = `${relPath} :: ${selector!.trim().replace(/\s+/g, ' ')}`;
    if (!(key in ALLOWLIST)) offenders.push(key);
  }
  return offenders;
}

describe('--color-primary no se usa como color de texto', () => {
  it('el texto usa --color-primary-text; --color-primary solo en iconos allowlisted', () => {
    const offenders = findComponentCssFiles(SRC_DIR).flatMap((path) =>
      findOffenders(readFileSync(path, 'utf-8'), relative(SRC_DIR, path).replace(/\\/g, '/'))
    );
    expect(offenders).toEqual([]);
  });

  it('el allowlist no tiene entradas obsoletas', () => {
    const present = new Set<string>();
    for (const path of findComponentCssFiles(SRC_DIR)) {
      const relPath = relative(SRC_DIR, path).replace(/\\/g, '/');
      const css = readFileSync(path, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (PRIMARY_AS_TEXT.test(body ?? '')) {
          present.add(`${relPath} :: ${selector!.trim().replace(/\s+/g, ' ')}`);
        }
      }
    }
    expect(Object.keys(ALLOWLIST).filter((k) => !present.has(k))).toEqual([]);
  });

  it('detecta un uso nuevo (regresión)', () => {
    expect(findOffenders('.bip-x { color: var(--color-primary); }', 'x/x.component.css')).toEqual([
      'x/x.component.css :: .bip-x',
    ]);
    expect(findOffenders('.bip-x { color: var(--color-primary-text); }', 'x/x.css')).toEqual([]);
    expect(findOffenders('.bip-x:hover { color: var(--color-primary-hover); }', 'x/x.css')).toEqual(
      ['x/x.css :: .bip-x:hover']
    );
    expect(
      findOffenders('.bip-x:active { color: var(--color-primary-press); }', 'x/x.css')
    ).toEqual(['x/x.css :: .bip-x:active']);
    expect(
      findOffenders('.bip-x:hover { color: var(--color-primary-text-hover); }', 'x/x.css')
    ).toEqual([]);
  });
});
