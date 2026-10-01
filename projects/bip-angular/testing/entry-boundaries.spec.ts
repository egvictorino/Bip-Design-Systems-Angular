import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');

/**
 * Un secondary entry point es cualquier directorio de primer nivel con su propio
 * `ng-package.json` — igual criterio que ng-packagr usa para decidir qué se publica.
 * `core` se excluye: es el único entry al que SÍ se le permite ser importado por relativo
 * desde dentro de sí mismo (import `../theme` desde `core/src/overlay`, etc.) y nada fuera
 * de `core` debería importarlo por ruta relativa en primer lugar.
 */
const ENTRY_DIRS = readdirSync(SRC_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'core')
  .filter((entry) => {
    try {
      return statSync(resolve(SRC_DIR, entry.name, 'ng-package.json')).isFile();
    } catch {
      return false;
    }
  })
  .map((entry) => entry.name);

const IMPORT_RE = /from\s+['"](\.[^'"]*)['"]/g;

/**
 * Cobertura: `*.component.ts`, `*.directive.ts`, `*.service.ts`, `*.pipe.ts`, `index.ts` y
 * `public-api.ts` de cada entry — se excluyen `*.spec.ts` y `*.stories.ts` porque ninguno de
 * los dos se publica (ng-packagr solo empaqueta lo que `public-api.ts` reexporta).
 */
function isScannedSourceFile(name: string): boolean {
  if (name.endsWith('.spec.ts') || name.endsWith('.stories.ts')) return false;
  return name.endsWith('.ts');
}

describe('límites entre secondary entries — sin imports relativos cruzados', () => {
  it('ningún entry importa por ruta relativa fuera de su propio directorio', () => {
    const violations: string[] = [];

    for (const entry of ENTRY_DIRS) {
      const entryDir = resolve(SRC_DIR, entry);
      const files = findFiles(entryDir, isScannedSourceFile);

      for (const file of files) {
        const content = readFileSync(file, 'utf-8');
        for (const match of content.matchAll(IMPORT_RE)) {
          const specifier = match[1];
          const resolved = resolve(dirname(file), specifier);
          const relFromEntry = relative(entryDir, resolved);
          // Un import relativo que sale del propio directorio del entry (empieza con '..'
          // tras resolverlo) cruza a otro entry, a `core`, o a `projects/bip-angular` — en
          // los tres casos debe usar el alias de paquete (`@bip-design-systems/angular/x`),
          // nunca una ruta relativa: eso rompe el tree-shaking por entry de ng-packagr y
          // acopla el build de un componente al árbol de archivos de otro.
          if (relFromEntry.startsWith('..')) {
            violations.push(`${relative(SRC_DIR, file)} → '${specifier}'`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
