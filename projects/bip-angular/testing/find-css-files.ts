import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Helper compartido por los guards de estilos (testing/*.spec.ts). Cada guard filtra
 * después por sufijo (*.component.css vs cualquier *.css) — ver CLAUDE.md § Bloque 1.
 */
export function findFiles(dir: string, matches: (name: string) => boolean): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
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
