import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Directorios que nunca son código propio — node_modules aparece dentro de
 * projects/bip-angular desde que el repo es un workspace pnpm (pnpm-workspace.yaml);
 * sin esta exclusión los guards escanean CSS de vendors (@angular/cdk,
 * @fontsource-variable/*) en vez de solo el CSS que publicamos.
 */
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', '.angular', 'storybook-static']);

/**
 * Helper compartido por los guards de estilos (testing/*.spec.ts). Cada guard filtra
 * después por sufijo (*.component.css vs cualquier *.css) — ver CLAUDE.md § Bloque 1.
 */
export function findFiles(dir: string, matches: (name: string) => boolean): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...findFiles(fullPath, matches));
    } else if (matches(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

export function findComponentCssFiles(dir: string): string[] {
  return findFiles(dir, (name) => name.endsWith('.component.css'));
}

export function findAllCssFiles(dir: string): string[] {
  return findFiles(dir, (name) => name.endsWith('.css'));
}
