import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findComponentCssFiles } from './find-css-files';
import { BREAKPOINTS } from '../core/src/utils/breakpoints';

const SRC_DIR = resolve(__dirname, '..');

const VALID_PX_VALUES = new Set(Object.values(BREAKPOINTS).map((n) => `${n}px`));

/**
 * `@media` cuyo umbral no está en la escala BREAKPOINTS, documentado con el comentario
 * al lado en el propio archivo — mismo patrón que OUTLIER_VALUES en spacing.spec.ts.
 */
const OUTLIER_ALLOWLIST = new Set<string>([]);

const MEDIA_WIDTH_RE = /@media\s*\([^)]*(?:min|max)-width:\s*([\d.]+px)[^)]*\)/g;

describe('@media (min|max-width) usa la escala BREAKPOINTS, no literales', () => {
  it('todo breakpoint es uno de sm/md/lg/xl o un outlier documentado en OUTLIER_ALLOWLIST', () => {
    const offenders = findComponentCssFiles(SRC_DIR)
      .map((path) => ({ path, relPath: relative(SRC_DIR, path).replace(/\\/g, '/') }))
      .filter(({ relPath }) => !OUTLIER_ALLOWLIST.has(relPath))
      .map(({ path, relPath }) => {
        const css = readFileSync(path, 'utf-8');
        const offending = [...css.matchAll(MEDIA_WIDTH_RE)]
          .map((m) => m[1])
          .filter((px) => !VALID_PX_VALUES.has(px));
        return { relPath, offending };
      })
      .filter(({ offending }) => offending.length > 0);

    expect(offenders).toEqual([]);
  });
});
