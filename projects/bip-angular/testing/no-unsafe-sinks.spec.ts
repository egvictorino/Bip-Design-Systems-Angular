import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');

/**
 * Sinks de HTML/URL/código dinámico que la librería no debe usar nunca — ver CLAUDE.md
 * § Bloque 11 (security review). Angular ya sanitiza los bindings de propiedad (`[href]`,
 * `[src]`) de forma segura; lo que se prohíbe es saltarse esa sanitización (`innerHTML`,
 * `bypassSecurityTrust*`, `[attr.href]`/`[attr.src]` sin sanitizar) o ejecutar código desde
 * un string (`eval`, `new Function`).
 */
const FORBIDDEN_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: 'innerHTML', re: /\binnerHTML\b/ },
  { name: 'outerHTML', re: /\bouterHTML\b/ },
  { name: 'insertAdjacentHTML', re: /\binsertAdjacentHTML\b/ },
  { name: 'bypassSecurityTrust*', re: /\bbypassSecurityTrust\w*/ },
  { name: '[attr.href]', re: /\[attr\.href\]/ },
  { name: '[attr.src]', re: /\[attr\.src\]/ },
  { name: 'eval(', re: /\beval\(/ },
  { name: 'new Function(', re: /\bnew Function\(/ },
];

/**
 * `theme-init-script.spec.ts` ejecuta a propósito el string generado por
 * `getThemeInitScript()` con `new Function(script)()` para verificar su comportamiento —
 * es el único uso legítimo en todo el repo y vive en un `*.spec.ts`, que no se publica.
 */
function isScannedFile(name: string): boolean {
  if (name.endsWith('.spec.ts') || name.endsWith('.stories.ts')) return false;
  return name.endsWith('.ts') || name.endsWith('.html');
}

describe('sin sinks de HTML/URL/código inseguros', () => {
  it('innerHTML, bypassSecurityTrust*, [attr.href|src], eval y new Function no aparecen en código publicado', () => {
    const offenders: string[] = [];

    for (const file of findFiles(SRC_DIR, isScannedFile)) {
      const content = readFileSync(file, 'utf-8');
      for (const { name, re } of FORBIDDEN_PATTERNS) {
        if (re.test(content)) {
          offenders.push(`${relative(SRC_DIR, file).replace(/\\/g, '/')}: ${name}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
