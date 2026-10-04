import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { contrastRatio } from '../core/src/utils/contrast';

const TOKENS_CSS_PATH = resolve(__dirname, '../styles/tokens.css');

/**
 * WCAG AA para texto normal — mismo umbral que bipTheme's warnIfLowContrast() usará
 * en el Bloque 2 (ver ThemeProvider.tsx AA_CONTRAST_THRESHOLD en la referencia React).
 */
const AA_CONTRAST_THRESHOLD = 4.5;

/**
 * Pares semilla de relleno ←→ --color-txt-on-* que bipTheme (Bloque 2) recalculará en
 * runtime con pickReadableText() cuando el consumidor sobrescriba la semilla. Aquí solo
 * se verifica que los valores por defecto del sistema ya cumplen AA — ver el límite
 * documentado abajo.
 */
const FILL_PAIRS: Array<[seed: string, onText: string]> = [
  ['color-primary', 'color-txt-on-primary'],
  ['color-danger', 'color-txt-on-danger'],
  ['color-success', 'color-txt-on-success'],
  ['color-warning', 'color-txt-on-warning'],
  ['color-info', 'color-txt-on-info'],
  ['color-unique', 'color-txt-on-unique'],
];

const extractBlock = (css: string, selectorPattern: RegExp): string => {
  const match = css.match(selectorPattern);
  if (!match) throw new Error(`No se encontró el bloque para ${selectorPattern}`);
  return match[1];
};

/**
 * A diferencia de tokens.spec.ts (solo nombres), acá se necesita el valor — pero solo
 * para hex literales: los derivados con color-mix() no se pueden resolver sin un motor
 * CSS real, así que se excluyen y se devuelve un Map parcial. Ver el límite documentado
 * abajo.
 */
const extractHexValues = (block: string): Map<string, string> => {
  const map = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    const trimmed = value.trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) map.set(name, trimmed);
  }
  return map;
};

describe('styles/tokens.css — contraste WCAG AA de tokens reales (no solo la función contrastRatio)', () => {
  const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8');
  const lightValues = extractHexValues(
    extractBlock(tokensCss, /\[data-color-scheme='light'\]\s*{([^}]*)}/s)
  );
  const darkValues = extractHexValues(
    extractBlock(tokensCss, /\[data-color-scheme='dark'\]\s*{([^}]*)}/s)
  );

  /**
   * Límite explícito de esta suite: solo evalúa pares cuyo valor en tokens.css es un hex
   * literal — las 6 semillas de relleno contra su --color-txt-on-*, y el par base
   * --color-txt / --color-surface-1. Los derivados con color-mix() (hover, press, light,
   * subtle, text, etc.) no se pueden resolver a un hex concreto sin un motor CSS real —
   * ese contraste renderizado lo cubrirá @axe-core/playwright en visual/a11y-browser.spec.ts
   * (Bloque 11), corriendo axe con color-contrast activado en un navegador de verdad. No
   * asumir que esta suite cubre toda la paleta: cubre las semillas de fill, que es lo único
   * que bipTheme recalculará en runtime vía pickReadableText() (Bloque 2).
   */
  describe.each(['light', 'dark'] as const)('esquema %s', (scheme) => {
    const values = scheme === 'light' ? lightValues : darkValues;

    it.each(FILL_PAIRS)('%s alcanza 4.5:1 contra su %s', (seedVar, onTextVar) => {
      const seedHex = values.get(seedVar);
      const onTextHex = values.get(onTextVar);

      expect(seedHex, `--${seedVar} no se encontró como hex literal en tokens.css`).toBeDefined();
      expect(
        onTextHex,
        `--${onTextVar} no se encontró como hex literal en tokens.css`
      ).toBeDefined();

      const ratio = contrastRatio(seedHex!, onTextHex!);
      expect(
        ratio,
        `--${seedVar}(${seedHex}) vs --${onTextVar}(${onTextHex}) = ${ratio.toFixed(2)}:1, mínimo ${AA_CONTRAST_THRESHOLD}:1`
      ).toBeGreaterThanOrEqual(AA_CONTRAST_THRESHOLD);
    });

    it('--color-txt alcanza 4.5:1 contra --color-surface-1', () => {
      const txt = values.get('color-txt');
      const surface = values.get('color-surface-1');
      expect(txt).toBeDefined();
      expect(surface).toBeDefined();

      const ratio = contrastRatio(txt!, surface!);
      expect(
        ratio,
        `--color-txt(${txt}) vs --color-surface-1(${surface}) = ${ratio.toFixed(2)}:1, mínimo ${AA_CONTRAST_THRESHOLD}:1`
      ).toBeGreaterThanOrEqual(AA_CONTRAST_THRESHOLD);
    });

    /**
     * Texto atenuado de calendar-grid: días de otro mes (--color-txt-utility sobre el panel) y
     * sobre --color-secondary en rango/hover (--color-txt-secondary).
     */
    it.each([
      ['color-txt-utility', 'color-surface-1'],
      ['color-txt-secondary', 'color-secondary'],
    ])('--%s alcanza 4.5:1 contra --%s', (fgVar, bgVar) => {
      const fg = values.get(fgVar);
      const bg = values.get(bgVar);
      expect(fg).toBeDefined();
      expect(bg).toBeDefined();

      const ratio = contrastRatio(fg!, bg!);
      expect(
        ratio,
        `--${fgVar}(${fg}) vs --${bgVar}(${bg}) = ${ratio.toFixed(2)}:1, mínimo ${AA_CONTRAST_THRESHOLD}:1`
      ).toBeGreaterThanOrEqual(AA_CONTRAST_THRESHOLD);
    });

    /**
     * Texto atenuado de calendar (vista mes y agenda): días de otro mes sobre el fondo de la
     * story/app (--color-surface-2) y en rango (--color-secondary), texto del filtro inactivo
     * (--color-surface-3) y del evento cancelado (--color-surface-4: relleno del badge/filtro `cancelled`; el fondo del mes es el de la story/app, se asume surface-2).
     */
    it.each([
      ['color-txt-utility', 'color-surface-2'],
      ['color-txt-secondary', 'color-surface-2'],
      ['color-txt-secondary', 'color-surface-3'],
      ['color-txt', 'color-surface-4'],
    ])('--%s alcanza 4.5:1 contra --%s (calendar)', (fgVar, bgVar) => {
      const fg = values.get(fgVar);
      const bg = values.get(bgVar);
      expect(fg).toBeDefined();
      expect(bg).toBeDefined();

      const ratio = contrastRatio(fg!, bg!);
      expect(
        ratio,
        `--${fgVar}(${fg}) vs --${bgVar}(${bg}) = ${ratio.toFixed(2)}:1, mínimo ${AA_CONTRAST_THRESHOLD}:1`
      ).toBeGreaterThanOrEqual(AA_CONTRAST_THRESHOLD);
    });
  });
});

