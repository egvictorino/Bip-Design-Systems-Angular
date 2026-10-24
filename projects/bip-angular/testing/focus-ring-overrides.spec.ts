import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findComponentCssFiles } from './find-css-files';
import { lastValue, parseRules } from './focus-ring-rules';

const SRC_DIR = resolve(__dirname, '..');
const read = (rel: string) => readFileSync(resolve(SRC_DIR, rel), 'utf-8');
const norm = (value: string | undefined) => value?.replace(/\s+/g, ' ').trim();

/**
 * Un custom property se sustituye donde se declara: `--focus-ring` en :root nunca vería un
 * `--focus-ring-color` local. `styles/base.css` lo re-declara en cada elemento (`*`, `::before`,
 * `::after`) con la misma expresión que `primitives.css`, y así los overrides locales funcionan.
 */
describe('anillo de foco — overrides locales de --focus-ring-color', () => {
  const ringOf = (css: string, selector: string) =>
    norm(
      lastValue(
        parseRules(css).find((r) => r.selectors.includes(selector)) ?? {
          selectors: [],
          declarations: [],
          context: [],
        },
        '--focus-ring'
      )
    );

  it('base.css, :root y [data-color-scheme] declaran la misma expresión de --focus-ring', () => {
    const base = parseRules(read('styles/base.css')).find(
      (r) =>
        ['*', '*::before', '*::after'].every((s) => r.selectors.includes(s)) &&
        r.declarations.some((d) => d.prop === '--focus-ring')
    );
    expect(base, 'regla universal con --focus-ring en base.css').toBeDefined();
    const canonical = ringOf(read('styles/primitives.css'), ':root');
    expect(canonical).toBeDefined();
    expect(norm(lastValue(base!, '--focus-ring'))).toBe(canonical);
    expect(ringOf(read('styles/primitives.css'), '[data-color-scheme]')).toBe(canonical);
  });

  const files = findComponentCssFiles(SRC_DIR).map((f) => [relative(SRC_DIR, f), f] as const);

  it('encuentra los CSS de componente', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('ningún componente declara --focus-ring: pisaría la regla de base.css', () => {
    const offenders = files.flatMap(([rel, file]) =>
      parseRules(readFileSync(file, 'utf-8'))
        .filter((r) => r.declarations.some((d) => d.prop === '--focus-ring'))
        .map((r) => `${rel} :: ${r.selectors.join(', ')}`)
    );
    expect(offenders).toEqual([]);
  });

  /**
   * Colores de anillo permitidos como override local, con su contraste contra el hueco
   * `--color-surface-1` (sRGB): danger 5.45:1 en light y 6.14:1 en dark. `currentColor` y
   * `--color-secondary` NO: success/warning darían 2.28:1/1.92:1 y secondary ~1.2:1 (WCAG 1.4.11).
   */
  const ALLOWED_OVERRIDES: Record<string, string> = {
    'var(--color-danger)': 'estados de error: 5.45:1 (light) y 6.14:1 (dark)',
  };

  it('todo --focus-ring-color local es un color permitido', () => {
    const offenders = files.flatMap(([rel, file]) =>
      parseRules(readFileSync(file, 'utf-8')).flatMap((r) => {
        const value = norm(lastValue(r, '--focus-ring-color'));
        return value !== undefined && !Object.hasOwn(ALLOWED_OVERRIDES, value)
          ? [`${rel} :: ${r.selectors.join(', ')} { --focus-ring-color: ${value} }`]
          : [];
      })
    );
    expect(offenders).toEqual([]);
  });

  it('la allowlist de overrides sigue en uso (declaración real, no comentario)', () => {
    const used = new Set(
      files.flatMap(([, file]) =>
        parseRules(readFileSync(file, 'utf-8')).flatMap((r) => {
          const value = norm(lastValue(r, '--focus-ring-color'));
          return value === undefined ? [] : [value];
        })
      )
    );
    for (const value of Object.keys(ALLOWED_OVERRIDES)) expect(used.has(value), value).toBe(true);
  });
});
