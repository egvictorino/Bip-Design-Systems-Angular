import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findComponentCssFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');

/**
 * Componentes con propiedades físicas (left/right/margin-left/etc.) documentadas a
 * propósito, no accidentales — cada uno debe tener el comentario justificativo en el
 * propio *.component.css. Candidatos futuros (ver CLAUDE.md § Reglas de código):
 * DrawerPanel `placement`, Toast `position`, Tooltip `position` (su `align` sí es
 * lógico y debe usar inset-inline-start/end).
 */
const PHYSICAL_BY_DESIGN_ALLOWLIST = new Set<string>([
  'drawer-panel/drawer-panel.component.css',
  'toast/toast-region.component.css',
]);

const PHYSICAL_PROP_RE =
  /\b(margin-left|margin-right|padding-left|padding-right|border-left(-\w+)?|border-right(-\w+)?|left|right)\s*:/g;
const TEXT_ALIGN_RE = /text-align\s*:\s*(left|right)\s*;/g;

describe('propiedades lógicas para RTL en lugar de físicas fuera del allowlist justificado', () => {
  it('margin/padding/border-left|right y text-align: left|right no aparecen fuera de PHYSICAL_BY_DESIGN_ALLOWLIST', () => {
    const offenders = findComponentCssFiles(SRC_DIR)
      .map((path) => ({ path, relPath: relative(SRC_DIR, path).replace(/\\/g, '/') }))
      .filter(({ relPath }) => !PHYSICAL_BY_DESIGN_ALLOWLIST.has(relPath))
      .filter(({ path }) => {
        const css = readFileSync(path, 'utf-8');
        return (
          [...css.matchAll(PHYSICAL_PROP_RE)].length > 0 ||
          [...css.matchAll(TEXT_ALIGN_RE)].length > 0
        );
      });

    expect(offenders.map((o) => o.relPath)).toEqual([]);
  });
});