/**
 * Resolver mínimo para los derivados de marca: `#hex`, `var(--x)` y
 * `color-mix(in srgb, var(--x), white|black N%)`, usando los valores del propio bloque de
 * tokens.css (jsdom no resuelve color-mix). Cubre solo esas formas; cualquier otra lanza.
 */
const channels = (hex: string): number[] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]): string =>
  '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

const resolveToken = (name: string, block: string, depth = 0): string => {
  if (depth > 5) throw new Error(`Referencia circular resolviendo --${name}`);
  const raw = block
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]
    ?.trim();
  if (!raw) throw new Error(`--${name} no está declarado en el bloque`);
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
  const ref = raw.match(/^var\(--([\w-]+)\)$/);
  if (ref) return resolveToken(ref[1]!, block, depth + 1);
  const mix = raw.match(/^color-mix\(in srgb,\s*var\(--([\w-]+)\),\s*(white|black)\s+(\d+)%\)$/);
  if (!mix) throw new Error(`Forma no soportada para --${name}: ${raw}`);
  const base = channels(resolveToken(mix[1]!, block, depth + 1));
  const target = mix[2] === 'white' ? 255 : 0;
  const p = Number(mix[3]) / 100;
  return toHex(base.map((v) => v * (1 - p) + target * p));
};

describe('styles/tokens.css — hover/press de primary (derivados con color-mix resueltos)', () => {
  const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8');
  const blocks = {
    light: extractBlock(tokensCss, /\[data-color-scheme='light'\]\s*{([^}]*)}/s),
    dark: extractBlock(tokensCss, /\[data-color-scheme='dark'\]\s*{([^}]*)}/s),
  };

  // Anclas documentadas: si cambia la semilla o el porcentaje, el resolver y estos hex deben
  // seguir de acuerdo.
  it.each([
    ['light', 'color-primary-hover', '#1f2b99'],
    ['light', 'color-primary-press', '#151d66'],
    ['dark', 'color-primary-hover', '#4758c5'],
    ['dark', 'color-primary-press', '#3b49a2'],
    ['dark', 'color-edge-primary-hover', '#6e7feb'],
  ] as const)('%s: --%s resuelve a %s', (scheme, token, expected) => {
    expect(resolveToken(token, blocks[scheme])).toBe(expected);
  });

  describe.each(['light', 'dark'] as const)('esquema %s', (scheme) => {
    it.each(['color-primary-hover', 'color-primary-press'])(
      '--%s alcanza 4.5:1 contra --color-txt-on-primary',
      (token) => {
        const fill = resolveToken(token, blocks[scheme]);
        const text = resolveToken('color-txt-on-primary', blocks[scheme]);
        const ratio = contrastRatio(fill, text);
        expect(
          ratio,
          `--${token}(${fill}) vs --color-txt-on-primary(${text}) = ${ratio.toFixed(2)}:1`
        ).toBeGreaterThanOrEqual(AA_CONTRAST_THRESHOLD);
      }
    );

    it('--color-edge-primary-hover alcanza 3:1 (non-text) contra --color-field', () => {
      const edge = resolveToken('color-edge-primary-hover', blocks[scheme]);
      const field = resolveToken('color-field', blocks[scheme]);
      const ratio = contrastRatio(edge, field);
      expect(ratio, `${edge} vs ${field} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3);
    });
  });
});
