import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');

/**
 * Único lugar permitido para `inject(Overlay)`/`import { Overlay } ... from
 * '@angular/cdk/overlay'` como valor — todo lo demás debe pasar por `BipOverlay`
 * (`core/src/overlay/bip-overlay.service.ts`), que reexpone `position()` y
 * `scrollStrategies` para no forzar a cada componente a inyectar el `Overlay` del CDK
 * directo. Ver docs/plan-maestro.md § Bloque 2 y CLAUDE.md § Reglas de código.
 */
const ALLOWED_PATH = 'core/src/overlay/bip-overlay.service.ts';

function isScannedSourceFile(name: string): boolean {
  if (name.endsWith('.spec.ts') || name.endsWith('.stories.ts')) return false;
  return name.endsWith('.ts');
}

describe('todo overlay pasa por BipOverlay — sin Overlay (CDK) inyectado directo', () => {
  it('inject(Overlay) / import de Overlay como valor no aparece fuera de bip-overlay.service.ts', () => {
    const offenders = findFiles(SRC_DIR, isScannedSourceFile)
      .map((path) => ({ path, relPath: relative(SRC_DIR, path).replace(/\\/g, '/') }))
      .filter(({ relPath }) => relPath !== ALLOWED_PATH)
      .filter(({ path }) => {
        const content = readFileSync(path, 'utf-8');
        return (
          /\binject\(Overlay\)/.test(content) ||
          // `type Overlay` o `import type { Overlay }` no construye el servicio — solo
          // interesa el import de valor, que es el que permite llamar `new Overlay()`/DI.
          /import\s*\{[^}]*(?<!type\s)\bOverlay\b[^}]*\}\s*from\s*['"]@angular\/cdk\/overlay['"]/.test(
            content
          )
        );
      })
      .map((o) => o.relPath);

    expect(offenders).toEqual([]);
  });
});
