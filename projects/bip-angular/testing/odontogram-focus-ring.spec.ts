import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findComponentCssFiles } from './find-css-files';
import { findFocusFindings, formatFinding } from './focus-ring-rules';

const SRC_DIR = resolve(__dirname, '..');
const ODONTOGRAM_DIR = resolve(SRC_DIR, 'odontogram');

/**
 * Selectores que no pueden usar `box-shadow` como indicador de foco. Cada uno con su motivo.
 * Las superficies SVG del diente no están aquí: pintan su foco con un anillo propio (ver el
 * `describe` de `tooth-svg.component.css` abajo).
 */
const ALLOWLIST: Record<string, string> = {
  '.bip-odontogram-tooth-cell--selected':
    'compuesta: banda de selección + anillo de foco desplazado (ver el `it` de la celda seleccionada)',
};

/**
 * Todo foco del odontograma (`:focus`, `:focus-visible`, `:focus-within`, en cualquier posición del
 * selector) pinta `box-shadow: var(--focus-ring)`, y cada `:focus-visible` tiene su anillo. Un
 * anillo propio (`0 0 0 1px var(--color-primary)`) es del mismo color que el relleno de los
 * botones primary y no se distingue (WCAG 1.4.11); `--focus-ring` lleva un hueco en
 * `--color-surface-1` que lo separa. El parser vive en `focus-ring-rules.ts` (con sus propios specs).
 */
function findOffenders(css: string, relPath: string): string[] {
  return findFocusFindings(css, ALLOWLIST).map((f) => formatFinding(relPath, f));
}

describe('odontogram — :focus-visible usa var(--focus-ring)', () => {
  const files = findComponentCssFiles(ODONTOGRAM_DIR);

  it('encuentra los CSS del odontograma', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((f) => [relative(SRC_DIR, f), f]))('%s', (relPath, file) => {
    expect(findOffenders(readFileSync(file as string, 'utf-8'), relPath as string)).toEqual([]);
  });

  it('la allowlist sigue apuntando a un selector existente', () => {
    const all = files.map((f) => readFileSync(f, 'utf-8')).join('\n');
    for (const sel of Object.keys(ALLOWLIST)) expect(all).toContain(`${sel}:focus-visible`);
  });

  it('el botón de borrar miniatura conserva el anillo danger', () => {
    const css = readFileSync(resolve(ODONTOGRAM_DIR, 'image-popover.component.css'), 'utf-8');
    expect(css).toMatch(
      /\.bip-image-popover-thumb-delete:focus-visible\s*\{[^}]*--focus-ring-color:\s*var\(--color-danger\)/
    );
  });

  describe('superficies SVG del diente (tooth-svg.component.css)', () => {
    const css = readFileSync(resolve(ODONTOGRAM_DIR, 'tooth-svg.component.css'), 'utf-8').replace(
      /\/\*[\s\S]*?\*\//g,
      ''
    );
    const SURFACES = ['buccal', 'lingual', 'mesial', 'distal', 'occlusal'];

    it('el foco de cada superficie muestra su anillo propio', () => {
      for (const s of SURFACES) {
        expect(css).toMatch(
          new RegExp(
            `\\.bip-tooth-surface\\[data-surface='${s}'\\]:focus-visible\\s*~\\s*\\.bip-tooth-focus\\[data-surface='${s}'\\]`
          )
        );
      }
    });

    it('el anillo es de dos tonos con tokens: banda --focus-ring-color y hueco --color-surface-1', () => {
      expect(css).toMatch(/\.bip-tooth-focus-ring\s*\{[^}]*stroke:\s*var\(--focus-ring-color\)/);
      expect(css).toMatch(/\.bip-tooth-focus-gap\s*\{[^}]*stroke:\s*var\(--color-surface-1\)/);
    });

    it('el anillo está oculto por defecto, se muestra con display: inline y no escala el trazo', () => {
      expect(css).toMatch(/\.bip-tooth-focus\s*\{[^}]*display:\s*none/);
      expect(css).toMatch(
        /\.bip-tooth-focus\[data-surface='occlusal'\]\s*\{[^}]*display:\s*inline/
      );
      expect(css).toMatch(/vector-effect:\s*non-scaling-stroke/);
      expect(css).toMatch(/\.bip-tooth-svg--interactive\s*\{[^}]*overflow:\s*visible/);
    });

    it(':focus-visible ya no se señala solo con opacidad', () => {
      for (const [, list, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (
          /:focus-visible\s*(,|$)/.test(list!.trim().replace(/\s+/g, ' ')) &&
          /opacity\s*:/.test(body!)
        )
          throw new Error(`:focus-visible solo con opacity: ${list!.trim()}`);
      }
    });
  });

  describe('celda seleccionada con foco (odontogram.component.css)', () => {
    const css = readFileSync(resolve(ODONTOGRAM_DIR, 'odontogram.component.css'), 'utf-8').replace(
      /\/\*[\s\S]*?\*\//g,
      ''
    );
    const rule = (selector: string) =>
      [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(
        ([, list]) => list!.trim().replace(/\s+/g, ' ') === selector
      );

    it('la regla combinada: banda de selección, y hueco y anillo de foco desplazados 2px', () => {
      const body = rule('.bip-odontogram-tooth-cell--selected:focus-visible')?.[2] ?? '';
      const value = /box-shadow:\s*([^;]+);/.exec(body)?.[1]?.replace(/\s+/g, ' ').trim();
      expect(value).toBe(
        '0 0 0 2px var(--color-primary), ' +
          '0 0 0 calc(2px + var(--focus-ring-offset)) var(--color-surface-1), ' +
          '0 0 0 calc(2px + var(--focus-ring-offset) + var(--focus-ring-width)) var(--focus-ring-color)'
      );
    });

    it('va después de --button:focus-visible (misma especificidad: gana la última)', () => {
      const index = (selector: string) =>
        [...css.matchAll(/([^{}]+)\{/g)].findIndex(
          ([, list]) => list!.trim().replace(/\s+/g, ' ') === selector
        );
      const base = index('.bip-odontogram-tooth-cell--button:focus-visible');
      const combined = index('.bip-odontogram-tooth-cell--selected:focus-visible');
      expect(base).toBeGreaterThan(-1);
      expect(combined).toBeGreaterThan(base);
    });
  });
});
