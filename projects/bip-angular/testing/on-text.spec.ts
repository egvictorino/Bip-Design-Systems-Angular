import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findComponentCssFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');

/**
 * Componentes donde --color-txt-white es intencional (fondo fijo, no una semilla
 * de marca overrideable) — cada entrada debe tener su comentario justificativo en
 * el propio *.component.css. Se puebla a partir del Bloque 4/6/7 (Sidebar dark,
 * Spinner inverse, Avatar fallback...) — ver CLAUDE.md § Reglas de código.
 */
const ALLOWLIST = new Set<string>([
  // Spinner variant="inverse": color fijo pensado para superficies oscuras (sidebar dark,
  // overlays con scrim), no un texto sobre un fill de marca recalculable por contraste.
  'spinner/spinner.component.css',
]);

describe('--color-txt-white no se usa fuera del allowlist justificado', () => {
  it('todo componente que pinte texto sobre un fill de marca debe usar --color-txt-on-*, no --color-txt-white', () => {
    const offenders = findComponentCssFiles(SRC_DIR)
      .map((path) => ({ path, relPath: relative(SRC_DIR, path).replace(/\\/g, '/') }))
      .filter(({ relPath }) => !ALLOWLIST.has(relPath))
      .filter(({ path }) => readFileSync(path, 'utf-8').includes('--color-txt-white'));

    expect(offenders.map((o) => o.relPath)).toEqual([]);
  });
});
