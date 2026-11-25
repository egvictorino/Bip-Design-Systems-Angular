import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findComponentCssFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');

/**
 * `--color-primary-hover` es un RELLENO (texto `--color-txt-on-primary` encima): en dark oscurece
 * para mantener AA. Como color de borde/foco necesita lo contrario (aclarar, >=3:1 contra el
 * campo), para eso existe `--color-edge-primary-hover`. Un `border*-color` con el token de relleno
 * solo es válido si la misma regla también pinta `background-color` con él (borde = relleno).
 */
const BORDER_WITH_FILL_TOKEN =
  /(^|[;\s])(border|outline|box-shadow)[\w-]*:[^;]*var\(--color-primary-(hover|press)\)/;
const FILL_WITH_FILL_TOKEN = /background-color:\s*var\(--color-primary-(hover|press)\)/;

function findOffenders(css: string, relPath: string): string[] {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const offenders: string[] = [];
  for (const [, selector, body] of noComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const b = body ?? '';
    if (BORDER_WITH_FILL_TOKEN.test(b) && !FILL_WITH_FILL_TOKEN.test(b)) {
      offenders.push(`${relPath} :: ${selector!.trim().replace(/\s+/g, ' ')}`);
    }
  }
  return offenders;
}

describe('--color-primary-hover/press (relleno) no se usa como color de borde', () => {
  it('los bordes de hover/foco usan --color-edge-primary-hover', () => {
    const offenders = findComponentCssFiles(SRC_DIR).flatMap((path) =>
      findOffenders(readFileSync(path, 'utf-8'), relative(SRC_DIR, path).replace(/\\/g, '/'))
    );
    expect(offenders).toEqual([]);
  });

  it('detecta un uso nuevo (regresión)', () => {
    expect(
      findOffenders('.bip-x:hover { border-color: var(--color-primary-hover); }', 'x/x.css')
    ).toEqual(['x/x.css :: .bip-x:hover']);
    expect(
      findOffenders('.bip-x { border-bottom-color: var(--color-primary-press); }', 'x/x.css')
    ).toEqual(['x/x.css :: .bip-x']);
    expect(
      findOffenders('.bip-x { border: 1px solid var(--color-primary-hover); }', 'x/x.css')
    ).toEqual(['x/x.css :: .bip-x']);
    expect(
      findOffenders('.bip-x { outline-color: var(--color-primary-press); }', 'x/x.css')
    ).toEqual(['x/x.css :: .bip-x']);
    expect(
      findOffenders('.bip-x { border-color: var(--color-edge-primary-hover); }', 'x/x.css')
    ).toEqual([]);
    expect(
      findOffenders(
        '.bip-x { border-color: var(--color-primary-hover); background-color: var(--color-primary-hover); }',
        'x/x.css'
      )
    ).toEqual([]);
  });
});
