import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findComponentCssFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');
const ODONTOGRAM_DIR = resolve(SRC_DIR, 'odontogram');

/**
 * Selectores que no pueden usar `box-shadow` como indicador de foco. Cada uno con su motivo.
 */
const ALLOWLIST: Record<string, string> = {
  '.bip-tooth-surface--interactive':
    '<polygon> SVG: box-shadow no aplica; hoy solo baja la opacidad (pendiente, seguimiento aparte)',
};

/**
 * Límite: solo reglas cuyo selector termina en `:focus-visible` (no `:focus`, `:is()` ni pseudo-elementos).
 * Todo `:focus-visible` del odontograma pinta `box-shadow: var(--focus-ring)`. Un anillo propio
 * (`0 0 0 1px var(--color-primary)`) es del mismo color que el relleno de los botones primary y no
 * se distingue (WCAG 1.4.11); `--focus-ring` lleva un hueco en `--color-surface-1` que lo separa.
 */
function findOffenders(css: string, relPath: string): string[] {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const withRing = new Set<string>();
  const bases = new Set<string>();
  const offenders: string[] = [];
  for (const [, selectorList, body] of noComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const shadow = /box-shadow:\s*([^;]+);/.exec(body ?? '')?.[1]?.trim();
    for (const part of selectorList!.split(',')) {
      const sel = part.trim().replace(/\s+/g, ' ');
      if (!sel.endsWith(':focus-visible')) continue;
      const base = sel.replace(/:focus-visible$/, '');
      if (base in ALLOWLIST) continue;
      bases.add(base);
      if (shadow === 'var(--focus-ring)') withRing.add(base);
      else if (shadow) offenders.push(`${relPath} :: ${sel} { box-shadow: ${shadow} }`);
    }
  }
  for (const base of bases) {
    if (!withRing.has(base))
      offenders.push(`${relPath} :: ${base}:focus-visible sin var(--focus-ring)`);
  }
  return offenders;
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
});
